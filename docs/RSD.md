# Requirement Specification Document — Werewolf Online

> **Version:** 1.0  
> **Based on:** GDD v1.0 · Architecture Doc v1.0 · PRD v1.0  
> **Target audience:** Developers, QA, System Architects  
> **Stack:** NestJS, Java Spring Boot, PostgreSQL, Redis, Kafka

---

## 1. System Overview

Hệ thống cung cấp game Ma Sói realtime multiplayer cho 6–12 người chơi dưới dạng guest, không cần tài khoản. Kiến trúc microservices, giao tiếp qua Kafka, realtime qua WebSocket, state lưu trong Redis.

---

## 2. Functional Requirements

### 2.1 Room Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|--------|
| R-01 | Tạo phòng | `{ displayName: string }` | `{ roomId, roomCode, hostId }` | Mã phòng 6 ký tự ngẫu nhiên, unique |
| R-02 | Join phòng | `{ roomCode, displayName }` | `{ roomId, players[] }` | Không được join khi game đang chạy |
| R-03 | Cấu hình số người | `{ roomId, maxPlayers: 6..12 }` | `{ maxPlayers }` | Chỉ host mới được cấu hình |
| R-04 | Start game | `{ roomId }` | Gửi event `room.started` | Chỉ host, chỉ khi đủ số người |
| R-05 | Cancel phòng | `{ roomId }` | Xóa phòng | Chỉ host, chỉ khi status = waiting |
| R-06 | Player tự out | `{ roomId, playerId }` | Xóa khỏi room_players | Nếu là host → chỉ định host mới |
| R-07 | Tự động assign host mới | `{ roomId, disconnectedHostId }` | Cập nhật host | Chọn player join sớm nhất còn online |
| R-08 | Lấy danh sách phòng | (không có) | `{ rooms[] }` | Dùng để debug, không public ra user |

**Persistent tables:** `rooms`, `room_players`

### 2.2 Gameplay Service (Java Spring Boot)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|--------|
| G-01 | Chia bài | `{ roomId, playerIds[], maxPlayers }` | Mỗi player nhận role private | Theo bảng phân bổ role (GDD mục 2) |
| G-02 | Điều phối night phase đúng thứ tự | `{ roomId }` | Gửi `game.phase.changed` | Thứ tự: Guard → Seer → Werewolf → Witch |
| G-03 | Xử lý hành động Guard | `{ roomId, guardId, targetId }` | Lưu vào `nightActions` | Không được chọn người đã bảo vệ đêm trước |
| G-04 | Xử lý hành động Seer | `{ roomId, seerId, targetId }` | Trả kết quả role private | Không gửi broadcast |
| G-05 | Xử lý hành động Werewolf | `{ roomId, targetId }` | Lưu kill target | Chỉ được gửi nếu có từ 2 sói trở lên |
| G-06 | Xử lý hành động Witch | `{ roomId, useSave, usePoison, poisonTarget }` | Cập nhật kết quả đêm | Không được dùng lại bình đã dùng |
| G-07 | Tổng hợp kết quả đêm | `{ roomId }` | `{ deadIds[], reason[] }` | Xung đột Guard vs Sói, Witch ưu tiên |
| G-08 | Bắt đầu day phase | `{ roomId, deadIds }` | Gửi `game.phase.changed` + `game.chat.channel.updated` | Bật channel "all" |
| G-09 | Xử lý vote result | `{ roomId, voteResult }` (từ vote-service) | Xác định người bị loại | Nếu tie → không ai loại |
| G-10 | Trigger Hunter | `{ roomId, hunterId, triggerReason }` | Hunter chọn 1 người chết theo | Trigger ngay khi hunter bị giết |
| G-11 | Kiểm tra win condition | `{ roomId }` | `{ winner: "werewolf" | "villager" }` | Sau mỗi lần có người chết |
| G-12 | Xử lý reconnect | `{ roomId, playerId }` | Khôi phục state cho player | Trong 60s, giữ nguyên role |
| G-13 | Timeout handling | `{ roomId, phase, actorId }` | Bỏ qua hành động, chuyển phase tiếp theo | Timeout theo config từ room |

