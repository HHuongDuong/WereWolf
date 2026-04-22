package com.werewolf.gameplay.service;

import com.werewolf.gameplay.kafka.GameEventProducer;
import com.werewolf.gameplay.lock.RedisLockService;
import com.werewolf.gameplay.model.GamePhase;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.NightActions;
import com.werewolf.gameplay.model.PlayerState;
import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.NightActionEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NightPhaseService {

    private final GameStateRepository repo;
    private final RedisLockService lockService;
    private final GameEventProducer producer;
    private final EndGameService endGameService;
    private static final List<String> NIGHT_ORDER = List.of("GUARD", "SEER", "WEREWOLF", "WITCH");

    public void handleNightAction(NightActionEvent event) {
        if (repo.isProcessed(event.getEventId())) return;

        String actorRole = normalizeRole(event.getRole());
        boolean shouldAdvanceAfterAction = false;
        if (!lockService.tryLock(event.getRoomId())) return;
        try {
            GameState state = repo.get(event.getRoomId());
            if (state == null || state.getPhase() != GamePhase.NIGHT) return;

            String currentRole = normalizeRole(state.getCurrentNightRole());
            if (currentRole == null || !currentRole.equals(actorRole)) return;

            PlayerState actor = state.getPlayers().get(event.getPlayerId());
            if (actor == null || !actor.isAlive() || !actorRole.equals(normalizeRole(actor.getRole()))) return;
            if (event.getTargetId() != null) {
                PlayerState target = state.getPlayers().get(event.getTargetId());
                if (target == null || !target.isAlive()) return;
            }

            NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
            state.setNightActions(actions);

            if (!applyNightAction(state, event, actorRole)) {
                return;
            }

            repo.save(event.getRoomId(), state);
            repo.markProcessed(event.getEventId());
            shouldAdvanceAfterAction = !"WEREWOLF".equals(actorRole) || allAliveWolvesVoted(state);
        } finally {
            lockService.releaseLock(event.getRoomId());
        }

        if (shouldAdvanceAfterAction) {
            advanceNightPhase(event.getRoomId());
        }
    }

    private boolean applyNightAction(GameState state, NightActionEvent event, String role) {
        NightActions actions = state.getNightActions();

        return switch (role) {
            case "GUARD" -> {
                if (event.getTargetId() == null || event.getTargetId().equals(state.getLastGuardedId())
                        || actions.getGuardTarget() != null) {
                    yield false;
                }
                actions.setGuardTarget(event.getTargetId());
                yield true;
            }
            case "SEER" -> {
                if (event.getTargetId() == null || actions.getSeerTarget() != null) {
                    yield false;
                }
                actions.setSeerTarget(event.getTargetId());
                yield true;
            }
            case "WEREWOLF" -> {
                PlayerState targetPlayer = state.getPlayers().get(event.getTargetId());
                if (event.getTargetId() == null || targetPlayer == null
                        || "WEREWOLF".equalsIgnoreCase(targetPlayer.getRole())) {
                    yield false;
                }
                if (actions.getWolfVotes() == null) {
                    actions.setWolfVotes(new HashMap<>());
                }
                actions.getWolfVotes().put(event.getPlayerId(), event.getTargetId());
                yield true;
            }
            case "WITCH" -> {
                if (event.getTargetId() == null) {
                    if (!state.getWitchPotions().isSavePotion()
                            || actions.getWolfTarget() == null
                            || actions.getWitchSaved() != null) {
                        yield false;
                    }
                    actions.setWitchSaved(actions.getWolfTarget());
                    state.getWitchPotions().setSavePotion(false);
                    yield true;
                }
                if (!state.getWitchPotions().isKillPotion() || actions.getWitchPoisoned() != null) {
                    yield false;
                }
                actions.setWitchPoisoned(event.getTargetId());
                state.getWitchPotions().setKillPotion(false);
                yield true;
            }
            default -> false;
        };
    }

    private boolean hasAliveRole(GameState state, String role) {
        return state.getPlayers().values().stream()
                .anyMatch(player -> player.isAlive() && normalizeRole(role).equals(normalizeRole(player.getRole())));
    }

    public void advanceNightPhase(String roomId) {
        if (!lockService.tryLock(roomId)) return;
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.NIGHT) return;

            if ("WEREWOLF".equals(normalizeRole(state.getCurrentNightRole()))) {
                finalizeWolfTarget(state);
            }

            String nextRole = findNextNightRole(state, state.getCurrentNightRole());
            if (nextRole == null) {
                resolveNightLocked(roomId, state);
                return;
            }

            state.setCurrentNightRole(nextRole);
            long durationSec = getNightDuration(state, nextRole);
            state.setPhaseDeadline(System.currentTimeMillis() + (durationSec * 1000L));
            repo.save(roomId, state);

            publishNightWindow(roomId, state);
        } finally {
            lockService.releaseLock(roomId);
        }
    }

    public void resolveNight(String roomId) {
        if (!lockService.tryLock(roomId)) return;
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.NIGHT) return;
            resolveNightLocked(roomId, state);
        } finally {
            lockService.releaseLock(roomId);
        }
    }

    private void resolveNightLocked(String roomId, GameState state) {
        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        String wolfTarget = actions.getWolfTarget();
        String guardTarget = actions.getGuardTarget();
        String witchSaved = actions.getWitchSaved();
        String witchPoisoned = actions.getWitchPoisoned();

        List<String> newlyDeadPlayers = new ArrayList<>();
        if (wolfTarget != null && !wolfTarget.equals(guardTarget) && !wolfTarget.equals(witchSaved)) {
            newlyDeadPlayers.add(wolfTarget);
        }
        if (witchPoisoned != null && !newlyDeadPlayers.contains(witchPoisoned)) {
            newlyDeadPlayers.add(witchPoisoned);
        }

        for (String deadPlayerId : newlyDeadPlayers) {
            PlayerState player = state.getPlayers().get(deadPlayerId);
            if (player != null) {
                player.setAlive(false);
            }
        }

        state.setLastGuardedId(guardTarget);
        state.setCurrentNightRole(null);
        state.setNightActions(new NightActions());
        state.getPlayers().values().forEach(p -> p.setProtectedThisNight(false));

        if (!newlyDeadPlayers.isEmpty() && endGameService.checkEndGame(roomId, state)) {
            return;
        }

        state.setPhase(GamePhase.DISCUSS);
        long durationSec = state.getConfig() != null ? state.getConfig().getOrDefault("discussDuration", 60) : 60;
        state.setPhaseDeadline(System.currentTimeMillis() + (durationSec * 1000L));
        repo.save(roomId, state);

        List<String> alivePlayerIds = state.getPlayers().entrySet().stream()
                .filter(e -> e.getValue().isAlive())
                .map(Map.Entry::getKey)
                .toList();

        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(roomId)
                .phase("day")
                .round(state.getRound())
                .deadlineTimestamp(state.getPhaseDeadline())
                .currentNightRole(null)
                .metadata(new PhaseChangedEvent.Metadata(newlyDeadPlayers, null))
                .build());

        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("wolves").enabled(false)
                .allowedGuestIds(List.of())
                .round(state.getRound()).build());
        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("all").enabled(true)
                .allowedGuestIds(alivePlayerIds)
                .round(state.getRound()).build());
    }

    private String findNextNightRole(GameState state, String currentNightRole) {
        int currentIndex = currentNightRole == null ? -1 : NIGHT_ORDER.indexOf(normalizeRole(currentNightRole));
        for (int i = currentIndex + 1; i < NIGHT_ORDER.size(); i++) {
            String role = NIGHT_ORDER.get(i);
            if (shouldOpenWindow(state, role)) {
                return role;
            }
        }
        return null;
    }

    private boolean shouldOpenWindow(GameState state, String role) {
        return switch (role) {
            case "GUARD", "SEER", "WEREWOLF" -> hasAliveRole(state, role);
            case "WITCH" -> hasAliveRole(state, role)
                    && (state.getWitchPotions().isSavePotion() || state.getWitchPotions().isKillPotion());
            default -> false;
        };
    }

    private boolean allAliveWolvesVoted(String roomId) {
        GameState state = repo.get(roomId);
        if (state == null || state.getPhase() != GamePhase.NIGHT) {
            return false;
        }
        return allAliveWolvesVoted(state);
    }

    private boolean allAliveWolvesVoted(GameState state) {
        Set<String> aliveWolfIds = getAliveWolfIds(state);
        if (aliveWolfIds.isEmpty()) {
            return true;
        }
        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        Map<String, String> wolfVotes = Optional.ofNullable(actions.getWolfVotes()).orElseGet(Map::of);
        return wolfVotes.keySet().containsAll(aliveWolfIds);
    }

    private Set<String> getAliveWolfIds(GameState state) {
        return state.getPlayers().entrySet().stream()
                .filter(entry -> entry.getValue().isAlive()
                        && "WEREWOLF".equals(normalizeRole(entry.getValue().getRole())))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    private void finalizeWolfTarget(GameState state) {
        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        state.setNightActions(actions);
        Map<String, String> wolfVotes = Optional.ofNullable(actions.getWolfVotes()).orElseGet(Map::of);

        String resolvedTarget = wolfVotes.values().stream()
                .collect(Collectors.groupingBy(target -> target, Collectors.counting()))
                .entrySet().stream()
                .max(Comparator.<Map.Entry<String, Long>>comparingLong(Map.Entry::getValue)
                        .thenComparing(Map.Entry::getKey))
                .map(Map.Entry::getKey)
                .orElse(null);

        actions.setWolfTarget(resolvedTarget);
    }

    private long getNightDuration(GameState state, String role) {
        Map<String, Integer> config = state.getConfig();
        if (config == null) {
            return switch (role) {
                case "GUARD", "SEER", "WITCH" -> 30L;
                case "WEREWOLF" -> 45L;
                default -> 30L;
            };
        }
        return switch (role) {
            case "GUARD" -> config.getOrDefault("guardDuration", 30);
            case "SEER" -> config.getOrDefault("seerDuration", 30);
            case "WEREWOLF" -> config.getOrDefault("werewolfDuration", 45);
            case "WITCH" -> config.getOrDefault("witchDuration", 30);
            default -> 30;
        };
    }

    private void publishNightWindow(String roomId, GameState state) {
        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(roomId)
                .phase("night")
                .round(state.getRound())
                .deadlineTimestamp(state.getPhaseDeadline())
                .currentNightRole(normalizeRole(state.getCurrentNightRole()))
                .metadata(new PhaseChangedEvent.Metadata(List.of(), null))
                .build());

        boolean wolvesEnabled = "WEREWOLF".equals(normalizeRole(state.getCurrentNightRole()));
        List<String> wolves = wolvesEnabled
                ? state.getPlayers().entrySet().stream()
                        .filter(e -> e.getValue().isAlive() && "WEREWOLF".equals(normalizeRole(e.getValue().getRole())))
                        .map(Map.Entry::getKey)
                        .toList()
                : List.of();

        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("wolves").enabled(wolvesEnabled)
                .allowedGuestIds(wolves)
                .round(state.getRound()).build());
        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("all").enabled(false)
                .allowedGuestIds(List.of())
                .round(state.getRound()).build());
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        return switch (role.toUpperCase()) {
            case "DOCTOR" -> "GUARD";
            case "WEREWOLF_KILL" -> "WEREWOLF";
            default -> role.toUpperCase();
        };
    }
}
