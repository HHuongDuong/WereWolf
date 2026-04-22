package com.werewolf.vote.dto;

import java.util.List;

public record GameVoteStartEvent(
    String roomId,
    int round,
    List<String> alivePlayerIds,
    int durationSec
) {}
