package com.werewolf.vote.service;

import com.werewolf.vote.dto.CastVoteRequest;
import com.werewolf.vote.dto.VoteMetaDto;
import com.werewolf.vote.exception.VoteException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoteService {

    private final RedisTemplate<String, String> redis;
    private final VoteSessionService sessionService;
    private final VoteResultService resultService;

    private static final DefaultRedisScript<Long> CAST_VOTE_SCRIPT =
        new DefaultRedisScript<>("""
            local alreadyVoted = redis.call('HEXISTS', KEYS[1], ARGV[1])
            if alreadyVoted == 1 then
                return 0
            end
            redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
            redis.call('EXPIRE', KEYS[1], 600)
            return redis.call('HLEN', KEYS[1])
            """, Long.class);

    public void castVote(CastVoteRequest req) {
        VoteMetaDto meta = sessionService.getMeta(req.roomId(), req.round());
        validateMeta(meta, req);

        String hashKey = VoteSessionService.hashKey(req.roomId(), req.round());
        Long hlen = redis.execute(
            CAST_VOTE_SCRIPT,
            List.of(hashKey),
            req.voterId(), req.targetId(),
            String.valueOf(meta.alivePlayerIds().size())
        );

        if (hlen == null || hlen == 0L) {
            throw new VoteException("ALREADY_VOTED",
                "Voter " + req.voterId() + " has already voted this round");
        }

        log.info("Vote cast: voter={}, target={}, room={}, round={}, hlen={}",
            req.voterId(), req.targetId(), req.roomId(), req.round(), hlen);

        if (hlen == meta.alivePlayerIds().size()) {
            log.info("All players voted — closing session early: room={}, round={}",
                req.roomId(), req.round());
            Thread.ofVirtual().start(
                () -> resultService.closeSession(req.roomId(), req.round())
            );
        }
    }

    private void validateMeta(VoteMetaDto meta, CastVoteRequest req) {
        if (meta == null) {
            throw new VoteException("SESSION_NOT_FOUND",
                "Vote session not found for room=" + req.roomId()
                + ", round=" + req.round());
        }
        if (meta.closed()) {
            throw new VoteException("SESSION_CLOSED", "Vote session is already closed");
        }
        if (System.currentTimeMillis() > meta.expiresAt()) {
            throw new VoteException("SESSION_EXPIRED", "Vote session has expired");
        }
        if (!meta.alivePlayerIds().contains(req.voterId())) {
            throw new VoteException("VOTER_NOT_ELIGIBLE",
                "Voter " + req.voterId() + " is not an alive player");
        }
        if (!meta.alivePlayerIds().contains(req.targetId())) {
            throw new VoteException("TARGET_NOT_ELIGIBLE",
                "Target " + req.targetId() + " is not an alive player");
        }
        if (req.voterId().equals(req.targetId())) {
            throw new VoteException("SELF_VOTE", "Cannot vote for yourself");
        }
    }
}
