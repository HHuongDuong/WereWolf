# Requirement Specification Document — Werewolf Online

> **Version:** 1.1  
> **Based on:** GDD v1.0 · Architecture Doc v1.0 · PRD v1.0  
> **Target audience:** Developers, QA, System Architects  
> **Stack:** NestJS · Java Spring Boot · PostgreSQL · Redis · Kafka  
> **Player type:** Guest only (không cần tài khoản)

---

## 1. System Overview

Hệ thống cung cấp game Ma Sói realtime multiplayer cho 6–12 người chơi dưới dạng guest, không cần tài khoản. Kiến trúc microservices, giao tiếp nội bộ qua Kafka, realtime client qua WebSocket, game state lưu trong Redis, data persistent lưu trong PostgreSQL.

**Guest identity:** Mỗi lần user mở tab, frontend tự sinh `guestId = "guest_" + nanoid(10)` và lưu vào `sessionStorage`. Không dùng `localStorage` — mỗi tab là một player độc lập, phục vụ việc test nhiều tab.

---

## 2. Functional Requirements

### 2.1 Room Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| R-01 | Tạo phòng | `{ displayName, guestId }` | `{ roomId, roomCode, hostId }` | Mã phòng 6 ký tự chữ hoa + số, unique, tự sinh lại nếu trùng |
| R-02 | Join phòng | `{ roomCode, displayName, guestId }` | `{ roomId, players[] }` | Từ chối nếu `status != waiting` hoặc đã đủ `maxPlayers` |
| R-03 | Cấu hình phòng | `{ roomId, maxPlayers, config }` | `{ updated }` | Chỉ host. `config` gồm timeout từng phase (xem mục 2.6) |
| R-04 | Start game | `{ roomId }` | Publish `room.started` lên Kafka | Chỉ host. Chỉ khi số player hiện tại = `maxPlayers` |
| R-05 | Cancel phòng | `{ roomId }` | Xóa room + room_players | Chỉ host. 
Chỉ khi `status = waiting` |
| R-06 | Player tự out | `{ roomId, guestId }` | Xóa khỏi `room_players` | Nếu là host → chỉ định host mới (R-07) |
| R-07 | Tự động assign host mới | Detect disconnect của host | Cập nhật `host_id` trong `rooms` | Chọn player có `joined_at` sớm nhất còn online |
| R-08 | Cập nhật status phòng khi game kết thúc | Nhận Kafka `game.ended` | `UPDATE rooms SET status='finished', ended_at=NOW()` | |

**Persistent tables:** `rooms`, `room_players`  
**Không expose** R-08 ra WebSocket client — chỉ là internal Kafka consumer.

---

### 2.2 Gameplay Service (Java Spring Boot)

#### Khởi tạo game

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| G-01 | Nhận sự kiện start game | Kafka `room.started` | Khởi tạo `game:{roomId}` trong Redis | |
| G-02 | Chia bài | `{ playerIds[], maxPlayers }` | Gửi `role_assigned` private tới từng player qua gateway | Theo bảng GDD mục 2. Shuffle random. Role chỉ lưu trong Redis, không bao giờ broadcast |

#### Night Phase

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| G-03 | Điều phối night phase | `{ roomId }` | Lần lượt mở từng action window theo thứ tự | Thứ tự: **Guard (30s) → Seer (30s) → Werewolf (45s) → Witch (30s)**. Timeout → bỏ qua, chuyển tiếp |
| G-04 | Xử lý Guard | `{ roomId, guardId, targetId }` | Lưu `nightActions.guard` | Từ chối nếu `targetId` = người được bảo vệ đêm trước (kể cả nếu đó là chính Guard). Guard **được phép** tự bảo vệ mình, nhưng không được 2 đêm liên tiếp. |
| G-05 | Xử lý Seer | `{ roomId, seerId, targetId }` | Gửi `{ role }` private tới Seer | Không broadcast. Không lưu kết quả vào game state chung |
| G-06 | Xử lý Werewolf chọn kill | `{ roomId, targetId }` | Lưu `nightActions.wolves.targetId` | Khi chỉ còn 1 sói thì 1 sói vẫn chọn kill bình thường |
| G-07 | Xử lý Witch | `{ roomId, useSave?, usePoison?, poisonTargetId? }` | Cập nhật kết quả đêm | Witch thấy ai bị sói chọn trước khi quyết định. Từ chối `useSave` nếu không ai bị sói giết đêm đó. Từ chối nếu đã dùng bình tương ứng |
| G-08 | Tổng hợp kết quả đêm | `game:{roomId}.nightActions` | `{ deadIds[], reasons[] }` | Ưu tiên: Guard bảo vệ thành công → sói kill vô hiệu. Witch cứu → override sói kill. Witch độc là độc lập |

