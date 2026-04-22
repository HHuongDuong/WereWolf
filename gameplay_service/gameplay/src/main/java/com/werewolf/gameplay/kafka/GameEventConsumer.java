package com.werewolf.gameplay.kafka;

import com.werewolf.gameplay.model.GamePhase;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.events.NightActionEvent;
import com.werewolf.gameplay.model.events.RoomStartedEvent;
import com.werewolf.gameplay.model.events.VoteResultEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import com.werewolf.gameplay.service.DayPhaseService;
import com.werewolf.gameplay.service.GameInitService;
import com.werewolf.gameplay.service.NightPhaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameEventConsumer {

    private final GameStateRepository repo;
    private final GameInitService gameInitService;
    private final NightPhaseService nightPhaseService;
    private final DayPhaseService dayPhaseService;

    @KafkaListener(
            topics = "room.started",
            groupId = "gameplay-service",
            properties = "spring.json.value.default.type=com.werewolf.gameplay.model.events.RoomStartedEvent")
    public void onRoomStarted(RoomStartedEvent event, Acknowledgment ack) {
        try {
            log.info("Received room.started for room: {}", event.getRoomId());
            gameInitService.handleRoomStarted(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle room.started for roomId={}", event.getRoomId(), e);
        }
    }

    @KafkaListener(
            topics = "game.night.action",
            groupId = "gameplay-service",
            properties = "spring.json.value.default.type=com.werewolf.gameplay.model.events.NightActionEvent")
    public void onNightAction(NightActionEvent event, Acknowledgment ack) {
        try {
            log.info("Received game.night.action for room: {}", event.getRoomId());
            nightPhaseService.handleNightAction(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle game.night.action for roomId={}", event.getRoomId(), e);
        }
    }

    @KafkaListener(
            topics = "vote.result",
            groupId = "gameplay-service",
            properties = "spring.json.value.default.type=com.werewolf.gameplay.model.events.VoteResultEvent")
    public void onVoteResult(VoteResultEvent event, Acknowledgment ack) {
        try {
            if (event == null || event.getRoomId() == null || event.getRound() == null) {
                log.warn("Ignoring malformed vote.result payload: {}", event);
                ack.acknowledge();
                return;
            }
            log.info("Received vote.result for room: {}", event.getRoomId());
            GameState state = repo.get(event.getRoomId());
            if (state == null) {
                log.warn("Ignoring vote.result because room state was not found: {}", event.getRoomId());
                ack.acknowledge();
                return;
            }

            if (state.getPhase() == GamePhase.NIGHT
                    && "WEREWOLF".equalsIgnoreCase(state.getCurrentNightRole())) {
                nightPhaseService.handleWolfVoteResult(event);
            } else if (state.getPhase() == GamePhase.DAY || state.getPhase() == GamePhase.VOTE) {
                dayPhaseService.handleVoteResult(event);
            } else {
                log.warn("Ignoring vote.result for room {} in phase {}", event.getRoomId(), state.getPhase());
            }
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle vote.result for roomId={}", event.getRoomId(), e);
        }
    }
}
