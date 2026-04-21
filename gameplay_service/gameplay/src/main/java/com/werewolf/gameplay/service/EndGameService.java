package com.werewolf.gameplay.service;

import com.werewolf.gameplay.kafka.GameEventProducer;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.events.GameEndedEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EndGameService {

    private final GameEventProducer producer;
    private final GameStateRepository repo;

    public boolean checkEndGame(String roomId, GameState state) {
        long wolvesAlive = countAliveByRole(state, "WEREWOLF");
        long villagersAlive = state.getPlayers().values().stream()
                .filter(p -> p.isAlive() && !p.getRole().equals("WEREWOLF"))
                .count();

        if (wolvesAlive == 0) {
            endGame(roomId, "villager", state);
            return true;
        } else if (wolvesAlive >= villagersAlive) {
            endGame(roomId, "werewolf", state);
            return true;
        }
        return false;
    }

    private void endGame(String roomId, String winner, GameState state) {
        // Collect all player roles
        Map<String, String> roles = state.getPlayers().entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        java.util.Map.Entry::getKey,
                        e -> e.getValue().getRole()
                ));
        
        producer.publishGameEnded(GameEndedEvent.builder()
                .roomId(roomId)
                .winner(winner)
                .round(state.getRound())
                .roles(roles)
                .build());
        
        log.info("Game ended in room {}: winner={}, round={}", roomId, winner, state.getRound());
        
        repo.delete(roomId);
    }

    private long countAliveByRole(GameState state, String role) {
        return state.getPlayers().values().stream()
                .filter(p -> p.isAlive() && p.getRole().equals(role))
                .count();
    }
}