#### Day Phase

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| G-09 | Broadcast kết quả đêm | `{ deadIds[] }` | `game.phase.changed { phase: "day", metadata: { deadIds } }` | Cập nhật `isAlive` trong Redis trước khi broadcast. **Không gửi `reasons[]` ra client** theo thiết kế game (GDD mục 3.2) |
| G-10 | Mở thảo luận | `{ roomId }` | `game.chat.channel.updated { channel: "all", enabled: true }` | Kèm `deadline` timestamp |
| G-11 | Bắt đầu vote | `{ roomId, round }` | Publish `game.vote.start` | Sau khi hết thời gian thảo luận |
| G-12 | Nhận kết quả vote | Kafka `vote.result` | Xác định người bị loại, trigger Hunter nếu cần | Tie → không ai bị loại |
| G-13 | Trigger Hunter | `{ roomId, hunterId, reason }` | Gửi event cho Hunter chọn target | Trigger ngay khi Hunter bị loại (bất kể do sói hay vote hay Witch độc). Kiểm tra win condition **sau** khi Hunter chọn xong |

#### Kiểm soát flow chung

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| G-14 | Kiểm tra win condition | `game:{roomId}` | `{ winner: "werewolf" \| "villager" \| null }` | Kiểm tra sau **mỗi lần có người chết**. Sói thắng khi `wolves_alive >= villagers_alive`. Dân thắng khi `wolves_alive == 0` |
| G-15 | Kết thúc game | `{ roomId, winner }` | Publish `game.ended`. Xóa Redis keys của phòng | |
| G-16 | Timeout handling | Phase timer hết | Bỏ qua action chưa thực hiện, chuyển bước tiếp | Mỗi phase có timer riêng, không dùng chung |
| G-17 | Xử lý reconnect | `{ roomId, guestId, newSocketId }` | Gửi lại current game state private cho player đó | Trong vòng 60s. Giữ nguyên role, `isAlive`, trạng thái hành động đêm |
| G-18 | Xử lý player quá 60s không reconnect | `{ roomId, guestId }` | Coi như đã chết (nếu đang alive) | Kiểm tra win condition sau đó |

**Redis keys được gameplay-service quản lý:**

```
game:{roomId}           → JSON — toàn bộ game state         TTL: 3600s
room_members:{roomId}   → SET of guestIds                   TTL: 3600s
session:{socketId}      → { guestId, roomId }               TTL: 1800s
```

---

### 2.3 Chat Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| C-01 | Nhận lệnh mở/đóng channel | Kafka `game.chat.channel.updated` | Cập nhật trạng thái channel trong Redis | Key: `chat_channel:{roomId}:{channel}` → `{ enabled, allowedIds[] }` |
| C-02 | Nhận tin nhắn từ client | `{ roomId, channel, senderId, content }` (qua gateway) | Lưu DB + broadcast | Từ chối nếu channel disabled hoặc `senderId` không có trong `allowedIds` |
| C-03 | Broadcast tin nhắn | `{ roomId, channel, message }` | Gửi qua gateway tới đúng player set | `wolves`: chỉ gửi sói còn sống. `all`: toàn bộ player còn sống |
| C-04 | Kiểm tra người chết | `{ roomId, senderId }` | Từ chối nếu player đã chết | Đọc `isAlive` từ `game:{roomId}` trong Redis |
| C-05 | Lưu tin nhắn | `{ roomId, round, phase, channel, senderId, senderName, content }` | INSERT vào `messages` | Dùng để debug, không serve lại trong game |

