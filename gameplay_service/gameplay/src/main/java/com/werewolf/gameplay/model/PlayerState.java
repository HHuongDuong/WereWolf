package com.werewolf.gameplay.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerState {
    private String role;
    @com.fasterxml.jackson.annotation.JsonProperty("isAlive")
    private boolean isAlive;
    private boolean protectedThisNight;
}
