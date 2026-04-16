package com.werewolf.gameplay.redis;

import com.werewolf.gameplay.model.GameState;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class GameStateRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    public void save(String roomId, GameState state) {
        redisTemplate.opsForValue().set("game:" + roomId, state, Duration.ofSeconds(3600));
    }

    public GameState get(String roomId) {
        Object obj = redisTemplate.opsForValue().get("game:" + roomId);
        if (obj == null) return null;
        // GenericJackson2JsonRedisSerializer might deserialize as Map if types not fully preserved,
        // but with GameState in method sig, we might need a mapper or let it map.
        // Assuming Jackson serializes class type correctly using @class if properly configured,
        // otherwise we cast. We will use ObjectMapper conversion if needed.
        if (obj instanceof GameState) {
            return (GameState) obj;
        } else {
            // fallback, convert from LinkedHashMap if needed.
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.convertValue(obj, GameState.class);
        }
    }

    public void delete(String roomId) {
        redisTemplate.delete("game:" + roomId);
    }

    public void saveRoomMembers(String roomId, List<String> players) {
        if (players != null && !players.isEmpty()) {
            stringRedisTemplate.opsForSet().add("room_members:" + roomId, players.toArray(new String[0]));
            stringRedisTemplate.expire("room_members:" + roomId, Duration.ofSeconds(3600));
        }
    }

    public boolean isProcessed(String eventId) {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey("processed:" + eventId));
    }

    public void markProcessed(String eventId) {
        stringRedisTemplate.opsForValue().set("processed:" + eventId, "1", Duration.ofSeconds(3600));
    }

    public List<String> getAllActiveRooms() {
        ScanOptions options = ScanOptions.scanOptions().match("game:*").count(100).build();
        List<String> keys = new ArrayList<>();
        try (Cursor<byte[]> cursor = stringRedisTemplate.getConnectionFactory().getConnection().scan(options)) {
            while (cursor.hasNext()) {
                keys.add(new String(cursor.next()).replace("game:", ""));
            }
        }
        return keys;
    }
}
