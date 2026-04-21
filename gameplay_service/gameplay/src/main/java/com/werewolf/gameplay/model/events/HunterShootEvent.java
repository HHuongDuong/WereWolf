package com.werewolf.gameplay.model.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HunterShootEvent {
    private String roomId;
    private String hunterId;
    private String targetId;
}
