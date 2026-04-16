# Product Requirement Document — Werewolf Online

> **Version:** 1.0  
> **Status:** In Progress  
> **Team size:** 4  
> **Player type:** Guest only (không cần tài khoản)

---

## 1. Overview

| | |
|---|---|
| **Product name** | Werewolf Online |
| **Goal** | Game Ma Sói realtime multiplayer chạy trên web, không cần cài đặt, không cần tài khoản |
| **Target users** | Nhóm bạn bè muốn chơi nhanh — truy cập link, nhập tên, vào phòng là chơi được |
| **Platform** | Web (desktop + mobile browser) |
| **Player capacity** | 6–12 người / phòng |

---

## 2. Objectives

| Mục tiêu | Đo lường |
|----------|----------|
| Realtime gameplay mượt | Độ trễ WebSocket < 200ms |
| Vào chơi nhanh | Từ mở link → vào phòng < 30 giây, không cần đăng ký |
| Đủ role để chơi được | 6 role: Sói, Dân, Tiên tri, Bảo vệ, Thợ săn, Phù thủy |
| Phòng ổn định | Xử lý được disconnect/reconnect trong 60s |
| Dễ mở rộng | Kiến trúc microservices, thêm feature không ảnh hưởng service khác |

---

## 3. User Stories

### Guest (Player)

| ID | Story | Priority |
|----|-------|----------|
| P-01 | Tôi muốn nhập tên hiển thị và vào phòng bằng mã 6 ký tự, không cần tạo tài khoản | Must |
| P-02 | Tôi muốn biết role của mình ngay khi game bắt đầu (private, chỉ mình tôi thấy) | Must |
| P-03 | Tôi muốn thực hiện hành động đêm (chọn target) trong thời gian quy định | Must |
| P-04 | Tôi muốn chat với đồng đội sói ban đêm (nếu là sói) | Must |
| P-05 | Tôi muốn chat công khai ban ngày để thảo luận | Must |
| P-06 | Tôi muốn vote loại người mình nghi ngờ | Must |
| P-07 | Tôi muốn thấy kết quả rõ ràng: ai chết đêm đó, ai bị vote loại, ai thắng | Must |
| P-08 | Tôi muốn reconnect lại phòng nếu mạng bị ngắt trong vòng 60s | Should |

### Host (cũng là Guest)

| ID | Story | Priority |
|----|-------|----------|
| H-01 | Tôi muốn tạo phòng và nhận mã để chia sẻ cho bạn bè | Must |
| H-02 | Tôi muốn cấu hình số người (6–12) trước khi bắt đầu | Must |
| H-03 | Tôi muốn bấm Start khi đã đủ người | Must |
| H-04 | Tôi muốn cancel phòng nếu chưa đủ người | Must |

---

## 4. User Flow

```
[Mở web]
    │
    ├─→ Nhập tên hiển thị
    │
    ├─→ [Tạo phòng]                    ├─→ [Join phòng]
    │     Nhận mã 6 ký tự              │     Nhập mã 6 ký tự
    │     Chia sẻ cho bạn              │     Chờ host start
    │     Cấu hình số người            │
    │     Bấm Start                    │
    │                                  │
    └──────────────[Lobby]─────────────┘
                      │
              [Game bắt đầu]
              Nhận role (private)
                      │
              ┌───────▼────────┐
              │   Night Phase  │
              │ - Hành động    │
              │   theo role    │
              │ - Sói chat nội │
              │   bộ           │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │   Day Phase    │
              │ - Công bố kết  │
              │   quả đêm      │
              │ - Thảo luận    │
              │ - Vote         │
              └───────┬────────┘
                      │
              [Kiểm tra thắng/thua]
                      │
              ┌───────┴────────┐
              │                │
           Chưa xong        Kết thúc
           (Night tiếp)    Hiện kết quả
                           Giải tán phòng
```

---

## 5. Features

### 5.1 Must Have

