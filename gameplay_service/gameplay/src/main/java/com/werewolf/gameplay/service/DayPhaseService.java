package com.werewolf.gameplay.service;

import com.werewolf.gameplay.kafka.GameEventProducer;
import com.werewolf.gameplay.lock.RedisLockService;
import com.werewolf.gameplay.model.GamePhase;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.NightActions;
import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.model.events.VoteResultEvent;
import com.werewolf.gameplay.model.events.VoteStartEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DayPhaseService {

    private final GameStateRepository repo;
    private final GameEventProducer producer;
    private final EndGameService endGameService;
    private final RedisLockService lockService;
    private final NightPhaseService nightPhaseService;
    private final HunterService hunterService;

    public void startVote(String roomId) {
        GameState state = repo.get(roomId);
        if (state == null || state.getPhase() != GamePhase.DISCUSS)
            return;

        long durationSec = state.getConfig() != null ? state.getConfig().getOrDefault("voteDuration", 30) : 30;
        long deadline = System.currentTimeMillis() + (durationSec * 1000L);
        state.setPhase(GamePhase.VOTE);
        state.setPhaseDeadline(deadline);
        repo.save(roomId, state);

        List<String> alivePlayers = state.getPlayers().entrySet().stream()
                .filter(e -> e.getValue().isAlive())
                .map(Map.Entry::getKey)
                .toList();

        producer.publishVoteStart(VoteStartEvent.builder()
                .roomId(roomId)
                .round(state.getRound())
                .alivePlayerIds(alivePlayers)
                .durationSec((int) durationSec)
                .build());
    }

    public void startNight(String roomId) {
        GameState state = repo.get(roomId);
        if (state == null)
            return;

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

    public void handleVoteResult(VoteResultEvent event) {
        String idempotencyKey = "vote_result:" + event.getRoomId() + ":" + event.getRound();
        if (repo.isProcessed(idempotencyKey))
            return;

        // Use lock for resolving vote
        if (!lockService.tryLock(event.getRoomId()))
            return;
        try {
            GameState state = repo.get(event.getRoomId());
            if (state == null || state.getPhase() != GamePhase.VOTE)
                return;

            if (event.getEliminatedId() != null && state.getPlayers().containsKey(event.getEliminatedId())) {
                state.getPlayers().get(event.getEliminatedId()).setAlive(false);
                
                // Check if eliminated player is Hunter
                hunterService.checkAndTriggerHunter(event.getRoomId(), event.getEliminatedId());
            }
            state.setRound(state.getRound() + 1);
            repo.save(event.getRoomId(), state);
            repo.markProcessed(idempotencyKey);

            producer.publishPhaseChanged(PhaseChangedEvent.builder()
                    .roomId(event.getRoomId())
                    .phase("day")
                    .round(state.getRound())
                    .deadlineTimestamp(System.currentTimeMillis())
                    .metadata(new PhaseChangedEvent.Metadata(List.of(), event.getEliminatedId()))
                    .build());

            boolean ended = endGameService.checkEndGame(event.getRoomId(), state);
            if (!ended) {
                startNight(event.getRoomId());
            }
        } finally {
            lockService.releaseLock(event.getRoomId());
        }
        GameState latestState = repo.get(event.getRoomId());
        if (latestState != null && latestState.getPhase() == GamePhase.NIGHT) {
            nightPhaseService.advanceNightPhase(event.getRoomId());
        }
    }

    public void forceResolveVote(String roomId) {
        // Fallback for timeout
        if (!lockService.tryLock(roomId))
            return;
        try {
            GameState state = repo.get(roomId);
            if (state == null || state.getPhase() != GamePhase.VOTE)
                return;
            // No eliminate fallback:
            state.setRound(state.getRound() + 1);
            repo.save(roomId, state);
            boolean ended = endGameService.checkEndGame(roomId, state);
            if (!ended) {
                startNight(roomId);
            }
        } finally {
            lockService.releaseLock(roomId);
        }
        GameState latestState = repo.get(roomId);
        if (latestState != null && latestState.getPhase() == GamePhase.NIGHT) {
            nightPhaseService.advanceNightPhase(roomId);
        }
    }
}
