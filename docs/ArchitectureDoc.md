**Werewolf Game - Architecture Note**

Stack: NestJS · Java Spring Boot · PostgreSQL · Redis · Kafka

# **1\. Roles**
Player: GUEST
Host: GUEST
Admin: (optional - bỏ qua hiện tại)
# **2\. Services Overview**
## **Gateway Service - NestJS (WebSocket)**
- Nhận kết nối WebSocket từ browser
- Map socketId → playerId, roomId (dùng Redis session)
- Forward events từ Kafka xuống đúng client
- Broadcast room/game events tới các player
## **Room Service - NestJS**
- Tạo, cancel, cấu hình room
- Start game (host)
- Join / out (player)
## **Gameplay Service - Java Spring Boot**
Chia bài, chạy flow:
- Ban đêm: enable chat cho sói (gọi chat service)
- Bảo vệ → Tiên tri → Thợ săn → Sói → Phù thuỷ
- Sáng: enable chat tổng (gọi chat service)
- Vote (gọi vote service)
- Check kill
- Check điều kiện end game
## **Chat Service - NestJS**
Được gameplay service gọi để mở/đóng channel chat theo phase.
## **Vote Service - NestJS**
Được gameplay service gọi để bắt đầu vote. Trả kết quả về gameplay service.
# **3\. Database Design**
## **Room Service - PostgreSQL**
\-- Phòng chơi
CREATE TABLE rooms (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
code VARCHAR(6) UNIQUE NOT NULL, -- mã join phòng, dạng "A3K9Z1"
host_id VARCHAR(50) NOT NULL,
status VARCHAR(20) DEFAULT 'waiting', -- waiting | in_game | finished
max_players INT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW(),
ended_at TIMESTAMPTZ -- thêm: debug + biết game kéo dài bao lâu
);

\-- Người chơi trong phòng
CREATE TABLE room_players (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
player_id VARCHAR(50) NOT NULL, -- guest ID từ frontend
display_name VARCHAR(50) NOT NULL,
joined_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(room_id, player_id)
);

## **Chat Service - PostgreSQL (cùng DB với Room Service)**
CREATE TABLE messages (
id BIGSERIAL PRIMARY KEY, -- BIGSERIAL: insert nhanh hơn UUID
room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
round INT NOT NULL,
phase VARCHAR(20) NOT NULL, -- night | day
channel VARCHAR(20) NOT NULL, -- all | wolves
sender_id VARCHAR(50) NOT NULL,
sender_name VARCHAR(50) NOT NULL, -- denormalize, khỏi join
content TEXT NOT NULL,
sent_at TIMESTAMPTZ DEFAULT NOW()
);

\-- Index: query theo phòng + channel (dùng khi load lại chat)
CREATE INDEX idx_messages_room_channel
ON messages(room_id, channel, sent_at DESC);

## **Gameplay Service - Redis**
Toàn bộ game state đang chạy đặt vào Redis. Không đụng Postgres trong lúc game chạy.
\# Game state - lưu toàn bộ dưới 1 key JSON
game:{roomId} → {
    phase: "night" | "discuss" | "vote",
    round: 2,
    players: {
        "guest_abc": {
            role: "werewolf", -- chỉ gameplay-service biết
            isAlive: true,
            protectedThisNight: false
        },
        "guest_xyz": { role: "seer", isAlive: true, ... }
    },
    nightActions: {
        seer: { targetId: "guest_abc" },
        guard: { targetId: "guest_xyz" },
        wolves: { targetId: "guest_qwe" }
    },
    phaseDeadline: 1712800000000 -- timestamp phase timeout
}
TTL: 3600s

\# Danh sách player trong room (gateway dùng để broadcast)
room_members:{roomId} → SET of playerIds
TTL: 3600s
\# Session mapping
session:{socketId} → { playerId, roomId }
TTL: 1800s

## **Vote Service - Redis**
votes:{roomId}:{round} → HASH
"guest_abc" → "guest_xyz" -- ai vote cho ai
"guest_def" → "guest_xyz"
TTL: 600s
\-- Dùng HSET + HGETALL để tổng hợp vote, atomic → không sợ race condition

# **4\. Kafka Topics**
room.started # room-service → gameplay-service: bắt đầu game
game.phase.changed # gameplay-service → gateway: broadcast phase mới
game.chat.channel.updated # gameplay-service → chat-service: mở/đóng channel
\# payload: { roomId, channel: "wolves"|"all", enabled: bool }
game.vote.start # gameplay-service → vote-service: bắt đầu vote
vote.result # vote-service → gameplay-service: kết quả vote
game.ended # gameplay-service → room-service: cập nhật room status

# **5\. Folder Structure**

werewolf/
├── frontend/
├── gateway-service/ # NestJS (WebSocket)
├── room-service/ # NestJS
├── vote-service/ # NestJS
├── chat-service/ # NestJS
├── gameplay-service/ # Java Spring Boot
├── docker-compose.yml
└── docs/

# **6\. DB Ownership**
Mỗi service chỉ đọc/ghi bảng của mình - dễ tách sau này nếu cần:

| Service          | PostgreSQL                |Redis                                        |
|------------------|----------------------------|--------------------------------------------|
| room-service     | rooms, room_players        | —                                          |
| chat-service     | messages                   | —                                          |
| gameplay-service | — (không dùng trong game)  | game:{id}, room_members:{id}, session:{id} |
| vote-service     | —                          | votes:{id}:{round}                         |
| gateway-service  | —                          | session:{socketId} (đọc)                   |