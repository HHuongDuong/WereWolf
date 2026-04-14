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
    private Map<String, NightAction> nightActions;
    private Map<String, Integer> config;
    private long phaseDeadline;
}
