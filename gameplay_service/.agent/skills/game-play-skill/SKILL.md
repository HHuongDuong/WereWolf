---
name: werewolf-gameplay
description: >
  Skill thiết kế và implement gameplay-service cho game Werewolf Online (Ma Sói)
  bằng Java Spring Boot. Kích hoạt skill này khi người dùng hỏi về: logic nghiệp vụ
  gameplay (chia bài, night phase, day phase, win condition), xử lý từng role
  (Guard, Seer, Witch, Hunter, Werewolf, Villager), thứ tự hành động đêm, timeout
  handling, Hunter trigger, night resolution, vote result processing, reconnect/disconnect,
  Kafka event flow (produce/consume), Redis state schema, WebSocket private events,
  edge case của từng role hay phase, unit test gameplay, hoặc bất kỳ yêu cầu code
  nào cho gameplay-service. Stack cứng: Java Spring Boot · Kafka · Redis.
  KHÔNG dùng PostgreSQL trong gameplay-service.
---

# Werewolf Online — Gameplay Service Skill

**Stack:** Java Spring Boot · Apache Kafka · Redis  
**Nguyên tắc cứng:**
- Gameplay-service **không đọc/ghi PostgreSQL** trong lúc game đang chạy
- Toàn bộ game state lưu trong **Redis** (TTL 3600s)
- Giao tiếp với service khác **chỉ qua Kafka** — không HTTP sync call
- **Role không bao giờ** xuất hiện trong Kafka payload, broadcast WebSocket, hay log

---

## References

Để biết chi tiết về từng phần của application, workflow, events và logic, **hãy sử dụng công cụ `view_file` để đọc nội dung các file sau trong thư mục `references/`** nếu bạn cần thông tin cho nghiệp vụ tương ứng:

- **[Roles & Card Distribution](references/roles-and-distribution.md)**: Chi tiết luật của Werewolf, Seer, Guard, Hunter, Witch, Villager và logic chia bài.
- **[Game Flow & Logic](references/game-flow.md)**: Trình tự phase Day/Night, cách tính toán kết quả đêm (Night Resolution) và check Win Condition.
- **[Events (Kafka & WebSocket)](references/events.md)**: Schema topics trên Kafka, luồng produce/consume giữa các microservices và format payload WebSocket chuyển qua gateway.
- **[Redis State & Config](references/redis-state.md)**: Schema cache Redis chứa state của phòng, timer, config và workflow dọn dẹp state.
- **[Requirements, Rules & Edge Cases](references/requirements-rules-cases.md)**: Tính năng yêu cầu (Functional Requirements), Validations Rules chuẩn xác và các edge cases điển hình cần xử lý.
