package com.werewolf.gameplay.model.events;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResultEvent {
    private String roomId;
    private Integer round;
    private String eliminatedId; // can be null
    private Map<String, Integer> counts;
    private boolean tied;
}
