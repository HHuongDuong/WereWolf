package com.werewolf.vote.controller;

import com.werewolf.vote.dto.CastVoteRequest;
import com.werewolf.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    public ResponseEntity<Void> castVote(@RequestBody @Valid CastVoteRequest request) {
        voteService.castVote(request);
        return ResponseEntity.ok().build();
    }
}
