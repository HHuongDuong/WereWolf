package com.werewolf.gameplay.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NightActions {
    private String guardTarget;
    private String wolfTarget;
    private String witchSaved;
    private String witchPoisoned;
    private String seerTarget;
}