#### Room System
- Tạo phòng, sinh mã 6 ký tự ngẫu nhiên (unique)
- Join phòng bằng mã
- Cấu hình số người tối đa (6–12)
- Host cancel phòng khi chưa start
- Player tự out khỏi phòng
- Hiển thị danh sách player trong lobby realtime
- Tự động assign host mới nếu host disconnect

#### Gameplay Engine
- Chia bài tự động theo bảng phân bổ role (xem GDD)
- Gửi role private cho từng player qua WebSocket
- Chạy Night Phase theo đúng thứ tự: Guard → Seer → Werewolf → Witch (Hunter là passive — chỉ trigger khi bị giết, không có action window riêng)
- Timeout tự động mỗi bước (30–45s), bỏ qua nếu không hành động
- Tổng hợp kết quả đêm, tính ai chết
- Chạy Day Phase: thông báo kết quả → thảo luận → vote
- Kiểm tra win condition sau mỗi lần có người chết
- Xử lý Hunter trigger khi bị loại
- Xử lý reconnect trong 60s

#### Chat System
- Kênh **wolves**: chỉ sói thấy, chỉ mở ban đêm
- Kênh **all**: tất cả player còn sống, chỉ mở ban ngày
- Gameplay service kiểm soát mở/đóng channel theo phase
- Người chết không được chat

#### Vote System
- Mỗi player 1 vote / ngày
- Không tự vote cho mình
- Không vote cho người đã chết
- Hết giờ chưa vote → bỏ phiếu trắng
- Vote bằng nhau → không ai bị loại
- Atomic (không race condition khi nhiều người vote cùng lúc)

### 5.2 Out of Scope (không làm ở version này)

- Auth / tài khoản người dùng
- Profile & ranking
- Match history
- Admin dashboard
- Spectator mode
- Voice chat
- Custom role
- Replay

---

## 6. Service Architecture

| Service | Tech | Nhiệm vụ |
|---------|------|----------|
| gateway-service | NestJS + WebSocket | Nhận kết nối từ browser, map session, broadcast event |
| room-service | NestJS | Tạo/join/cancel phòng, quản lý lobby |
| gameplay-service | Java Spring Boot | Chia bài, điều phối phase, tính kết quả |
| chat-service | NestJS | Nhận/lưu/gửi message theo channel và phase |
| vote-service | NestJS | Thu vote, tổng hợp kết quả, chống race condition |

**Giao tiếp:** Kafka event bus  
**Realtime:** WebSocket (gateway → browser)  
**Game state:** Redis (ephemeral, TTL 1h)  
**Persistent data:** PostgreSQL (rooms, players, messages)

---

## 7. Kafka Events (xem ở RSD.md, DEV_GUIDE.md)

---

## 8. Non-functional Requirements

| Yêu cầu | Chi tiết |
|---------|----------|
| **Latency** | WebSocket event < 200ms trong điều kiện mạng bình thường |
| **Concurrency** | Nhiều phòng chạy song song độc lập, không ảnh hưởng nhau |
| **Fault tolerance** | Một service chết không kéo sập toàn hệ thống |
| **Scalability** | Mỗi service scale độc lập |
| **Data consistency** | Vote dùng Redis atomic (HSET), không race condition |
| **Security** | Role của player không bao giờ broadcast ra ngoài — chỉ gửi private qua WebSocket đúng socket |
| **Reconnect** | Player disconnect < 60s có thể vào lại, giữ nguyên role và trạng thái |

---

## 9. Tech Stack & Constraints

| | |
|---|---|
| **Backend services** | NestJS (gateway, room, chat, vote) · Java Spring Boot (gameplay) |
| **Message broker** | Apache Kafka |
| **Realtime state** | Redis |
| **Persistent storage** | PostgreSQL |
| **Containerization** | Docker + Docker Compose |
| **Frontend** | React (hoặc Vue) — TBD |

**Ràng buộc cứng:**
- Gameplay service phải viết bằng Java Spring Boot
- Toàn bộ game state đang chạy lưu trong Redis, không truy vấn PostgreSQL trong lúc game
- Các service giao tiếp qua Kafka, hạn chế gọi HTTP trực tiếp lẫn nhau (trừ gateway)

---
