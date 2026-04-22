package com.werewolf.gameplay.service;

import com.werewolf.gameplay.kafka.GameEventProducer;
import com.werewolf.gameplay.lock.RedisLockService;
import com.werewolf.gameplay.model.GamePhase;
import com.werewolf.gameplay.model.GameState;
import com.werewolf.gameplay.model.NightActions;
import com.werewolf.gameplay.model.PlayerState;
import com.werewolf.gameplay.model.WitchPotions;
import com.werewolf.gameplay.model.events.ChatChannelEvent;
import com.werewolf.gameplay.model.events.PhaseChangedEvent;
import com.werewolf.gameplay.model.events.RolesAssignedEvent;
import com.werewolf.gameplay.model.events.RoomStartedEvent;
import com.werewolf.gameplay.redis.GameStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameInitService {

    private final GameStateRepository repo;
    private final GameEventProducer producer;
    private final RedisLockService lockService;

    public void handleRoomStarted(RoomStartedEvent event) {
        // k1. Kiểm tra tránh xử lý trùng
        String idempotencyKey = "room_started:" + event.getRoomId();
        if (repo.isProcessed(idempotencyKey)) {
            log.info("Event {} already processed", idempotencyKey);
            return;
        }
        // mảng chứa id của các player
        List<String> playerIds = event.getPlayers().stream()
                .map(RoomStartedEvent.PlayerInfo::getGuestId)
                .toList();
        // k2. Phân vai
        // players:
        // {
        // "guest_id_abc": {
        // "role": "WEREWOLF",
        // "isAlive": true,
        // "protectedThisNight": false
        // },
        // "guest_id_xyz": {
        // "role": "SEER",
        // "isAlive": true,
        // "protectedThisNight": false
        // }
        // }

        Map<String, PlayerState> players = assignRoles(playerIds);
        // 15s để hiển thị role cho player xem (trước khi bước vào đêm đầu tiên)
        long deadline = System.currentTimeMillis() + 25_000L;
        // Init Game State trong Redis
        GameState state = GameState.builder()
                .phase(GamePhase.ROLE_REVEAL) // phase đầu tiên
                .round(1) // Vòng 1
                .players(players) // Map<guestId,PlayerState>
                .nightActions(new NightActions()) // Init rỗng
                .witchPotions(WitchPotions.builder().build()) // Witch có 2 bình
                .config(event.getConfig()) // Config từ room service gửi sang
                .phaseDeadline(deadline) // 15s để xem role
                .build();
        // Lưu vào Redis: game:{roomId}
        repo.save(event.getRoomId(), state);
        repo.saveRoomMembers(event.getRoomId(), playerIds); // Lưu danh sách players

        // Map kiểu {"guest_abc": "SEER", "guest_xyz": "WEREWOLF"}
        Map<String, String> assignedRoles = new HashMap<>();
        players.forEach((playerId, playerState) -> assignedRoles.put(playerId, playerState.getRole()));

        // gọi internalWsClient.sendRoleAssigned() để gửi private event role_assigned cho từng player qua Gateway
        // => chỉ player đó biết role của mình, ko broadcast
        producer.publishRolesAssigned(RolesAssignedEvent.builder()
                .roomId(event.getRoomId())
                .players(assignedRoles) // Map<guestId, role>
                .build());
        // pub lên topic "game.phase.changed" -> Gateway nhận và broadcast cho tất cả player trong phòng
        // => FE hiển thị "Xem vai trò" countdown 15s
        producer.publishPhaseChanged(PhaseChangedEvent.builder()
                .roomId(event.getRoomId())
                .phase(GamePhase.ROLE_REVEAL.toValue())
                .round(state.getRound())
                .deadlineTimestamp(state.getPhaseDeadline())
                .metadata(PhaseChangedEvent.Metadata.builder()
                        .deadIds(List.of())
                        .eliminatedId(null)
                        .currentNightRole(null)
                        .build())
                .build());
        // mark là đã xử lý -> lưu vào Redis để tránh xử lý lại nếu Kafka retry
        repo.markProcessed(idempotencyKey);
    }

    public Map<String, PlayerState> assignRoles(List<String> playerIds) {
        List<String> shuffled = new ArrayList<>(playerIds);
        Collections.shuffle(shuffled);

        List<String> roles = buildRoleList(shuffled.size());
        Map<String, PlayerState> players = new LinkedHashMap<>();

        for (int i = 0; i < shuffled.size(); i++) {
            players.put(shuffled.get(i), PlayerState.builder()
                    .role(roles.get(i))
                    .isAlive(true)
                    .protectedThisNight(false)
                    .build());
        }
        return players;
    }

    private List<String> buildRoleList(int size) {
        List<String> roles = new ArrayList<>();
        int wolves = size >= 9 ? 3 : 2;

        for (int i = 0; i < wolves; i++) {
            roles.add("WEREWOLF");
        }
        roles.add("SEER");
        if (size >= 8) {
            roles.add("GUARD");
        }
        if (size >= 10) {
            roles.add("WITCH");
        }
        if (size >= 12) {
            roles.add("HUNTER");
        }

        while (roles.size() < size) {
            roles.add("VILLAGER");
        }
        return roles;
    }
}