**Redis keys:**
- `game:{roomId}` → toàn bộ game state
- `room_members:{roomId}` → SET playerIds
- `session:{socketId}` → `{ playerId, roomId }`

### 2.3 Chat Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|--------|
| C-01 | Mở/đóng channel | `{ roomId, channel, enabled }` (từ Kafka) | Cập nhật trạng thái channel | Channel: `all`, `wolves` |
| C-02 | Nhận tin nhắn từ client | `{ roomId, channel, senderId, content }` | Lưu vào messages + broadcast | Chỉ cho phép nếu channel enabled |
| C-03 | Broadcast tin nhắn | `{ roomId, channel, message }` | Gửi qua gateway tới đúng player set | wolves → chỉ gửi sói còn sống |
| C-04 | Lưu tin nhắn lịch sử | `{ roomId, round, phase, channel, ... }` | INSERT vào messages | Dùng để debug, không dùng trong game |
| C-05 | Không cho người chết chat | `{ roomId, senderId }` | Từ chối gửi | Kiểm tra state từ Redis (gameplay) |

**Persistent table:** `messages`

### 2.4 Vote Service (NestJS)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|--------|
| V-01 | Bắt đầu vote | `{ roomId, round, playerIds[], duration }` | Tạo Redis hash `votes:{roomId}:{round}` | Xóa hash cũ nếu có |
| V-02 | Nhận vote | `{ roomId, round, voterId, targetId }` | HSET `votes:{...}` | Atomic, không race condition |
| V-03 | Kiểm tra hợp lệ | `{ roomId, voterId, targetId }` | `{ valid: bool, reason }` | Không vote cho mình, cho người chết, vote 1 lần/round |
| V-04 | Tổng hợp kết quả | `{ roomId, round }` | `{ result: Map<playerId, count>, ties: boolean }` | Không dùng random tiebreak |
| V-05 | Gửi kết quả | `{ roomId, round }` | Gửi event `vote.result` | Sau khi hết thời gian vote |

**Redis keys:** `votes:{roomId}:{round}` → HASH

### 2.5 Gateway Service (NestJS + WebSocket)

| ID | Yêu cầu | Input | Output | Ghi chú |
|----|---------|-------|--------|--------|
| WS-01 | Nhận kết nối WebSocket | `{ displayName }` | `{ socketId, playerId }` | Tạo session trong Redis |
| WS-02 | Map socketId → playerId, roomId | `socket.id` | Đọc từ Redis | Dùng để broadcast |
| WS-03 | Forward event từ Kafka đến client | `{ event, roomId, data }` | Gửi WebSocket message | Chỉ gửi tới socket trong room đó |
| WS-04 | Gửi private role cho player | `{ playerId, role }` | Gửi WebSocket private | Không broadcast |
| WS-05 | Xử lý disconnect | `socket.id` | Xóa session, gửi event disconnect | Room service xử lý reconnect logic |
| WS-06 | Xử lý reconnect | `socket.id, displayName` | Tìm session cũ, gắn lại socket mới | Trong 60s |

**Redis keys:** `session:{socketId}`

---

## 3. Non-Functional Requirements

| ID | Yêu cầu | Tiêu chí | Phương pháp kiểm tra |
|----|---------|----------|----------------------|
| N-01 | WebSocket latency | < 200ms p95 | Load test với k6 + đo round-trip |
| N-02 | Game state consistency | Không có race condition trong vote | Chaos testing + concurrent vote |
| N-03 | Fault tolerance | 1 service chết → không sập toàn hệ thống | Kill service, kiểm tra retry/Kafka replay |
| N-04 | Scalability | Mỗi service scale ngang | Deploy 2 instance gameplay, kiểm tra phân tải |
| N-05 | Data integrity | Role không leak ra client khác | Security scan + code review |
| N-06 | Reconnect rate | > 95% thành công trong 60s | Integration test mô phỏng mất mạng |
| N-07 | Timeout accuracy | ±2s so với config | Unit test + integration test |
| N-08 | Memory leak | Không tăng không giới hạn qua 1000 game | Chạy endurance test 24h |