**Persistent table:** `messages`

---

### 2.4 Vote Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| V-01 | Bắt đầu phiên vote | Kafka `game.vote.start` | Tạo `votes:{roomId}:{round}` HASH trong Redis | Xóa hash cũ nếu còn tồn tại |
| V-02 | Nhận vote từ client | `{ roomId, round, voterId, targetId }` | `HSET votes:{roomId}:{round} voterId targetId` | Redis HSET atomic, không race condition |
| V-03 | Validate vote | `{ roomId, round, voterId, targetId }` | `{ valid: bool, reason? }` | Từ chối nếu: đã vote rồi (`HEXISTS`), target không alive, vote cho mình, voter đã chết |
| V-04 | Tổng hợp kết quả | `HGETALL votes:{roomId}:{round}` | `{ counts: Map<targetId, count>, eliminated?: guestId, tied: bool }` | Không random tiebreak: `tied=true` → `eliminated=null` |
| V-05 | Publish kết quả | `{ roomId, round }` | Publish `vote.result` | Trigger sau khi hết `durationSec` hoặc tất cả player còn sống đã vote |

**Redis key:** `votes:{roomId}:{round}` → HASH, TTL 600s

---

### 2.5 Gateway Service (NestJS + WebSocket)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|---------|
| WS-01 | Nhận kết nối mới | `{ guestId, displayName }` | `{ socketId }`. Lưu `session:{socketId}` vào Redis | `guestId` do frontend sinh, gateway không tự sinh |
| WS-02 | Route action từ client | WS event từ client | Forward tới đúng service | Xem bảng Client → Gateway ở mục 6 |
| WS-03 | Broadcast event từ Kafka | Kafka event | Gửi WebSocket tới đúng socket set trong room | Đọc `room_members:{roomId}` để biết ai cần nhận |
| WS-04 | Gửi event private | `{ guestId, event, data }` | Gửi tới đúng 1 socket | Dùng cho: `role_assigned`, `seer_result`, `hunter_trigger`, `witch_info` |
| WS-05 | Xử lý disconnect | `socket.id` | Xóa `session:{socketId}`, thông báo room service và gameplay service | Không xóa khỏi `room_members` ngay — chờ 60s |
| WS-06 | Xử lý reconnect | `{ guestId, roomId }` | Tìm session cũ theo `guestId`, gán `socketId` mới | Trong 60s. Gọi gameplay service lấy lại state |

---

### 2.6 Room Configuration Spec

| Config | Kiểu | Mặc định | Khoảng cho phép | Mô tả |
|--------|------|----------|-----------------|-------|
| `maxPlayers` | int | 8 | 6–12 | Số người chơi |
| `guardDuration` | int (giây) | 30 | 20–60 | Thời gian Guard hành động |
| `seerDuration` | int (giây) | 30 | 20–60 | Thời gian Seer hành động |
| `werewolfDuration` | int (giây) | 45 | 30–60 | Thời gian Sói chat + chọn target |
| `witchDuration` | int (giây) | 30 | 20–60 | Thời gian Phù thủy hành động |
| `discussDuration` | int (giây) | 60 | 30–180 | Thời gian thảo luận ban ngày |
| `voteDuration` | int (giây) | 30 | 20–60 | Thời gian vote |

Config được gửi trong `room.started` payload để gameplay-service dùng, không hardcode.

---

## 3. Non-Functional Requirements

