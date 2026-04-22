package com.werewolf.gameplay.model.events;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhaseChangedEvent {
    private String roomId;
    private String phase; // "night" | "day"
    private Integer round;
    private Long deadlineTimestamp;
    private Metadata metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        private List<String> deadIds;
        private String eliminatedId;
        private String currentNightRole; // Active role during night phase (GUARD, SEER, WEREWOLF, WITCH)
    }
}
