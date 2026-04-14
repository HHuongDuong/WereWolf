package com.werewolf.gameplay.kafka;

import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.GameEndedEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.model.events.RolesAssignedEvent;
import com.werewolf.gameplay.model.events.VoteStartEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishPhaseChanged(PhaseChangedEvent event) {
        log.info("Publishing game.phase.changed for room {}: {}", event.getRoomId(), event.getPhase());
        kafkaTemplate.send("game.phase.changed", event);
    }

    public void publishChatChannelUpdated(ChatChannelEvent event) {
        log.info("Publishing game.chat.channel.updated for room {}, channel {}", event.getRoomId(), event.getChannel());
        kafkaTemplate.send("game.chat.channel.updated", event);
    }

    public void publishVoteStart(VoteStartEvent event) {
        log.info("Publishing game.vote.start for room {}, round {}", event.getRoomId(), event.getRound());
        kafkaTemplate.send("game.vote.start", event);
    }

    public void publishGameEnded(GameEndedEvent event) {
        log.info("Publishing game.ended for room {}, winner {}", event.getRoomId(), event.getWinner());
        kafkaTemplate.send("game.ended", event);
    }

    public void publishRolesAssigned(RolesAssignedEvent event) {
        log.info("Publishing game.roles.assigned for room {}", event.getRoomId());
        kafkaTemplate.send("game.roles.assigned", event);
    }
}
