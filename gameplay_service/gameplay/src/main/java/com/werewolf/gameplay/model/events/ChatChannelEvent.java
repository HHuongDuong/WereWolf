package com.werewolf.gameplay.model.events;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatChannelEvent {
    private String roomId;
    private String channel;
    private boolean enabled;
    private List<String> allowedGuestIds;
    private Integer round;
}
