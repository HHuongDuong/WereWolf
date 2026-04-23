# Chat Service

Real-time chat service cho Werewolf game với hỗ trợ nhiều kênh chat và kiểm soát quyền truy cập.

## Tính năng

- **Multi-channel chat**: Hỗ trợ kênh `all` (tất cả người chơi) và `wolves` (chỉ sói)
- **Access control**: Kiểm soát ai được phép chat trong từng kênh
- **Message persistence**: Lưu trữ tin nhắn vào PostgreSQL
- **Real-time broadcast**: Gửi tin nhắn real-time qua Gateway WebSocket
- **Kafka integration**: Nhận cập nhật trạng thái kênh từ gameplay service

## Tech Stack

- **NestJS** - Framework backend
- **TypeORM** - ORM cho PostgreSQL
- **Redis** - Cache trạng thái kênh
- **Kafka** - Message queue
- **PostgreSQL** - Database

## API Endpoints

### POST /chat/send

Gửi tin nhắn chat.

**Request Body:**
```json
{
  "roomId": "uuid",
  "channel": "all" | "wolves",
  "senderId": "guest_xxx",
  "senderName": "Player Name",
  "content": "Message content",
  "round": 1,
  "phase": "night"
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "code": "INVALID_CONTENT_LENGTH" | "CHANNEL_DISABLED" | "SENDER_NOT_ALLOWED",
  "message": "Error message"
}
```

## Kafka Events

### Consumed Topics

**game.chat.channel.updated**
```json
{
  "roomId": "uuid",
  "channel": "all" | "wolves",
  "enabled": true,
  "allowedGuestIds": ["guest_xxx"],
  "round": 1
}
```

## Environment Variables

```env
PORT=3003
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKER=localhost:9094
POSTGRES_HOST=localhost
POSTGRES_PORT=5436
POSTGRES_USER=werewolf
POSTGRES_PASSWORD=werewolf123
POSTGRES_DB=werewolf
GATEWAY_URL=http://localhost:3001
INTERNAL_API_TOKEN=gIrGoNuIpF1Y
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run production
npm start
```

## Docker

```bash
# Build image
docker build -t chat-service .

# Run container
docker run -p 3003:3003 --env-file .env chat-service
```

## Database Schema

### messages table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| roomId | uuid | Room identifier |
| round | int | Game round |
| phase | varchar(20) | Game phase |
| channel | varchar(20) | Chat channel |
| senderId | varchar(50) | Sender guest ID |
| senderName | varchar(50) | Sender display name |
| content | text | Message content |
| sentAt | timestamptz | Timestamp |

**Index:** (roomId, channel, sentAt)

## Redis Keys

**Format:** `chat_channel:{roomId}:{channel}`

**Value:**
```json
{
  "enabled": true,
  "allowedGuestIds": ["guest_xxx"]
}
```

**TTL:** 1 hour

## Integration với Frontend

Frontend đã được tích hợp với chat service:

1. **Chat Store** (`frontend/src/entities/chat/model/chatStore.ts`) - Quản lý state
2. **Chat API** (`frontend/src/shared/api/chatApi.ts`) - Gọi REST API
3. **WebSocket Bridge** - Nhận tin nhắn real-time từ Gateway
4. **ChatBox Component** - UI hiển thị và gửi tin nhắn

### Flow hoạt động

1. User gửi tin nhắn từ ChatBox
2. Frontend gọi POST `/chat/send` đến chat_service
3. Chat_service validate và lưu vào PostgreSQL
4. Chat_service gọi Gateway để broadcast qua WebSocket
5. Gateway gửi event `chat_message` đến tất cả clients trong room
6. Frontend nhận event và cập nhật UI

## Validation Rules

- Content length: 1-200 ký tự
- Channel phải được enable
- Sender phải nằm trong allowedGuestIds (nếu có)
