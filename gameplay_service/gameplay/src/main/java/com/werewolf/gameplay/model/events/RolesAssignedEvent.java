package com.werewolf.gameplay.model.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolesAssignedEvent {
    private String roomId;
    private Map<String, String> players; // PlayerId -> Role mapping
}
