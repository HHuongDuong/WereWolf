package com.werewolf.gameplay.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.werewolf.gameplay.gateway.InternalWsClient;
import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.GameEndedEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.model.events.RolesAssignedEvent;
import com.werewolf.gameplay.model.events.VoteStartEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final InternalWsClient internalWsClient;

    public void publishPhaseChanged(PhaseChangedEvent event) {
        log.info("Publishing game.phase.changed for room {}: phase={}, currentNightRole={}", 
            event.getRoomId(), event.getPhase(), 
            event.getMetadata() != null ? event.getMetadata().getCurrentNightRole() : "null");
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
        log.info("Sending role_assigned private events for room {}", event.getRoomId());
        if (event.getPlayers() == null || event.getPlayers().isEmpty()) {
            log.warn("No role assignments to send for room {}", event.getRoomId());
            return;
        }
        event.getPlayers().forEach((guestId, role) -> {
            boolean delivered = internalWsClient.sendRoleAssigned(event.getRoomId(), guestId, role);
            if (!delivered) {
                log.warn("role_assigned not delivered: roomId={}, guestId={}", event.getRoomId(), guestId);
            }
        });
    }
}
