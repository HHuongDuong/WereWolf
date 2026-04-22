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
    // When phase = "night": indicates which role window is currently open (GUARD/SEER/WEREWOLF/WITCH)
    // When phase = "day": null
    private String currentNightRole;
    private Metadata metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        private List<String> deadIds;
        private String eliminatedId;
    }
}