| ID | Yêu cầu | Tiêu chí | Cách kiểm tra |
|----|---------|----------|---------------|
| N-01 | WebSocket latency | < 200ms p95 | Load test với k6, đo round-trip |
| N-02 | Vote consistency | Không mất vote, không double count khi 12 người vote cùng lúc | Concurrent test: 12 goroutine vote đồng thời, so sánh kết quả |
| N-03 | Fault tolerance | 1 service down → không sập hệ thống, Kafka giữ event chờ consumer | Kill từng service, verify Kafka replay khi restart |
| N-04 | Role privacy | Role không bao giờ xuất hiện trong broadcast WebSocket event hay Kafka topic | Code review + network capture |
| N-05 | Reconnect success rate | > 95% thành công trong 60s | Integration test: ngắt kết nối, reconnect sau 30s, verify state |
| N-06 | Timeout accuracy | ±2s so với config | Unit test timer + integration test đo thực tế |
| N-07 | Concurrent rooms | 50 phòng chạy song song không ảnh hưởng nhau | Chạy 50 simulate script song song |
| N-08 | Memory | Redis key được xóa sau khi game kết thúc | Verify sau `game.ended`: không còn `game:{roomId}` trong Redis |

---

## 4. Data Requirements

### 4.1 PostgreSQL Schema

#### rooms
| Column | Type | Constraint | Ghi chú |
|--------|------|------------|---------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| code | VARCHAR(6) | UNIQUE NOT NULL | Chữ hoa + số |
| host_id | VARCHAR(50) | NOT NULL | guestId của host |
| status | VARCHAR(20) | NOT NULL DEFAULT 'waiting' | waiting \| in_game \| finished |
| max_players | INT | NOT NULL | 6–12 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| ended_at | TIMESTAMPTZ | | NULL khi chưa kết thúc |

#### room_players
| Column | Type | Constraint | Ghi chú |
|--------|------|------------|---------|
| id | UUID | PK | |
| room_id | UUID | FK → rooms(id) ON DELETE CASCADE | |
| player_id | VARCHAR(50) | NOT NULL | guestId |
| display_name | VARCHAR(50) | NOT NULL | |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | Dùng để chọn host mới |
| UNIQUE | | (room_id, player_id) | |

#### messages
| Column | Type | Constraint | Ghi chú |
|--------|------|------------|---------|
| id | BIGSERIAL | PK | Nhanh hơn UUID cho insert liên tục |
| room_id | UUID | FK → rooms(id) ON DELETE CASCADE | |
| round | INT | NOT NULL | |
| phase | VARCHAR(20) | NOT NULL | night \| day |
| channel | VARCHAR(20) | NOT NULL | all \| wolves |
| sender_id | VARCHAR(50) | NOT NULL | |
| sender_name | VARCHAR(50) | NOT NULL | Denormalized, khỏi JOIN |
| content | TEXT | NOT NULL | |
| sent_at | TIMESTAMPTZ | DEFAULT NOW() | |

```sql
CREATE INDEX idx_messages_room_channel
  ON messages(room_id, channel, sent_at DESC);
```

### 4.2 Redis Key Schema

| Key pattern | Type | TTL | Nội dung | Owner |
|-------------|------|-----|----------|-------|
| `game:{roomId}` | JSON String | 3600s | phase, round, players (role, isAlive, actions), nightActions, phaseDeadline | gameplay-service |
| `room_members:{roomId}` | SET | 3600s | Set of guestIds | gameplay-service |
| `session:{socketId}` | JSON String | 1800s | `{ guestId, roomId }` | gateway-service |
| `votes:{roomId}:{round}` | HASH | 600s | voterId → targetId | vote-service |
| `chat_channel:{roomId}:{channel}` | JSON String | 3600s | `{ enabled, allowedIds[] }` | chat-service |

**Cleanup:** Khi `game.ended`, gameplay-service xóa `game:{roomId}` và `room_members:{roomId}`. `votes:*` tự hết TTL.

---

## 5. Kafka Events Specification