---

## 4. Data Requirements

### 4.1 PostgreSQL Schema

#### rooms
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| code | VARCHAR(6) UNIQUE NOT NULL | |
| host_id | VARCHAR(50) NOT NULL | |
| status | VARCHAR(20) DEFAULT 'waiting' | waiting, in_game, finished |
| max_players | INT NOT NULL | 6..12 |
| created_at | TIMESTAMPTZ | |
| ended_at | TIMESTAMPTZ | |

#### room_players
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| room_id | UUID FK REFERENCES rooms | |
| player_id | VARCHAR(50) NOT NULL | |
| display_name | VARCHAR(50) NOT NULL | |
| joined_at | TIMESTAMPTZ | |

#### messages
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| room_id | UUID FK REFERENCES rooms | |
| round | INT NOT NULL | |
| phase | VARCHAR(20) NOT NULL | night, day |
| channel | VARCHAR(20) NOT NULL | all, wolves |
| sender_id | VARCHAR(50) NOT NULL | |
| sender_name | VARCHAR(50) NOT NULL | denormalized |
| content | TEXT NOT NULL | |
| sent_at | TIMESTAMPTZ | |

### 4.2 Redis Keys

| Key pattern | Type | TTL | Description |
|-------------|------|-----|-------------|
| `game:{roomId}` | JSON | 3600s | Toàn bộ game state (phase, players, roles, actions) |
| `room_members:{roomId}` | SET | 3600s | playerIds trong phòng |
| `session:{socketId}` | JSON | 1800s | `{ playerId, roomId }` |
| `votes:{roomId}:{round}` | HASH | 600s | voterId → targetId |

---

## 5. Kafka Events Specification

| Topic | Producer | Consumer | Payload example |
|-------|----------|----------|----------------|
| `room.started` | room-service | gameplay-service | `{ roomId, maxPlayers, playerIds[], config: { nightDuration, discussDuration, voteDuration } }` |
| `game.phase.changed` | gameplay-service | gateway-service | `{ roomId, phase, round, deadlineTimestamp, metadata: { deadIds, reason } }` |
| `game.chat.channel.updated` | gameplay-service | chat-service | `{ roomId, channel, enabled, allowedPlayerIds[] }` |
| `game.vote.start` | gameplay-service | vote-service | `{ roomId, round, playerIds[], durationSec }` |
| `vote.result` | vote-service | gameplay-service | `{ roomId, round, result: Map<playerId, count>, ties: bool, eliminatedPlayerId }` |
| `game.ended` | gameplay-service | room-service | `{ roomId, winner, finalPlayers: { playerId, role, isAlive } }` |

---

## 6. API / WebSocket Events (Client-facing)

### Client → Gateway

| Event | Payload | Response |
|-------|---------|----------|
| `join_room` | `{ roomCode, displayName }` | `{ roomId, players[], isHost }` |
| `create_room` | `{ displayName, maxPlayers }` | `{ roomId, roomCode, isHost }` |
| `leave_room` | `{}` | `{ success }` |
| `start_game` | `{ roomId }` | (chỉ host) |
| `night_action` | `{ roomId, actionType, targetId }` | `{ success }` |
| `chat_message` | `{ roomId, channel, content }` | `{ success }` |
| `vote` | `{ roomId, round, targetId }` | `{ success }` |
| `reconnect` | `{ socketId, displayName }` | `{ roomId, gameState }` |

