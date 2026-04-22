package com.werewolf.vote.dto;

import java.util.List;

public record VoteMetaDto(
    String roomId,
    int round,
    List<String> alivePlayerIds,
    int durationSec,
    long startedAt,
    long expiresAt,
    boolean closed
) {
    public VoteMetaDto withClosed() {
        return new VoteMetaDto(roomId, round, alivePlayerIds,
                               durationSec, startedAt, expiresAt, true);
    }
}
