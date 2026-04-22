package com.werewolf.vote.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.werewolf.vote.dto.GameVoteStartEvent;
import com.werewolf.vote.dto.VoteMetaDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class VoteSessionService {

    private final RedisTemplate<String, String> redis;
    private final ObjectMapper objectMapper;
    private final VoteResultService resultService;
    private final ScheduledExecutorService scheduler;

    public VoteSessionService(
            RedisTemplate<String, String> redis,
            ObjectMapper objectMapper,
            @Lazy VoteResultService resultService,
            @Qualifier("voteScheduler") ScheduledExecutorService scheduler) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.resultService = resultService;
        this.scheduler = scheduler;
    }

    public static String metaKey(String roomId, int round) {
        return "vote_meta:" + roomId + ":" + round;
    }

    public static String hashKey(String roomId, int round) {
        return "votes:" + roomId + ":" + round;
    }

    public void openSession(GameVoteStartEvent event) {
        String metaKey = metaKey(event.roomId(), event.round());

        if (Boolean.TRUE.equals(redis.hasKey(metaKey))) {
            log.warn("Vote session already exists: {}", metaKey);
            return;
        }

        redis.delete(hashKey(event.roomId(), event.round()));

        long now = System.currentTimeMillis();
        VoteMetaDto meta = new VoteMetaDto(
            event.roomId(),
            event.round(),
            event.alivePlayerIds(),
            event.durationSec(),
            now,
            now + (long) event.durationSec() * 1000,
            false
        );

        redis.opsForValue().set(
            metaKey,
            serialize(meta),
            Duration.ofSeconds(event.durationSec() + 10)
        );

        log.info("Vote session opened: room={}, round={}, players={}, duration={}s",
            event.roomId(), event.round(),
            event.alivePlayerIds().size(), event.durationSec());

        scheduler.schedule(
            () -> resultService.closeSession(event.roomId(), event.round()),
            event.durationSec(),
            TimeUnit.SECONDS
        );
    }

    public VoteMetaDto getMeta(String roomId, int round) {
        String raw = redis.opsForValue().get(metaKey(roomId, round));
        if (raw == null) return null;
        return deserialize(raw);
    }

    public void markClosed(String roomId, int round) {
        VoteMetaDto meta = getMeta(roomId, round);
        if (meta == null) return;
        Long ttl = redis.getExpire(metaKey(roomId, round), TimeUnit.SECONDS);
        redis.opsForValue().set(
            metaKey(roomId, round),
            serialize(meta.withClosed()),
            Duration.ofSeconds(Math.max(ttl != null ? ttl : 5, 5))
        );
    }

    private String serialize(VoteMetaDto dto) {
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize VoteMetaDto", e);
        }
    }

    private VoteMetaDto deserialize(String json) {
        try {
            return objectMapper.readValue(json, VoteMetaDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize VoteMetaDto", e);
        }
    }
}
