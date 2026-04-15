# Room Service — Implementation Plan

> **Tech:** NestJS · TypeORM · PostgreSQL · KafkaJS  
> **Port:** 3002  
> **Source of truth:** RSD v1.1 mục 2.1, 2.6, 5

---

## 1. Tổng quan kiến trúc

```
Client (Browser)
    ↕ WebSocket
Gateway Service (:3001)
    ↕ HTTP REST
Room Service (:3002)
    ↕ TypeORM
PostgreSQL (:5436)

Room Service
    ↕ Kafka (produce)  → room.started  → gameplay-service
    ↕ Kafka (consume)  ← game.ended    ← gameplay-service
```

---

## 2. Cấu trúc thư mục hiện tại

```
room_service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── room/
│   │   ├── room.module.ts
│   │   ├── room.controller.ts
│   │   ├── room.service.ts
│   │   ├── room.repository.ts
│   │   ├── game-event.consumer.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── room.entity.ts
│   │   │   └── room-player.entity.ts
│   │   │
│   │   └── dto/
│   │       ├── create-room.dto.ts
│   │       ├── join-room.dto.ts
│   │       ├── configure-room.dto.ts
│   │       └── room-action.dto.ts
│   │
│   └── kafka/
│       ├── kafka.module.ts
│       └── kafka.producer.ts
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
├── .env.example
└── implement_plan.md
```

---

## 3. REST API — Danh sách endpoint

| Method | Path | Requirement | Auth | Mô tả |
|--------|------|-------------|------|-------|
| `POST` | `/rooms` | R-01 | – | Tạo phòng mới |
| `POST` | `/rooms/join` | R-02 | – | Join phòng bằng roomCode |
| `PATCH` | `/rooms/:roomId/config` | R-03 | host | Cấu hình maxPlayers + timeouts |
| `POST` | `/rooms/:roomId/start` | R-04 | host | Start game → publish Kafka |
| `DELETE` | `/rooms/:roomId` | R-05 | host | Cancel phòng (chỉ khi waiting) |
| `DELETE` | `/rooms/:roomId/players/:guestId` | R-06 | – | Player tự out |
| `PATCH` | `/rooms/:roomId/host` | R-07 | internal | Assign host mới |

---

## 4. Test thủ công với curl (Cheat Sheet)

```bash
# ── R-01: Tạo phòng ─────────────────────────────────────────────
curl -X POST http://localhost:3002/rooms \
  -H "Content-Type: application/json" \
  -d '{"guestId":"guest_aaaaaaaaaa","displayName":"Alice"}'
# => Output: { "roomId": "...", "roomCode": "XXXXXX", "hostId": "guest_aaaaaaaaaa" }

# ── R-02: Join phòng (thay XXXXXX bằng roomCode thực) ───────────
curl -X POST http://localhost:3002/rooms/join \
  -H "Content-Type: application/json" \
  -d '{"guestId":"guest_bbbbbbbbbb","displayName":"Bob","roomCode":"XXXXXX"}'

# ── R-03: Cấu hình phòng ────────────────────────────────────────
curl -X PATCH http://localhost:3002/rooms/{roomId}/config \
  -H "Content-Type: application/json" \
  -d '{"guestId":"guest_aaaaaaaaaa","maxPlayers":6}'

# ── R-04: Start game (chỉ khi đủ số người) ──────────────────────
curl -X POST http://localhost:3002/rooms/{roomId}/start \
  -H "Content-Type: application/json" \
  -d '{"guestId":"guest_aaaaaaaaaa"}'
# => Output: { "started": true }
# Kiểm tra Kafka UI: http://localhost:8090 → topic "room.started"

# ── R-06: Player tự out ─────────────────────────────────────────
curl -X DELETE http://localhost:3002/rooms/{roomId}/players/guest_bbbbbbbbbb

# ── R-05: Cancel phòng ─────────────────────────────────────────
curl -X DELETE http://localhost:3002/rooms/{roomId} \
  -H "Content-Type: application/json" \
  -d '{"guestId":"guest_aaaaaaaaaa"}'
```

---

## 5. Cấu trúc Database Schema
(Được tự động map vào TypeORM từ `docs/init.sql`)

* **Table `rooms`**
  * `id` (uuid)
  * `code` (varchar 6 kí tự)
  * `host_id` (varchar)
  * `status` (waiting, in_game, finished)
  * `config` (jsonb mặc định sẵn)
* **Table `room_players`**
  * `id` (uuid)
  * `room_id` (FK to rooms)
  * `player_id`
  * `display_name`