| Topic | Producer | Consumer | Payload |
|-------|----------|----------|---------|
| `room.started` | room-service | gameplay-service | `{ roomId, roomCode, players: [{ guestId, displayName }], config: { maxPlayers, guardDuration, seerDuration, werewolfDuration, witchDuration, discussDuration, voteDuration } }` |
| `room.updated` | room-service | gateway-service | `{ roomId, roomCode, hostId, status, players: [{ guestId, displayName }] }` |
| `room.deleted` | room-service | gateway-service | `{ roomId }` |
| `game.phase.changed` | gameplay-service | gateway-service | `{ roomId, phase, round, deadlineTimestamp, metadata: { deadIds?: [], eliminatedId?: string } }` |
| `game.chat.channel.updated` | gameplay-service | chat-service | `{ roomId, channel, enabled, allowedGuestIds: [] }` |
| `game.vote.start` | gameplay-service | vote-service | `{ roomId, round, alivePlayerIds: [], durationSec }` |
| `vote.result` | vote-service | gameplay-service | `{ roomId, round, counts: { [guestId]: number }, eliminatedId: string \| null, tied: bool }` |
| `game.ended` | gameplay-service | room-service | `{ roomId, winner: "werewolf" \| "villager", round: number }` |

**Quy tắc chung:**
- Tất cả payload dùng `camelCase`
- Tất cả timestamp là Unix ms (`number`)
- Không bao giờ đặt `role` vào bất kỳ Kafka topic nào

---

## 6. WebSocket Events (Client-facing)

### Client → Gateway

| Event | Payload | Validate | Ghi chú |
|-------|---------|----------|---------|
| `create_room` | `{ guestId, displayName, maxPlayers }` | displayName 1–20 ký tự, maxPlayers 6–12 | |
| `join_room` | `{ guestId, displayName, roomCode }` | roomCode 6 ký tự | |
| `configure_room` | `{ roomId, maxPlayers, config }` | Chỉ host | |
| `leave_room` | `{ roomId, guestId }` | | |
| `start_game` | `{ roomId }` | Chỉ host, đủ người | |
| `night_action` | `{ roomId, actionType, targetId }` | actionType: guard\|seer\|werewolf_kill\|witch | |
| `chat_message` | `{ roomId, channel, content }` | content max 200 ký tự | |
| `vote` | `{ roomId, round, targetId }` | | |
| `reconnect` | `{ guestId, roomId }` | | |

### Gateway → Client

| Event | Payload | Gửi tới | Ghi chú |
|-------|---------|---------|---------|
| `room_updated` | `{ players[], hostId, status }` | Broadcast room | Mỗi khi có người join/out |
| `role_assigned` | `{ role }` | **Private** 1 player | Đầu game, không broadcast |
| `phase_changed` | `{ phase, round, deadlineTimestamp, metadata }` | Broadcast room | |
| `night_action_ack` | `{ actionType, success, reason? }` | **Private** 1 player | Xác nhận đã nhận action |
| `seer_result` | `{ targetId, role }` | **Private** Seer | |
| `witch_info` | `{ soidKillTargetId }` | **Private** Witch | Ai bị sói chọn đêm đó |
| `hunter_trigger` | `{ hunterId }` | **Private** Hunter | Hunter chọn người chết theo |
| `chat_message` | `{ senderName, channel, content, sentAt }` | Broadcast theo channel | |
| `vote_started` | `{ round, durationSec, candidates: [] }` | Broadcast room | |
| `vote_result` | `{ round, counts, eliminatedId, tied }` | Broadcast room | |
| `game_ended` | `{ winner, roles: { [guestId]: role } }` | Broadcast room | Lúc này reveal hết role |
| `player_disconnected` | `{ guestId, reconnectDeadline }` | Broadcast room | |
| `player_reconnected` | `{ guestId }` | Broadcast room | |
| `error` | `{ code, message }` | **Private** 1 player | Validation fail, action không hợp lệ |

---

## 7. Edge Cases & Constraints

### 7.1 Edge Cases đã xác định

