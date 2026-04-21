package com.werewolf.gameplay.model.events;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameEndedEvent {
    private String roomId;
    private String winner; // "werewolf" | "villager"
    private Integer round;
    private Map<String, String> roles; // Map of guestId -> role
}
