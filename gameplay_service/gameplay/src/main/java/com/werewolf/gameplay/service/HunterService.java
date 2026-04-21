package com.werewolf.gameplay.service;

import com.werewolf.gameplay.gateway.InternalWsClient;
import com.werewolf.gameplay.lock.RedisLockService;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.PlayerState;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class HunterService {

    private final GameStateRepository repo;
    private final InternalWsClient internalWsClient;
    private final RedisLockService lockService;
    private final EndGameService endGameService;

    /**
     * Check if a player who just died is Hunter, and trigger hunter_trigger event
     * @param roomId the room ID
     * @param deadPlayerId the player who just died
     * @return true if Hunter was triggered, false otherwise
     */
    public boolean checkAndTriggerHunter(String roomId, String deadPlayerId) {
        GameState state = repo.get(roomId);
        if (state == null) {
            return false;
        }

        PlayerState deadPlayer = state.getPlayers().get(deadPlayerId);
        if (deadPlayer == null || !"HUNTER".equalsIgnoreCase(deadPlayer.getRole())) {
            return false;
        }

        // Check if Hunter already used skill
        if (deadPlayer.isHunterUsed()) {
            log.info("Hunter {} already used skill in room {}", deadPlayerId, roomId);
            return false;
        }

        // Mark Hunter as triggered (to prevent double trigger)
        deadPlayer.setHunterUsed(true);
        repo.save(roomId, state);

        // Send hunter_trigger to Hunter player
        boolean sent = internalWsClient.sendPrivate(
            roomId,
            deadPlayerId,
            "hunter_trigger",
            Map.of("hunterId", deadPlayerId)
        );

        if (sent) {
            log.info("Sent hunter_trigger to hunterId={} in room={}", deadPlayerId, roomId);
        } else {
            log.warn("Failed to send hunter_trigger to hunterId={} in room={}", deadPlayerId, roomId);
        }

        return true;
    }

    /**
     * Handle Hunter's shoot action
     * @param roomId the room ID
     * @param hunterId the Hunter's player ID
     * @param targetId the target player ID
     */
    public void handleHunterShoot(String roomId, String hunterId, String targetId) {
        if (!lockService.tryLock(roomId)) {
            log.warn("Failed to acquire lock for hunter shoot in room {}", roomId);
            return;
        }

        try {
            GameState state = repo.get(roomId);
            if (state == null) {
                log.warn("Game state not found for room {}", roomId);
                return;
            }

            // Validate Hunter
            PlayerState hunter = state.getPlayers().get(hunterId);
            if (hunter == null || !"HUNTER".equalsIgnoreCase(hunter.getRole())) {
                log.warn("Invalid hunter {} in room {}", hunterId, roomId);
                return;
            }

            if (!hunter.isHunterUsed()) {
                log.warn("Hunter {} has not been triggered yet in room {}", hunterId, roomId);
                return;
            }

            // Validate target
            PlayerState target = state.getPlayers().get(targetId);
            if (target == null) {
                log.warn("Target {} not found in room {}", targetId, roomId);
                return;
            }

            if (!target.isAlive()) {
                log.warn("Target {} is already dead in room {}", targetId, roomId);
                return;
            }

            // Kill target
            target.setAlive(false);
            repo.save(roomId, state);

            log.info("Hunter {} shot target {} in room {}", hunterId, targetId, roomId);

            // Check if target was also a Hunter (chain reaction)
            checkAndTriggerHunter(roomId, targetId);

            // Check win condition
            endGameService.checkEndGame(roomId, state);

        } finally {
            lockService.releaseLock(roomId);
        }
    }
}
