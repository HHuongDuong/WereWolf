package com.werewolf.gameplay.model.events;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteStartEvent {
    private String roomId;
    private Integer round;
    private List<String> alivePlayerIds;
    private Integer durationSec;
    private String voteType; // "DAY" | "WOLF"
}
