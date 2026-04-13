# Dev Guide — Werewolf Online

> Tài liệu này dành cho cả team. Đọc kỹ phần của mình trước khi code.

---

## Phân công

| Người | Phụ trách |
|-------|-----------|
| **FE dev** | `frontend/` |
| **NestJS dev** | `gateway_service/` · `room_service/` · `chat_service/` · `vote_service/` |
| **Java dev** | `gameplay_service/` |

---

## Setup ban đầu (tất cả mọi người làm 1 lần)

```bash
# 1. Clone repo
git clone <repo-url>
cd WereWolf

# 2. Tạo file .env từ template
cp .env.example .env
# (Không cần sửa gì nếu dùng giá trị mặc định)

# 3. Khởi động infrastructure
docker-compose up -d

# 4. Kiểm tra tất cả đã healthy chưa
docker-compose ps
```

**Sau bước 3, bạn có:**
- PostgreSQL tại `localhost:5436` (schema đã được tạo tự động)
- Redis tại `localhost:6379`
- Kafka tại `localhost:9094` (external listener cho local dev)
- Kafka UI tại **http://localhost:8090** 👈 *dùng để debug events*

---

## 💻 Workflow hàng ngày

### BE dev (NestJS)

```bash
# Chỉ cần infra đang chạy
docker-compose up -d   # lần đầu hoặc sau khi tắt máy

# Phát triển từng service
cd gateway_service
cp ../.env.example .env  # dùng KAFKA_BROKER=localhost:9094
npm install
npm run dev              # hot-reload

# (Tab mới) service khác
cd room_service && npm run dev
```

### Java dev (Spring Boot)

```bash
# Infra chạy sẵn rồi, chỉ cần thêm vào application.properties:
# spring.kafka.bootstrap-servers=localhost:9094
# spring.data.redis.host=localhost
# spring.data.redis.port=6379

cd gameplay_service
./mvnw spring-boot:run
# hoặc dùng IntelliJ run configuration
```

### FE dev

```bash
cd frontend
cp ../.env.example .env
# Thêm: NEXT_PUBLIC_GATEWAY_WS_URL=ws://localhost:3001
npm install
npm run dev   # http://localhost:3000
```

> ⚠️ FE cần `gateway_service` đang chạy để kết nối WebSocket.

---

## 🔌 Port Map (không ai được dùng trùng)

| Service | Port | Ghi chú |
|---------|------|---------|
| Frontend | `3000` | React/Next.js |
| Gateway Service | `3001` | WebSocket endpoint |
| Room Service | `3002` | REST API |
| Chat Service | `3003` | REST API |
| Vote Service | `3004` | REST API |
| Gameplay Service | `8081` | Spring Boot |
| PostgreSQL | `5436` | |
| Redis | `6379` | |
| Kafka (external) | `9094` | cho local dev |
| Kafka UI | `8090` | http://localhost:8090 |

---

## 📨 Kafka Event Contract

> **Quy tắc vàng:** Không tự ý thêm/sửa event schema mà không báo team.  
> Mọi thay đổi phải update bảng này trước khi code.

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

> Room-service nhận event này để UPDATE `rooms SET status='finished', ended_at=NOW()`.

---

## 🌐 WebSocket Event Contract (Gateway ↔ Frontend)

> **Nguồn chuẩn:** RSD mục 6. Dùng `snake_case` cho tên event.

### Server → Client

| Event | Scope | Payload | Ghi chú |
|-------|-------|---------|--------|
| `room_updated` | broadcast | `{ players[], hostId, status }` | Mỗi khi có người join/out |
| `role_assigned` | **private** | `{ role }` | Đầu game, **chỉ gửi đúng socket!** |
| `phase_changed` | broadcast | `{ phase, round, deadlineTimestamp, metadata }` | `metadata` chứa deadIds, reasons |
| `night_action_ack` | **private** | `{ actionType, success, reason? }` | Confirm hành động đêm của từng role |
| `seer_result` | **private** | `{ targetId, role }` | Kết quả tiên tri, chỉ Seer thấy |
| `witch_info` | **private** | `{ werewolfKillTargetId }` | Ai bị sói chọn đêm đó, chỉ Witch thấy |
| `hunter_trigger` | **private** | `{ hunterId }` | Hunter chọn người chết theo |
| `chat_message` | channel | `{ senderName, channel, content, sentAt }` | `channel`: `wolves` hoặc `all` |
| `vote_started` | broadcast | `{ round, durationSec, candidates: [] }` | |
| `vote_result` | broadcast | `{ round, counts, eliminatedId, tied }` | |
| `game_ended` | broadcast | `{ winner, roles: { [guestId]: role } }` | Lúc này mới reveal toàn bộ role |
| `player_disconnected` | broadcast | `{ guestId, reconnectDeadline }` | `reconnectDeadline`: Unix ms |
| `player_reconnected` | broadcast | `{ guestId }` | |
| `error` | **private** | `{ code, message }` | Validation fail hoặc action không hợp lệ |

### Client → Server

| Event | Payload | Validate | Ghi chú |
|-------|---------|----------|---------|
| `create_room` | `{ guestId, displayName, maxPlayers }` | displayName 1–20 ký tự | |
| `join_room` | `{ guestId, displayName, roomCode }` | roomCode 6 ký tự | |
| `configure_room` | `{ roomId, guestId, maxPlayers, config }` | Chỉ host | `config` theo spec 2.6 trong RSD |
| `leave_room` | `{ roomId, guestId }` | | |
| `start_game` | `{ roomId, guestId }` | Chỉ host, đủ người | |
| `night_action` | `{ roomId, actionType, targetId }` | | `actionType`: `guard`\|`seer`\|`werewolf_kill`\|`witch` |
| `chat_message` | `{ roomId, channel, content }` | content max 200 ký tự | |
| `vote` | `{ roomId, round, targetId }` | | |
| `reconnect` | `{ guestId, roomId }` | | Gửi trong vòng 60s sau disconnect |

---

## 🌿 Git Workflow tham khảo

```
main              ← production-ready, chỉ merge khi xong
develop           ← integration branch, mọi người merge vào đây
feature/<name>    ← branch cá nhân khi làm feature

Ví dụ:
feature/gateway-websocket
feature/room-crud
feature/gameplay-card-deal
```

**Quy tắc:** (tham khảo)
- Không commit thẳng vào `main` hoặc `develop`
- Làm xong feature → mở PR vào `develop` → nhờ 1 người review
- Merge conflict ở `docker-compose.yml` → báo nhau ngay, không tự resolve

---

## ✅ Checklist khi bắt đầu làm service mới - tham khảo

- [ ] Service chạy được với `npm run dev` (hoặc `mvnw spring-boot:run`)
- [ ] Dockerfile viết xong, build được: `docker build -t ww-<service> .`
- [ ] `.env.example` đã có đủ biến cho service mình
- [ ] Kết nối được Kafka (produce/consume test event)
- [ ] Kết nối được Redis / PostgreSQL tuỳ service
- [ ] Kafka topic dùng đã khai báo trong bảng contract bên trên

---

## 🛠 Lệnh hữu ích

```bash
# Xem log của infra
docker-compose logs -f kafka
docker-compose logs -f postgres

# Restart một service cụ thể
docker-compose restart redis

# Xoá hết data, bắt đầu lại từ đầu
docker-compose down -v

# Kết nối thẳng vào PostgreSQL
docker exec -it ww-postgres psql -U werewolf -d werewolf

# Kết nối Redis CLI
docker exec -it ww-redis redis-cli

# List Kafka topics
docker exec ww-kafka kafka-topics --bootstrap-server localhost:9092 --list
```
