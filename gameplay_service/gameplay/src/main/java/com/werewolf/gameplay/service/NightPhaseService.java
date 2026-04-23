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
    private static final String HUNTER_PHASE_FROM_NIGHT = "NIGHT";
    private static final String HUNTER_PHASE_FROM_DAY = "DAY";

    public void handleNightAction(NightActionEvent event) {
        if (repo.isProcessed(event.getEventId())) return;

        String actorRole = normalizeRole(event.getRole());
        boolean handledHunterAction = false;
        boolean shouldAdvanceAfterAction = false;
        boolean shouldRequestWerewolfVote = false;
        if (!lockService.tryLock(event.getRoomId())) return;
        try {
            GameState state = repo.get(event.getRoomId());
            if (state == null) return;

            if (state.getPhase() == GamePhase.HUNTER) {
                handledHunterAction = handleHunterActionLocked(event.getRoomId(), state, event, actorRole);
                if (handledHunterAction) {
                    repo.markProcessed(event.getEventId());
                }
            } else {
                if (state.getPhase() != GamePhase.NIGHT) return;

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
                if ("WEREWOLF".equals(actorRole)) {
                    shouldRequestWerewolfVote = allAliveWolvesVoted(state)
                            && shouldTriggerWerewolfVote(event.getRoomId(), state);
                } else {
                    shouldAdvanceAfterAction = true;
                }
            }
        } finally {
            lockService.releaseLock(event.getRoomId());
        }

        if (shouldRequestWerewolfVote) {
            publishWerewolfVoteRequest(event.getRoomId());
        }
        if (shouldAdvanceAfterAction) {
            advanceNightPhase(event.getRoomId());
        }
        if (handledHunterAction) {
            continueAfterHunterAction(event.getRoomId());
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

            if ("WEREWOLF".equals(normalizeRole(state.getCurrentNightRole())) && state.getNightActions() != null
                    && state.getNightActions().getWolfTarget() == null) {
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

        String hunterId = findDeadHunter(state, newlyDeadPlayers);
        if (hunterId != null) {
            enterHunterPhase(roomId, state, hunterId, HUNTER_PHASE_FROM_NIGHT, newlyDeadPlayers, null);
            return;
        }

        if (!newlyDeadPlayers.isEmpty() && endGameService.checkEndGame(roomId, state)) {
            return;
        }

        moveToDiscuss(roomId, state, newlyDeadPlayers);
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

    public void handleWolfVoteResult(com.werewolf.gameplay.model.events.VoteResultEvent event) {
        String idempotencyKey = "wolf_vote_result:" + event.getRoomId() + ":" + event.getRound();
        if (repo.isProcessed(idempotencyKey)) {
            return;
        }

        boolean shouldAdvance = false;
        if (!lockService.tryLock(event.getRoomId())) {
            return;
        }
        try {
            GameState state = repo.get(event.getRoomId());
            if (state == null || state.getPhase() != GamePhase.NIGHT) {
                return;
            }
            if (!"WEREWOLF".equals(normalizeRole(state.getCurrentNightRole()))) {
                return;
            }
            if (state.getRound() != event.getRound()) {
                return;
            }

            NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
            state.setNightActions(actions);
            actions.setWolfTarget(event.getEliminatedId());
            repo.save(event.getRoomId(), state);
            repo.markProcessed(idempotencyKey);
            shouldAdvance = true;
        } finally {
            lockService.releaseLock(event.getRoomId());
        }

        if (shouldAdvance) {
            advanceNightPhase(event.getRoomId());
        }
    }

    private boolean shouldTriggerWerewolfVote(String roomId, GameState state) {
        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        return actions.getWolfTarget() == null
                && !repo.isProcessed(werewolfVoteRequestKey(roomId, state.getRound()));
    }

    private void publishWerewolfVoteRequest(String roomId) {
        GameState state = repo.get(roomId);
        if (state == null || state.getPhase() != GamePhase.NIGHT) {
            return;
        }
        if (!"WEREWOLF".equals(normalizeRole(state.getCurrentNightRole()))) {
            return;
        }
        String requestKey = werewolfVoteRequestKey(roomId, state.getRound());
        if (repo.isProcessed(requestKey)) {
            return;
        }

        List<String> aliveWolfIds = state.getPlayers().entrySet().stream()
                .filter(entry -> entry.getValue().isAlive()
                        && "WEREWOLF".equals(normalizeRole(entry.getValue().getRole())))
                .map(Map.Entry::getKey)
                .toList();
        int durationSec = (int) getNightDuration(state, "WEREWOLF");

        producer.publishWerewolfVoteStart(com.werewolf.gameplay.model.events.VoteStartEvent.builder()
                .roomId(roomId)
                .round(state.getRound())
                .alivePlayerIds(aliveWolfIds)
                .durationSec(durationSec)
                .build());
        repo.markProcessed(requestKey);
    }

    private String werewolfVoteRequestKey(String roomId, int round) {
        return "wolf_vote_request:" + roomId + ":" + round;
    }

    private void finalizeWolfTarget(GameState state) {
        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        state.setNightActions(actions);
        if (actions.getWolfTarget() != null) {
            return;
        }
        Map<String, String> wolfVotes = Optional.ofNullable(actions.getWolfVotes()).orElseGet(Map::of);

        String resolvedTarget = wolfVotes.values().stream()
                .collect(Collectors.groupingBy(target -> target, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.<String, Long>comparingByValue()
                        .thenComparing(Map.Entry.comparingByKey()))
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
                case "HUNTER" -> 15L;
                default -> 30L;
            };
        }
        return switch (role) {
            case "GUARD" -> config.getOrDefault("guardDuration", 30);
            case "SEER" -> config.getOrDefault("seerDuration", 30);
            case "WEREWOLF" -> config.getOrDefault("werewolfDuration", 45);
            case "WITCH" -> config.getOrDefault("witchDuration", 30);
            case "HUNTER" -> config.getOrDefault("hunterDuration", 15);
            default -> 30;
        };
    }

    public boolean enterHunterPhaseAfterVote(String roomId, GameState state, String eliminatedId) {
        if (eliminatedId == null) {
            return false;
        }
        PlayerState eliminatedPlayer = state.getPlayers().get(eliminatedId);
        if (eliminatedPlayer == null || !"HUNTER".equals(normalizeRole(eliminatedPlayer.getRole()))) {
            return false;
        }

        enterHunterPhase(roomId, state, eliminatedId, HUNTER_PHASE_FROM_DAY, List.of(eliminatedId), eliminatedId);
        return true;
    }

    public void resolveHunterTimeout(String roomId) {
        boolean shouldContinue = false;
        if (!lockService.tryLock(roomId)) {
            return;
        }
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.HUNTER || state.getHunterPendingId() == null) {
                return;
            }

            markHunterActionResolved(state);
            repo.save(roomId, state);
            shouldContinue = true;
        } finally {
            lockService.releaseLock(roomId);
        }

        if (shouldContinue) {
            continueAfterHunterAction(roomId);
        }
    }

    private boolean handleHunterActionLocked(String roomId, GameState state, NightActionEvent event, String actorRole) {
        if (state.getHunterPendingId() == null || !"HUNTER".equals(actorRole)) {
            return false;
        }

        if (!event.getPlayerId().equals(state.getHunterPendingId()) || event.getTargetId() == null) {
            return false;
        }

        PlayerState actor = state.getPlayers().get(event.getPlayerId());
        PlayerState target = state.getPlayers().get(event.getTargetId());
        if (actor == null || actor.isAlive() || !"HUNTER".equals(normalizeRole(actor.getRole()))) {
            return false;
        }
        if (target == null || !target.isAlive() || event.getPlayerId().equals(event.getTargetId())) {
            return false;
        }

        target.setAlive(false);
        if (state.getHunterPendingDeadIds() != null && !state.getHunterPendingDeadIds().contains(event.getTargetId())) {
            state.getHunterPendingDeadIds().add(event.getTargetId());
        }
        String originPhase = state.getHunterPendingOriginPhase();
        markHunterActionResolved(state);
        repo.save(roomId, state);

        publishHunterResolved(roomId, state, originPhase, event.getTargetId());
        return true;
    }

    private void continueAfterHunterAction(String roomId) {
        if (!lockService.tryLock(roomId)) {
            return;
        }
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.HUNTER || state.getHunterPendingId() != null
                    || state.getHunterPendingOriginPhase() == null) {
                return;
            }
        } finally {
            lockService.releaseLock(roomId);
        }
        continueAfterResolvedHunter(roomId);
    }

    private void continueAfterResolvedHunter(String roomId) {
        boolean shouldAdvanceNight = false;
        if (!lockService.tryLock(roomId)) {
            return;
        }
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.HUNTER) {
                return;
            }

            String originPhase = state.getHunterPendingOriginPhase();
            List<String> deadIds = state.getHunterPendingDeadIds() == null ? List.of() : List.copyOf(state.getHunterPendingDeadIds());
            String eliminatedId = state.getHunterPendingEliminatedId();
            clearHunterPending(state);

            if (HUNTER_PHASE_FROM_NIGHT.equals(originPhase)) {
                if (endGameService.checkEndGame(roomId, state)) {
                    return;
                }
                moveToDiscuss(roomId, state, deadIds);
                return;
            }

            if (endGameService.checkEndGame(roomId, state)) {
                return;
            }

            state.setRound(state.getRound() + 1);
            repo.save(roomId, state);

            producer.publishPhaseChanged(PhaseChangedEvent.builder()
                    .roomId(roomId)
                    .phase("day")
                    .round(state.getRound())
                    .deadlineTimestamp(System.currentTimeMillis())
                    .metadata(new PhaseChangedEvent.Metadata(deadIds, eliminatedId))
                    .build());

            if (!endGameService.checkEndGame(roomId, state)) {
                setupNightAfterHunter(roomId, state);
                shouldAdvanceNight = true;
            }
        } finally {
            lockService.releaseLock(roomId);
        }

        if (shouldAdvanceNight) {
            advanceNightPhase(roomId);
        }
    }

    private void enterHunterPhase(String roomId, GameState state, String hunterId, String originPhase,
                                  List<String> deadIds, String eliminatedId) {
        state.setPhase(GamePhase.HUNTER);
        state.setHunterPendingId(hunterId);
        state.setHunterPendingOriginPhase(originPhase);
        state.setHunterPendingDeadIds(new ArrayList<>(deadIds));
        state.setHunterPendingEliminatedId(eliminatedId);
        state.setPhaseDeadline(System.currentTimeMillis() + (getNightDuration(state, "HUNTER") * 1000L));
        repo.save(roomId, state);

        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(roomId)
                .phase("hunter")
                .round(state.getRound())
                .deadlineTimestamp(state.getPhaseDeadline())
                .metadata(new PhaseChangedEvent.Metadata(deadIds, eliminatedId))
                .build());
    }

    private void moveToDiscuss(String roomId, GameState state, List<String> newlyDeadPlayers) {
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

    private void setupNightAfterHunter(String roomId, GameState state) {
        state.setPhase(GamePhase.NIGHT);
        state.setNightActions(new NightActions());
        state.setCurrentNightRole(null);
        state.setPhaseDeadline(System.currentTimeMillis());
        repo.save(roomId, state);
        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("all").enabled(false)
                .allowedGuestIds(List.of())
                .round(state.getRound()).build());
        producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                .roomId(roomId).channel("wolves").enabled(false)
                .allowedGuestIds(List.of())
                .round(state.getRound()).build());
    }

    private void publishHunterResolved(String roomId, GameState state, String originPhase, String targetId) {
        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(roomId)
                .phase(HUNTER_PHASE_FROM_NIGHT.equals(originPhase) ? "day" : "hunter")
                .round(state.getRound())
                .deadlineTimestamp(System.currentTimeMillis())
                .metadata(new PhaseChangedEvent.Metadata(List.of(targetId), targetId))
                .build());
    }

    private String findDeadHunter(GameState state, List<String> deadPlayerIds) {
        return deadPlayerIds.stream()
                .filter(playerId -> {
                    PlayerState player = state.getPlayers().get(playerId);
                    return player != null && "HUNTER".equals(normalizeRole(player.getRole()));
                })
                .findFirst()
                .orElse(null);
    }

    private void clearHunterPending(GameState state) {
        state.setHunterPendingId(null);
        state.setHunterPendingOriginPhase(null);
        state.setHunterPendingDeadIds(null);
        state.setHunterPendingEliminatedId(null);
    }

    private void markHunterActionResolved(GameState state) {
        state.setHunterPendingId(null);
    }

    private void publishNightWindow(String roomId, GameState state) {
        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(roomId)
                .phase("night")
                .round(state.getRound())
                .deadlineTimestamp(state.getPhaseDeadline())
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
