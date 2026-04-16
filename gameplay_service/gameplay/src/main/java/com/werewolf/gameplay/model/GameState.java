package com.werewolf.gameplay.model;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameState {
    private GamePhase phase;
    private int round;
    private Map<String, PlayerState> players;
    @Builder.Default
    private NightActions nightActions = new NightActions();
    @Builder.Default
    private WitchPotions witchPotions = WitchPotions.builder().build();
    private String lastGuardedId;
    private String currentNightRole;
    private Map<String, Integer> config;
    private long phaseDeadline;
}
