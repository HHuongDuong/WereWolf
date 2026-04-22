package com.werewolf.vote.consumer;

import com.werewolf.vote.dto.GameVoteStartEvent;
import com.werewolf.vote.service.VoteSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoteEventConsumer {

    private final VoteSessionService sessionService;

    @KafkaListener(topics = "game.vote.start", groupId = "vote-service")
    public void onVoteStart(@Payload GameVoteStartEvent event) {
        log.info("Received game.vote.start: roomId={}, round={}, players={}",
            event.roomId(), event.round(), event.alivePlayerIds().size());
        sessionService.openSession(event);
    }
}
