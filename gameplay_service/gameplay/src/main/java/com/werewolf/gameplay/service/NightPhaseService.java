package com.werewolf.gameplay.service;

import com.werewolf.gameplay.kafka.GameEventProducer;
import com.werewolf.gameplay.lock.RedisLockService;
import com.werewolf.gameplay.model.GamePhase;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.PlayerState;
import com.werewolf.gameplay.model.NightAction;
import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.NightActionEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
        if (!state.getPlayers().get(event.getPlayerId()).isAlive()) return;

        if ("WEREWOLF".equalsIgnoreCase(event.getRole())) {
            PlayerState targetPlayer = state.getPlayers().get(event.getTargetId());
            if (targetPlayer != null && "WEREWOLF".equalsIgnoreCase(targetPlayer.getRole())) {
                return;
            }
        }

        String actionKey = getActionKey(event.getPlayerId(), event.getRole());
        if (state.getNightActions().containsKey(actionKey)) return;

        state.getNightActions().put(actionKey, new NightAction(event.getTargetId()));
        repo.save(event.getRoomId(), state);
        repo.markProcessed(event.getEventId());

        if (allActionsReceived(state)) {
            resolveNight(event.getRoomId());
        }
    }

    private String getActionKey(String playerId, String role) {
        if ("WEREWOLF".equalsIgnoreCase(role)) {
            return "wolf_" + playerId;
        }
        return roleToActionKey(role);
    }

    private String roleToActionKey(String role) {
        return switch (role.toUpperCase()) {
            case "WEREWOLF" -> "wolves"; // Fallback, not used per player
            case "SEER" -> "seer";
            case "GUARD", "DOCTOR" -> "guard";
            default -> role.toLowerCase();
        };
    }

    private boolean allActionsReceived(GameState state) {
        Set<String> required = state.getPlayers().entrySet().stream()
                .filter(e -> e.getValue().isAlive() && List.of("WEREWOLF", "SEER", "GUARD", "DOCTOR").contains(e.getValue().getRole()))
                .map(e -> getActionKey(e.getKey(), e.getValue().getRole()))
                .collect(Collectors.toSet());
        return state.getNightActions().keySet().containsAll(required);
    }

    public void resolveNight(String roomId) {
        if (!lockService.tryLock(roomId)) return;
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.NIGHT) return;

            Map<String, Long> wolfVoteCounts = state.getNightActions().entrySet().stream()
                    .filter(e -> e.getKey().startsWith("wolf_"))
                    .map(e -> e.getValue().getTargetId())
                    .collect(Collectors.groupingBy(target -> target, Collectors.counting()));
            
            long maxVotes = wolfVoteCounts.values().stream()
                    .max(Long::compare)
                    .orElse(0L);

            List<String> tiedTargets = wolfVoteCounts.entrySet().stream()
                    .filter(e -> e.getValue() == maxVotes)
                    .map(Map.Entry::getKey)
                    .toList();

            String wolfTarget = tiedTargets.isEmpty() ? null : tiedTargets.get(new Random().nextInt(tiedTargets.size()));

            String guardTarget = Optional.ofNullable(state.getNightActions().get("guard")).map(NightAction::getTargetId).orElse(null);

            List<String> newlyDeadPlayers = new ArrayList<>();
            if (wolfTarget != null && !wolfTarget.equals(guardTarget)) {
                state.getPlayers().get(wolfTarget).setAlive(false);
                newlyDeadPlayers.add(wolfTarget);
            }

            state.getNightActions().clear();
            state.getPlayers().values().forEach(p -> p.setProtectedThisNight(false));

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

            if (!newlyDeadPlayers.isEmpty()) {
                endGameService.checkEndGame(roomId, state);
            }
        } finally {
            lockService.releaseLock(roomId);
        }
    }
}
