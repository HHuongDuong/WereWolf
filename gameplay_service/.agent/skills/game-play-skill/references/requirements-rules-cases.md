# Requirements, Rules and Edge Cases

## 10. Functional Requirements (Gameplay-service)

### Khởi tạo

| ID | Yêu cầu |
|----|---------|
| G-01 | Consume `room.started` → khởi tạo `game:{roomId}` trong Redis |
| G-02 | Chia bài theo bảng Card Distribution, gửi `role_assigned` private |

### Night Phase

| ID | Yêu cầu |
|----|---------|
| G-03 | Điều phối thứ tự action window: Guard → Seer → Werewolf → Witch |
| G-04 | Guard action: validate lastGuardedId, lưu guardTarget |
| G-05 | Seer action: gửi `seer_result` private, KHÔNG lưu vào state chung |
| G-06 | Werewolf action: lưu wolfTarget (1 sói vẫn kill bình thường) |
| G-07 | Witch action: validate potion, gửi `witch_info` trước, xử lý save/poison |
| G-08 | Tổng hợp kết quả đêm theo thứ tự ưu tiên Guard → Witch save → Witch poison |

### Day Phase

| ID | Yêu cầu |
|----|---------|
| G-09 | Broadcast kết quả đêm (deadIds). Cập nhật isAlive trước khi broadcast |
| G-10 | Mở thảo luận: publish `game.chat.channel.updated { all, enabled:true }` |
| G-11 | Bắt đầu vote: publish `game.vote.start` sau hết discuss time |
| G-12 | Consume `vote.result`: xử lý eliminated, trigger Hunter nếu cần |
| G-13 | Hunter trigger: gửi `hunter_trigger` private, chờ chọn, checkWin sau |

### Flow chung

| ID | Yêu cầu |
|----|---------|
| G-14 | `checkWinCondition` sau mỗi lần có người chết |
| G-15 | Khi game kết thúc: publish `game.ended`, DEL Redis keys |
| G-16 | Timeout handling: timer riêng mỗi role, timeout → skip action |
| G-17 | Reconnect trong 60s: gửi lại full game state private cho player đó |
| G-18 | Quá 60s không reconnect: coi như chết, checkWinCondition |

---

## 11. Validation Rules

Gameplay-service validate trước khi xử lý bất kỳ action nào:

```
✓ guestId format: "guest_" + 10 ký tự (backend chỉ validate, không tự sinh)
✓ guestId tồn tại trong room_members:{roomId}
✓ Player còn sống (isAlive = true)
✓ Đúng phase hiện tại (night action chỉ nhận trong night phase)
✓ Đúng role có quyền thực hiện actionType đó
✓ Đang trong action window của role đó (không gửi sớm hoặc trễ)
✓ Target còn sống
✓ Guard: target ≠ lastGuardedId (kể cả nếu target là Guard)
✓ Witch save: phải có wolfTarget trong đêm đó (E-03)
✓ Witch: potion tương ứng còn lượt dùng
```

---

## 12. Edge Cases

| ID | Tình huống | Xử lý |
|----|------------|-------|
| E-01 | Guard bảo vệ lặp cùng người 2 đêm | Từ chối, trả `error` event |
| E-02 | Guard tự bảo vệ | Được phép, nhưng áp dụng luật 2 đêm liên tiếp |
| E-03 | Witch save khi không ai bị sói giết | Từ chối `useSave`, không phạm lượt |
| E-04 | Witch hết 2 bình | Không có action window đêm, game tiếp tục |
| E-05 | Còn 1 sói | Vẫn kill bình thường, không có wolves group chat |
| E-06 | Hunter bị giết (đêm/vote/Witch độc) | Trigger `hunter_trigger` → chờ Hunter chọn → checkWin |
| E-07 | Guard bảo vệ Hunter, sói chọn Hunter | Hunter sống → không trigger |
| E-08 | Vote tie | `eliminatedId=null`, `tied=true`, chuyển đêm mới |
| E-09 | Tie nhiều lần liên tiếp | Không giới hạn, cứ tie là bỏ qua |
| E-10 | Reconnect sau game đã kết thúc | Trả `game_ended` state, không cho vào lại |
| E-11 | Player chết trước khi kịp vote | Vote bị bỏ qua nếu gửi sau khi `isAlive=false` |
| E-12 | Tất cả sói chết trong đêm | checkWin → kết thúc ngay, không chạy Day Phase |
| E-13 | Wolf chọn người Guard bảo vệ | Không ai chết. Log `reasons[]` nội bộ, không gửi client |
| E-14 | Host disconnect trong game | Game tiếp tục bình thường (gameplay-service không phụ thuộc host) |
| E-15 | Tất cả player cùng team disconnect > 60s | Gameplay-service kết thúc game, `winner=null` |
