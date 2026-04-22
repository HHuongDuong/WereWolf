package com.werewolf.vote.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CastVoteRequest(
    @NotBlank String roomId,
    @Min(1)  int round,
    @NotBlank String voterId,
    @NotBlank String targetId
) {}
