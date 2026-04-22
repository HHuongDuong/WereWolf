package com.werewolf.vote.service;

import com.werewolf.vote.dto.VoteMetaDto;
import com.werewolf.vote.dto.VoteResultEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class VoteResultService {

    private final RedisTemplate<String, String> redis;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final VoteSessionService sessionService;

    private static final DefaultRedisScript<Long> ACQUIRE_LOCK_SCRIPT =
        new DefaultRedisScript<>("""
            return redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1])
                and 1 or 0
            """, Long.class);

    public VoteResultService(
            RedisTemplate<String, String> redis,
            KafkaTemplate<String, Object> kafkaTemplate,
            @Lazy VoteSessionService sessionService) {
        this.redis = redis;
        this.kafkaTemplate = kafkaTemplate;
        this.sessionService = sessionService;
    }

    public void closeSession(String roomId, int round) {
        VoteMetaDto meta = sessionService.getMeta(roomId, round);
        if (meta == null || meta.closed()) {
            log.debug("Session already closed or not found: room={}, round={}", roomId, round);
            return;
        }

        String lockKey = "vote_lock:" + roomId + ":" + round;
        Long acquired = redis.execute(
            ACQUIRE_LOCK_SCRIPT,
            List.of(lockKey),
            "10"
        );

        if (acquired == null || acquired == 0L) {
            log.warn("Could not acquire lock for room={}, round={} — already closing", roomId, round);
            return;
        }

        try {
            String hashKey = VoteSessionService.hashKey(roomId, round);
            Map<Object, Object> rawVotes = redis.opsForHash().entries(hashKey);

            Map<String, Integer> counts = computeCounts(rawVotes);

            VoteOutcome outcome = determineOutcome(counts);

            VoteResultEvent result = new VoteResultEvent(
                roomId, round, counts, outcome.eliminatedId(), outcome.tied()
            );
            kafkaTemplate.send("vote.result", roomId, result);

            log.info("Vote result published to [vote.result] (for gameplay & gateway): room={}, round={}, eliminated={}, tied={}, counts={}",
                roomId, round, outcome.eliminatedId(), outcome.tied(), counts);

            sessionService.markClosed(roomId, round);

        } catch (Exception e) {
            log.error("Error closing vote session: room={}, round={}", roomId, round, e);
        }
    }

    private Map<String, Integer> computeCounts(Map<Object, Object> rawVotes) {
        Map<String, Integer> counts = new HashMap<>();
        for (Object val : rawVotes.values()) {
            String targetId = (String) val;
            counts.merge(targetId, 1, Integer::sum);
        }
        return counts;
    }

    private VoteOutcome determineOutcome(Map<String, Integer> counts) {
        if (counts.isEmpty()) {
            return new VoteOutcome(null, false);
        }

        int maxVotes = Collections.max(counts.values());

        List<String> topCandidates = counts.entrySet().stream()
            .filter(e -> e.getValue() == maxVotes)
            .map(Map.Entry::getKey)
            .toList();

        if (topCandidates.size() > 1) {
            log.info("Vote tied: candidates={}, votes={}", topCandidates, maxVotes);
            return new VoteOutcome(null, true);
        }

        return new VoteOutcome(topCandidates.get(0), false);
    }

    private record VoteOutcome(String eliminatedId, boolean tied) {}
}
