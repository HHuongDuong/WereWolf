package com.werewolf.gameplay.model.events;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomStartedEvent {
    private String roomId;
    private String roomCode;
    private List<PlayerInfo> players;
    @JsonProperty("config")
    private Map<String, Integer> config;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerInfo {
        private String guestId;
        private String displayName;
    }

}
