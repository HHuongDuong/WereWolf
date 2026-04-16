# Events Reference

## 6. Kafka Events

### Topics & Payload

#### `room.started`
- **Producer:** room-service  
- **Consumer:** gameplay-service  
```json
{
  "roomId": "uuid",
  "roomCode": "A3K9Z1",
  "players": [
    { "guestId": "guest_abc", "displayName": "Alice" }
  ],
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

#### `game.phase.changed`
- **Producer:** gameplay-service  
- **Consumer:** gateway-service  
```json
{
  "roomId": "uuid",
  "phase": "night" | "day",
  "round": 1,
  "deadlineTimestamp": 1712800000000,
  "metadata": {
    "deadIds": ["guest_xyz"],
    "eliminatedId": "guest_xyz"
  }
}
```

> `reasons[]` được gameplay-service tính nội bộ (G-08) nhưng **không gửi ra client** theo thiết kế game. Players chỉ biết ai chết, không biết lý do.

#### `game.chat.channel.updated`
- **Producer:** gameplay-service  
- **Consumer:** chat-service  
```json
{
  "roomId": "uuid",
  "channel": "wolves" | "all",
  "enabled": true | false,
  "allowedGuestIds": ["guest_abc", "guest_def"],
  "round": 1
}
```

> `allowedGuestIds`: danh sách player được phép dùng channel. Chat-service dùng để validate sender.

#### `game.vote.start`
- **Producer:** gameplay-service  
- **Consumer:** vote-service  
```json
{
  "roomId": "uuid",
  "round": 1,
  "alivePlayerIds": ["guest_abc", "guest_def"],
  "durationSec": 30
}
```

> `alivePlayerIds`: vừa là danh sách voter hợp lệ, vừa là danh sách target hợp lệ (trừ voter tự vote cho mình — vote-service tự validate).

#### `vote.result`
- **Producer:** vote-service  
- **Consumer:** gameplay-service  
```json
{
  "roomId": "uuid",
  "round": 1,
  "eliminatedId": "guest_xyz" | null,
  "counts": {
    "guest_xyz": 3,
    "guest_abc": 1
  },
  "tied": false
}
```

> Nếu `tied = true` thì `eliminatedId = null`. Gameplay-service không random tiebreak.

#### `game.ended`
- **Producer:** gameplay-service  
- **Consumer:** room-service  
```json
{
  "roomId": "uuid",
  "winner": "werewolf" | "villager",
  "round": 4
}
```


### Gameplay-service CONSUME

| Topic | Payload | Xử lý |
|-------|---------|-------|
| `room.started` | `{ roomId, players:[{guestId,displayName}], config:{...} }` | G-01: Init Redis. G-02: Deal cards. Bắt đầu Night round 1 |
| `vote.result` | `{ roomId, round, counts:{[guestId]:number}, eliminatedId:string\|null, tied:bool }` | G-12: Xử lý eliminated, trigger Hunter nếu cần, checkWin |



### Gameplay-service PRODUCE

| Topic | Payload | Trigger |
|-------|---------|---------|
| `game.phase.changed` | `{ roomId, phase, round, deadlineTimestamp, metadata:{ deadIds?:[], eliminatedId?:string } }` | Mỗi lần chuyển phase |
| `game.chat.channel.updated` | `{ roomId, channel, enabled, allowedGuestIds:[] }` | Đầu đêm (wolves on), đầu ngày (all on) |
| `game.vote.start` | `{ roomId, round, alivePlayerIds:[], durationSec }` | Hết thời gian thảo luận |
| `game.ended` | `{ roomId, winner:"werewolf"\|"villager" }` | Win condition thỏa |

**Quy tắc bất biến:**
- Payload dùng `camelCase`
- Timestamp là Unix milliseconds (`long`)
- **Không bao giờ** đặt `role` vào bất kỳ Kafka topic nào

---

## 7. WebSocket Events (qua Gateway)

Gameplay-service không gọi WebSocket trực tiếp. Gửi lệnh đến Gateway qua Kafka/internal để gateway forward đến đúng client.

### Private — chỉ 1 player nhận

| Event | Payload | Gửi khi |
|-------|---------|---------|
| `role_assigned` | `{ role }` | Sau deal cards |
| `seer_result` | `{ targetId, role }` | Seer submit action |
| `witch_info` | `{ wolfKillTargetId }` | Đầu action window Witch |
| `hunter_trigger` | `{ hunterId }` | Ngay khi Hunter bị giết |
| `night_action_ack` | `{ actionType, success, reason? }` | Sau mỗi night action |
| `error` | `{ code, message }` | Validation fail |

### Broadcast — cả phòng nhận

| Event | Payload |
|-------|---------|
| `phase_changed` | `{ phase, round, deadlineTimestamp, metadata }` |
| `vote_started` | `{ round, durationSec, candidates:[] }` |
| `vote_result` | `{ round, counts, eliminatedId, tied }` |
| `game_ended` | `{ winner, roles:{ [guestId]: role } }` ← **chỉ lúc này mới reveal role** |
| `player_disconnected` | `{ guestId, reconnectDeadline }` |
| `player_reconnected` | `{ guestId }` |

### Client → Gameplay (qua Gateway)

| WS Event | Payload | Ghi chú |
|----------|---------|---------|
| `night_action` | `{ roomId, actionType, targetId }` | actionType: `guard\|seer\|werewolf_kill\|witch` |
| `reconnect` | `{ guestId, roomId }` | Trong vòng 60s |
