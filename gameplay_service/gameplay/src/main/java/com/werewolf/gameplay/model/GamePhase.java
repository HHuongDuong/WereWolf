package com.werewolf.gameplay.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum GamePhase {
    ROLE_REVEAL, NIGHT, DISCUSS, DAY;

    @JsonValue
    public String toValue() {
        return this.name().toLowerCase();
    }
}
