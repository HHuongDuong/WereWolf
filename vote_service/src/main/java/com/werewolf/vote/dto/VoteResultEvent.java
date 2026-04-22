package com.werewolf.vote.dto;

import java.util.Map;

public record VoteResultEvent(
    String roomId,
    int round,
    Map<String, Integer> counts,
    String eliminatedId,   // null if tied
    boolean tied
) {}
