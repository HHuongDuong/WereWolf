package com.werewolf.gameplay.model.events;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NightActionEvent {
    private String eventId;
    private String roomId;
    private String playerId;
    private String role;
    private String targetId;
}
