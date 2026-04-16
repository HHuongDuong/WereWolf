package com.werewolf.gameplay.lock;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RedisLockService {

    private final StringRedisTemplate stringRedisTemplate;
    private static final Duration LOCK_TTL = Duration.ofSeconds(5);

    public boolean tryLock(String roomId) {
        Boolean acquired = stringRedisTemplate.opsForValue()
                .setIfAbsent("lock:game:" + roomId, "1", LOCK_TTL);
        return Boolean.TRUE.equals(acquired);
    }

    public void releaseLock(String roomId) {
        stringRedisTemplate.delete("lock:game:" + roomId);
    }
}