| ID | Tình huống | Xử lý |
|----|------------|-------|
| E-01 | Guard bảo vệ cùng 1 người 2 đêm liên tiếp | Từ chối. Server check, UI disable option |
| E-02 | Guard tự bảo vệ mình | **Được phép.** Server chấp nhận. UI hiện bản thân trong danh sách nhưng bị disable nếu đã tự bảo vệ đêm trước. |
| E-03 | Witch dùng bình cứu khi không ai bị sói giết | Từ chối `useSave`. Không phạm lượt |
| E-04 | Witch đã hết cả 2 bình | Witch vẫn tồn tại trong game, không có action window đêm nữa |
| E-05 | Sói còn 1 con | Vẫn chọn kill bình thường. Không có kênh chat nhóm (chỉ 1 người) |
| E-06 | Hunter bị giết (đêm, vote, hoặc Witch độc) | Trigger `hunter_trigger`. Kiểm tra win condition **sau** khi Hunter chọn xong |
| E-07 | Hunter bị giết đêm khi Guard bảo vệ Hunter | Hunter không chết → không trigger |
| E-08 | Vote tie | Không ai bị loại. Ghi nhận `tied=true`, tiếp tục vòng tiếp theo |
| E-09 | Tie xảy ra liên tiếp nhiều lần | Không giới hạn, cứ tie là bỏ qua, tiếp tục đêm mới |
| E-10 | Reconnect sau khi game đã kết thúc | Trả về `game_ended` state. Không cho vào game cũ |
| E-11 | Player chết trước khi kịp vote | Vote bị bỏ qua nếu gửi sau khi `isAlive=false` |
| E-12 | Tất cả sói chết trong đêm (Witch độc tất cả) | Kiểm tra win condition sau tổng hợp đêm, kết thúc ngay, không chạy day phase |
| E-13 | Sói chọn kill người đã được Guard bảo vệ | Không ai chết. Log rõ lý do trong `reasons[]` |
| E-14 | Host disconnect trong lúc game đang chạy | Assign host mới (room-service), game tiếp tục bình thường |
| E-15 | Tất cả player cùng team disconnect | Sau 60s, gameplay-service kết thúc game, không xác định winner |

### 7.2 Constraints (cứng, không được thay đổi)

- Không dùng HTTP sync call giữa các service nội bộ — chỉ dùng Kafka
- Gameplay-service không được đọc/ghi PostgreSQL trong lúc game đang chạy
- Role của player chỉ tồn tại trong Redis (`game:{roomId}`). Không bao giờ đặt vào Kafka payload, WebSocket broadcast, hay log
- Mỗi service chỉ đọc/ghi bảng PostgreSQL của mình
- Reconnect window cố định 60s, không cấu hình được theo phòng
- `guestId` do frontend sinh, backend không tự sinh — backend chỉ validate format `guest_` + 10 ký tự

---

## 8. DB Ownership

| Service | PostgreSQL | Redis |
|---------|------------|-------|
| room-service | rooms, room_players (đọc/ghi) | — |
| chat-service | messages (đọc/ghi) | chat_channel:{roomId}:{channel} |
| gameplay-service | — (không dùng trong game) | game:{roomId}, room_members:{roomId}, session:{socketId} |
| vote-service | — | votes:{roomId}:{round} |
| gateway-service | — | session:{socketId} (đọc) |

---

## 9. Testing Requirements

### 9.1 Unit Test

| Service | Coverage | Bắt buộc test |
|---------|----------|---------------|
| gameplay-service | ≥ 80% | Chia bài đúng tỉ lệ theo bảng GDD. Thứ tự night action. Từng role action + edge case. Win condition (mọi nhánh). Timeout handling |
| vote-service | ≥ 80% | Atomic vote. Tie detection. Validate từ chối đúng các trường hợp |
| room-service | ≥ 70% | Tạo mã unique. Assign host mới. Validate đủ người trước start |
| chat-service | ≥ 70% | Từ chối gửi khi channel disabled. Từ chối người chết chat |
| gateway-service | ≥ 60% | Session map. Private vs broadcast routing |

### 9.2 Integration Test

| ID | Test case |
|----|-----------|
| IT-01 | `room.started` → gameplay nhận → chia bài → tất cả player nhận `role_assigned` |
| IT-02 | Night phase đầy đủ: Guard → Seer → Werewolf → Witch → `game.phase.changed { phase: "day" }` |
| IT-03 | 12 player vote đồng thời → không mất vote, không double count, kết quả đúng |
| IT-04 | Vote tie → `eliminatedId=null` → game tiếp tục đêm mới |
| IT-05 | Disconnect 30s → reconnect → vẫn trong game đúng role, nhận lại state |
| IT-06 | Hunter bị vote → `hunter_trigger` → Hunter chọn target → cả 2 chết → win condition check |
| IT-07 | `game.ended` → Redis keys bị xóa → rooms.status = 'finished' |

