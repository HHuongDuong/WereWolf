package com.werewolf.gameplay.model;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NightActions {
    private String guardTarget;
    private String wolfTarget;
    @Builder.Default
    private Map<String, String> wolfVotes = new HashMap<>();
    private String witchSaved;
    private String witchPoisoned;
    private String seerTarget;
}