### Gateway → Client

| Event | Payload | Condition |
|-------|---------|-----------|
| `role_assigned` | `{ role }` | private, đầu game |
| `phase_changed` | `{ phase, round, deadline, metadata }` | broadcast |
| `chat_message` | `{ senderName, channel, content, sentAt }` | theo channel |
| `vote_result` | `{ round, result, eliminatedPlayer }` | broadcast |
| `night_result` | `{ deadIds, reasons[] }` | broadcast |
| `game_ended` | `{ winner, finalStats }` | broadcast |
| `player_disconnected` | `{ playerId, willReconnectUntil }` | broadcast |
| `player_reconnected` | `{ playerId }` | broadcast |

---

## 7. Edge Cases & Constraints

### 7.1 Edge Cases (đã xác định)

| ID | Tình huống | Xử lý |
|----|------------|-------|
| E-01 | Guard bảo vệ cùng người 2 đêm liên tiếp | Từ chối, UI disable |
| E-02 | Witch dùng bình cứu khi không ai bị sói giết | Không cho dùng, bỏ qua |
| E-03 | Hunter bị giết đêm và là target của Witch độc | Hunter vẫn trigger |
| E-04 | Sói chỉ còn 1 con | Sói tự chọn target, không chat nhóm |
| E-05 | Vote tie 2 lần liên tiếp | Không ai chết, tiếp tục vòng mới |
| E-06 | Reconnect khi game đã kết thúc | Vào lobby mới, không vào game cũ |
| E-07 | Player chết trước khi kịp vote | Bỏ qua vote, không tính |

### 7.2 Constraints (cứng)

- Không dùng HTTP sync giữa các service (trừ gateway ↔ client)
- Gameplay service không được đọc/ghi PostgreSQL trong lúc game đang chạy
- Role của player chỉ được lưu trong Redis, không bao giờ gửi qua Kafka broadcast
- Mỗi service chỉ đọc/ghi DB của mình (xem bảng ownership ở Architecture Doc)
- Thời gian reconnect cố định 60s, không thay đổi được theo phòng

---

## 8. Testing Requirements

### 8.1 Unit Test Coverage
- Mỗi service: ≥ 80% (business logic)
- Gameplay service: phải test riêng từng role action, thứ tự, edge case

### 8.2 Integration Test
- Kafka event flow: `room.started` → `game.phase.changed` → `vote.result` → `game.ended`
- Redis atomic vote: 50 concurrent vote → không mất vote, không double count
- Reconnect flow: disconnect 30s → reconnect → vẫn trong game đúng role

### 8.3 End-to-end Test
- Flow 1 phòng 8 người chơi hoàn chỉnh (đêm → sáng → vote → kết thúc)
- Flow 2 phòng chạy song song, không ảnh hưởng nhau

### 8.4 Performance Test
- 100 phòng đồng thời, mỗi phòng 12 người
- Thời gian xử lý vote: < 500ms từ khi bắt đầu đến khi có kết quả
- Kafka lag < 1s khi có 1000 event/s

---

## 9. Acceptance Criteria for MVP

| STT | Tiêu chí | Trạng thái yêu cầu |
|-----|----------|-------------------|
| 1 | Tạo phòng, join phòng, start game được với 6–12 người | Must |
| 2 | Cả 6 role đều hoạt động đúng theo GDD | Must |
| 3 | Chat wolves ban đêm, chat all ban ngày | Must |
| 4 | Vote hoạt động, không race condition | Must |
| 5 | Win condition được kiểm tra đúng thời điểm | Must |
| 6 | Reconnect trong 60s giữ được role | Must |
| 7 | Không có leak role qua network hay log | Must |
| 8 | Deploy được bằng docker-compose | Must |
| 9 | Frontend có thể connect WebSocket và hiển thị game | Must |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-29 | System Architect | Initial version từ GDD, PRD, Architecture Doc |