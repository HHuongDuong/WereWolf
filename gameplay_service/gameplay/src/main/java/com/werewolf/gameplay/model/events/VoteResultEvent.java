package com.werewolf.gameplay.model.events;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResultEvent {
    private String roomId;
    private Integer round;
    private String eliminatedId;
    @JsonProperty(value = "counts")
    private Map<String, Integer> counts;
    private boolean tied;
}
