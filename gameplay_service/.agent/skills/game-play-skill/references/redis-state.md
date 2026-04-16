# Redis State and Room Configuration

## 8. Redis State Schema

```
game:{roomId}              →  JSON String, TTL 3600s    (gameplay-service owns)
room_members:{roomId}      →  SET of guestIds, TTL 3600s
session:{socketId}         →  JSON { guestId, roomId }, TTL 1800s
votes:{roomId}:{round}     →  HASH voterId→targetId, TTL 600s  (vote-service owns)
chat_channel:{roomId}:{ch} →  JSON { enabled, allowedIds[] }, TTL 3600s
```

### Cấu trúc đầy đủ `game:{roomId}`

```json
{
  "phase": "night",
  "round": 1,
  "phaseDeadline": 1718000000000,
  "players": {
    "guest_abc1234567": {
      "displayName": "Alice",
      "role": "WEREWOLF",
      "isAlive": true,
      "hasActedThisNight": false
    }
  },
  "nightActions": {
    "guardTarget": null,
    "wolfTarget": null,
    "witchSaved": null,
    "witchPoisoned": null,
    "seerTarget": null
  },
  "witchPotions": {
    "savePotion": true,
    "killPotion": true
  },
  "lastGuardedId": null,
  "config": {
    "maxPlayers": 8,
    "guardDuration": 30,
    "seerDuration": 30,
    "werewolfDuration": 45,
    "witchDuration": 30,
    "discussDuration": 60,
    "voteDuration": 30
  }
}
```

**Cleanup sau `game.ended` (G-15):**
```
DEL game:{roomId}
DEL room_members:{roomId}
// votes:* tự hết TTL 600s
// session:* do gateway quản lý, không xóa ở đây
```

---

## 9. Room Configuration

Config được gửi trong `room.started` payload — gameplay-service đọc từ event, **không hardcode**.

| Field | Type | Default | Range |
|-------|------|---------|-------|
| `maxPlayers` | int | 8 | 6–12 |
| `guardDuration` | int (s) | 30 | 20–60 |
| `seerDuration` | int (s) | 30 | 20–60 |
| `werewolfDuration` | int (s) | 45 | 30–60 |
| `witchDuration` | int (s) | 30 | 20–60 |
| `discussDuration` | int (s) | 60 | 30–180 |
| `voteDuration` | int (s) | 30 | 20–60 |
