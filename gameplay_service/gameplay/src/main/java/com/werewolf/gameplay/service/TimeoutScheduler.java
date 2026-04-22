package com.werewolf.gameplay.service;

import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TimeoutScheduler {

    private final GameStateRepository repo;
    private final NightPhaseService nightPhaseService;
    private final DayPhaseService dayPhaseService;

    @Scheduled(fixedDelay = 5_000)
    public void checkTimeouts() {
        List<String> activeRooms = repo.getAllActiveRooms();

        for (String roomId : activeRooms) {
            GameState state = repo.get(roomId);
            if (state == null) continue;

            if (state.getPhaseDeadline() > System.currentTimeMillis()) continue;

            switch (state.getPhase()) {
                case ROLE_REVEAL -> {
                    dayPhaseService.startNight(roomId);
                    // advanceNightPhase is now called inside startNight()
                }
                case NIGHT -> nightPhaseService.advanceNightPhase(roomId);
                case DISCUSS -> dayPhaseService.startVote(roomId);
                case VOTE -> {
                    log.warn("Vote timeout for roomId={}, triggering force resolve", roomId);
                    dayPhaseService.forceResolveVote(roomId);
                }
            }
        }
    }
}
