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
        String idempotencyKey = "room_started:" + event.getRoomId();
        if (repo.isProcessed(idempotencyKey)) {
            log.info("Event {} already processed", idempotencyKey);
            return;
        }

        List<String> playerIds = event.getPlayers().stream()
                .map(RoomStartedEvent.PlayerInfo::getGuestId)
                .toList();

        Map<String, PlayerState> players = assignRoles(playerIds);
        long deadline = System.currentTimeMillis() + 15_000L;

        GameState state = GameState.builder()
                .phase(GamePhase.ROLE_REVEAL)
                .round(1)
                .players(players)
                .nightActions(new NightActions())
                .witchPotions(WitchPotions.builder().build())
                .config(event.getConfig())
                .phaseDeadline(deadline)
                .build();

        repo.save(event.getRoomId(), state);
        repo.saveRoomMembers(event.getRoomId(), playerIds);

        Map<String, String> assignedRoles = new HashMap<>();
        players.forEach((playerId, playerState) -> assignedRoles.put(playerId, playerState.getRole()));

        producer.publishRolesAssigned(RolesAssignedEvent.builder()
                .roomId(event.getRoomId())
                .players(assignedRoles)
                .build());

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
