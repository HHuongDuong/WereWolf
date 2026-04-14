package com.werewolf.gameplay.model.events;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameEndedEvent {
    private String roomId;
    private String winner; // "werewolf" | "villager"
    private Integer round;
}
