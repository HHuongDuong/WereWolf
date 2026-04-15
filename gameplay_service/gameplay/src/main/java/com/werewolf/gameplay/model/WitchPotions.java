package com.werewolf.gameplay.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WitchPotions {
    @Builder.Default
    private boolean savePotion = true;
    @Builder.Default
    private boolean killPotion = true;
}
