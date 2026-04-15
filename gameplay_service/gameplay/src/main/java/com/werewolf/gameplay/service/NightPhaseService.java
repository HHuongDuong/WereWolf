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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NightPhaseService {

    private final GameStateRepository repo;
    private final RedisLockService lockService;
    private final GameEventProducer producer;
    private final EndGameService endGameService;

    public void handleNightAction(NightActionEvent event) {
        if (repo.isProcessed(event.getEventId())) return;

        GameState state = repo.get(event.getRoomId());
        if (state == null || state.getPhase() != GamePhase.NIGHT) return;
        PlayerState actor = state.getPlayers().get(event.getPlayerId());
        if (actor == null || !actor.isAlive()) return;
        if (event.getTargetId() != null) {
            PlayerState target = state.getPlayers().get(event.getTargetId());
            if (target == null || !target.isAlive()) return;
        }

        NightActions actions = Optional.ofNullable(state.getNightActions()).orElseGet(NightActions::new);
        state.setNightActions(actions);

        if (!applyNightAction(state, event)) {
            return;
        }

        repo.save(event.getRoomId(), state);
        repo.markProcessed(event.getEventId());

        if (allActionsReceived(state)) {
            resolveNight(event.getRoomId());
        }
    }

    private boolean applyNightAction(GameState state, NightActionEvent event) {
        NightActions actions = state.getNightActions();
        String role = event.getRole().toUpperCase();

        return switch (role) {
            case "GUARD", "DOCTOR" -> {
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
                if (event.getTargetId() == null || actions.getWolfTarget() != null || targetPlayer == null
                        || "WEREWOLF".equalsIgnoreCase(targetPlayer.getRole())) {
                    yield false;
                }
                actions.setWolfTarget(event.getTargetId());
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

    private boolean allActionsReceived(GameState state) {
        NightActions actions = state.getNightActions();

        if (hasAliveRole(state, "GUARD") && actions.getGuardTarget() == null) {
            return false;
        }
        if (hasAliveRole(state, "SEER") && actions.getSeerTarget() == null) {
            return false;
        }
        return !hasAliveRole(state, "WEREWOLF") || actions.getWolfTarget() != null;
    }

    private boolean hasAliveRole(GameState state, String role) {
        return state.getPlayers().values().stream()
                .anyMatch(player -> player.isAlive() && role.equalsIgnoreCase(player.getRole()));
    }

    public void resolveNight(String roomId) {
        if (!lockService.tryLock(roomId)) return;
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.NIGHT) return;
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
                    .metadata(new com.werewolf.gameplay.model.events.PhaseChangedEvent.Metadata(newlyDeadPlayers, null))
                    .build());

            producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                    .roomId(roomId).channel("wolves").enabled(false)
                    .allowedGuestIds(List.of())
                    .round(state.getRound()).build());
            producer.publishChatChannelUpdated(ChatChannelEvent.builder()
                    .roomId(roomId).channel("all").enabled(true)
                    .allowedGuestIds(alivePlayerIds)
                    .round(state.getRound()).build());
        } finally {
            lockService.releaseLock(roomId);
        }
    }
}
