package com.werewolf.gameplay.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.werewolf.gameplay.model.events.HunterShootEvent;
import com.werewolf.gameplay.model.events.NightActionEvent;
import com.werewolf.gameplay.model.events.RoomStartedEvent;
import com.werewolf.gameplay.model.events.VoteResultEvent;
import com.werewolf.gameplay.service.DayPhaseService;
import com.werewolf.gameplay.service.GameInitService;
import com.werewolf.gameplay.service.HunterService;
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

    private final GameInitService gameInitService;
    private final NightPhaseService nightPhaseService;
    private final DayPhaseService dayPhaseService;
    private final HunterService hunterService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "room.started", groupId = "gameplay-service")
    public void onRoomStarted(String payload, Acknowledgment ack) {
        try {
            RoomStartedEvent event = objectMapper.readValue(payload, RoomStartedEvent.class);
            log.info("Received room.started for room: {}", event.getRoomId());
            gameInitService.handleRoomStarted(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle room.started. payload={}", payload, e);
            ack.acknowledge(); // ack để tránh bị loop retry vô tận
        }
    }

    @KafkaListener(topics = "game.night.action", groupId = "gameplay-service")
    public void onNightAction(String payload, Acknowledgment ack) {
        try {
            NightActionEvent event = objectMapper.readValue(payload, NightActionEvent.class);
            log.info("Received game.night.action for room: {}", event.getRoomId());
            nightPhaseService.handleNightAction(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle game.night.action. payload={}", payload, e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "vote.result", groupId = "gameplay-service")
    public void onVoteResult(String payload, Acknowledgment ack) {
        try {
            VoteResultEvent event = objectMapper.readValue(payload, VoteResultEvent.class);
            log.info("Received vote.result for room: {}", event.getRoomId());
            dayPhaseService.handleVoteResult(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle vote.result. payload={}", payload, e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "game.hunter.shoot", groupId = "gameplay-service")
    public void onHunterShoot(String payload, Acknowledgment ack) {
        try {
            HunterShootEvent event = objectMapper.readValue(payload, HunterShootEvent.class);
            log.info("Received game.hunter.shoot for room: {}, hunter: {}, target: {}",
                event.getRoomId(), event.getHunterId(), event.getTargetId());
            hunterService.handleHunterShoot(event.getRoomId(), event.getHunterId(), event.getTargetId());
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle game.hunter.shoot. payload={}", payload, e);
            ack.acknowledge();
        }
    }
}