### 9.3 End-to-end Test

- Chạy `scripts/simulate-game.js` giả lập 1 phòng 8 người đầy đủ từ join → kết thúc
- Chạy 2 phòng song song, verify không ảnh hưởng nhau (role, vote, chat tách biệt)

### 9.4 Simulate Script

```javascript
// scripts/simulate-game.js
// Chạy: node simulate-game.js
// Giả lập 8 player join phòng, start game, xem toàn bộ event flow

const { io } = require("socket.io-client");
const GATEWAY = "http://localhost:3001";

const players = Array.from({ length: 8 }, (_, i) => ({
  guestId: `guest_test000${i}`,
  name: `Player${i + 1}`,
  socket: null,
  role: null,
}));

async function run() {
  // Connect tất cả
  players.forEach(p => {
    p.socket = io(GATEWAY, { query: { guestId: p.guestId, displayName: p.name } });
    p.socket.on("role_assigned", ({ role }) => {
      p.role = role;
      console.log(`[${p.name}] role: ${role}`);
    });
    p.socket.onAny((event, data) => {
      if (event !== "role_assigned")
        console.log(`[${p.name}] ${event}:`, JSON.stringify(data));
    });
  });

  await delay(500);

  // Player 0 tạo phòng
  players[0].socket.emit("create_room", { guestId: players[0].guestId, displayName: players[0].name, maxPlayers: 8 });

  players[0].socket.once("room_updated", ({ roomId, roomCode }) => {
    console.log(`Room created: ${roomCode}`);

    // Các player còn lại join
    players.slice(1).forEach(p => {
      p.socket.emit("join_room", { guestId: p.guestId, displayName: p.name, roomCode });
    });

    setTimeout(() => {
      players[0].socket.emit("start_game", { roomId });
    }, 1000);
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));
run();
```

---

## 10. Acceptance Criteria for MVP

| ID | Tiêu chí | Must/Should |
|----|----------|-------------|
| A-01 | Tạo phòng, join bằng mã, start game với 6–12 người | Must |
| A-02 | Cả 6 role hoạt động đúng theo GDD (action, timing, edge case) | Must |
| A-03 | Night phase chạy đúng thứ tự Guard → Seer → Werewolf → Witch | Must |
| A-04 | Chat wolves ban đêm chỉ sói thấy, chat all ban ngày mở cho tất cả | Must |
| A-05 | Vote atomic, không race condition, tie không loại ai | Must |
| A-06 | Win condition kiểm tra đúng thời điểm (sau mỗi lần có người chết) | Must |
| A-07 | Reconnect trong 60s giữ được role và trạng thái game | Must |
| A-08 | Role không bao giờ xuất hiện trong broadcast event hay network log | Must |
| A-09 | Timeout tự động chuyển phase nếu player không hành động | Must |
| A-10 | Hunter trigger đúng thời điểm, kiểm tra win sau khi trigger xong | Must |
| A-11 | Redis keys được dọn sạch sau khi game kết thúc | Must |
| A-12 | Deploy được bằng `docker compose up` | Must |
| A-13 | Frontend connect WebSocket, hiển thị đúng role và phase | Must |
| A-14 | Simulate script chạy thành công 1 game đầy đủ | Should |
| A-15 | 2 phòng chạy song song không ảnh hưởng nhau | Should |

---

## 11. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-03-29 | Initial version từ GDD, PRD, Architecture Doc |
| 1.1 | 2025-04-12 | Fix G-05 (1 sói vẫn kill được). Thêm 2.6 Room Config Spec. Tách night phase timeout riêng từng role. Thêm E-02/E-03/E-07/E-12/E-13/E-14/E-15. Thêm `witch_info`, `hunter_trigger`, `error` WebSocket events. Thêm `chat_channel` Redis key. Thêm guest ID generation spec. Thêm DB Ownership table. Bổ sung simulate script. |
