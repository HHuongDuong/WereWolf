# Game Design Document — Werewolf Online

> **Version:** 1.0  
> **Stack:** NestJS · Java Spring Boot · PostgreSQL · Redis · Kafka  
> **Player type:** Guest only (không cần tài khoản)

---

## 1. Roles

### 1.1 Bảng vai trò

| Role | Team | Số lượng | Hành động đêm | Mô tả |
|------|------|----------|----------------|-------|
| Werewolf (Ma sói) | Sói | Theo bảng chia bài | Chọn 1 người để giết | Ban đêm biết danh tính đồng đội sói. Thắng khi số sói ≥ dân còn sống. |
| Villager (Dân làng) | Dân | Theo bảng chia bài | — | Không có kỹ năng đặc biệt. Dựa vào suy luận và vote để loại sói. |
| Seer (Tiên tri) | Dân | 1 | Xem role của 1 người | Biết được role thật của target. Không được tiết lộ kết quả công khai (tùy nhóm). |
| Guard (Bảo vệ) | Dân | 1 | Chọn 1 người để bảo vệ | Người được bảo vệ không chết đêm đó dù bị sói chọn. Không được bảo vệ cùng 1 người **2 đêm liên tiếp** (kể cả chính bản thân Guard). |
| Hunter (Thợ săn) | Dân | 1 | — | Khi bị giết (đêm hoặc bị vote hoặc bị bỏ độc), được chọn 1 người chết theo ngay lập tức. |
| Witch (Phù thủy) | Dân | 1 | Dùng bình cứu hoặc bình độc | Có 2 lượt dùng trong cả game: 1 lần cứu (hồi sinh target bị sói giết đêm đó), 1 lần giết (chọn 1 người chết ngay). Mỗi bình chỉ dùng 1 lần. |

### 1.2 Thứ tự hành động đêm

Thứ tự quan trọng vì ảnh hưởng đến kết quả. Gameplay service thực thi theo đúng thứ tự này:
note: Hunter - là role mà chỉ khi bị giết (sói cắn hoặc bị vote hoặc bị bỏ độc) thì mới được chọn người chết theo, chú ý trigger chức năng của thợ săn ngay khi thợ săn bị giết
```
1. Guard   — bảo vệ trước
2. Seer    — xem role
3. Hunter  — (passive, không hành động đêm, trừ khi bị giết thì trigger hành động)
4. Werewolf — chọn kill target
5. Witch   — xem kết quả sói chọn ai, quyết định cứu hay giết thêm
```

> Witch hành động sau cùng vì cần biết sói đã chọn ai để quyết định có dùng bình cứu không.

---

## 2. Card Distribution (Chia bài)

Hệ thống tự động chia bài dựa trên số người. Power Roles là các role đặc biệt ngoài sói và dân thường.

| Tổng người | Ma sói | Dân làng | Power Roles |
|------------|--------|----------|-------------|
| 6 | 2 | 3 | 1 Tiên tri |
| 7 | 2 | 4 | 1 Tiên tri |
| 8 | 2 | 4 | 1 Tiên tri, 1 Bảo vệ |
| 9 | 3 | 4 | 1 Tiên tri, 1 Bảo vệ |
| 10 | 3 | 4 | 1 Tiên tri, 1 Bảo vệ, 1 Phù thủy |
| 11 | 3 | 5 | 1 Tiên tri, 1 Bảo vệ, 1 Phù thủy |
| 12 | 3 | 5 | 1 Tiên tri, 1 Bảo vệ, 1 Phù thủy, 1 Thợ săn |

**Logic chia bài:**
- Shuffle danh sách player
- Gán role theo thứ tự: Sói trước → Power Roles → Dân thường lấp đầy
- Role chỉ gameplay-service biết, lưu trong Redis, không bao giờ broadcast ra client khác

---

## 3. Game Flow

### 3.1 Tổng quan vòng lặp

```
[Lobby] → [Chia bài] → [Đêm] → [Sáng] → [Vote] → kiểm tra thắng/thua
                          |_________________________________|         
                                   (lặp lại nếu chưa kết thúc)
```

### 3.2 Phase chi tiết

#### Lobby
- Host cấu hình số người (6–12)
- Player join bằng mã phòng 6 ký tự
- Host bấm Start khi đủ người
- Hệ thống chia bài, mỗi player nhận role của mình qua WebSocket (private)

#### Night Phase

| Bước | Actor | Thời gian chờ | Mô tả |
|------|-------|---------------|-------|
| 1 | Guard | 30s | Chọn 1 người bảo vệ (không được chọn người mình đã bảo vệ đêm trước, kể cả bản thân Guard) |
| 2 | Seer | 30s | Chọn 1 người để xem role, nhận kết quả private |
| 3 | Werewolf | 45s | Chat nội bộ với đồng đội sói, thống nhất chọn 1 target |
| 4 | Witch | 30s | Xem ai bị sói chọn, quyết định dùng bình cứu / bình độc / bỏ qua |

- Các role hành động **độc lập, không biết nhau đang làm gì**
- Nếu hết thời gian mà chưa hành động → **bỏ qua** (không có hành động đêm đó)
- Kết thúc đêm: gameplay-service tổng hợp kết quả, tính ai chết

#### Day Phase

1. **Công bố kết quả đêm**: ai chết
2. **Thảo luận (60s)**: tất cả player còn sống chat công khai
3. **Vote (30s)**: mỗi người chọn 1 người để loại
4. **Công bố kết quả vote**: người bị vote nhiều nhất bị loại
5. **Hunter trigger** (nếu người bị loại là Hunter): Hunter chọn 1 người chết theo

### 3.3 Sơ đồ phase (Kafka events)

```
room.started
    └─→ gameplay: chia bài, gửi role cho từng player
            └─→ game.phase.changed { phase: "night", round: 1 }
                    └─→ game.chat.channel.updated { channel: "wolves", enabled: true }
                    └─→ [Night actions timeout]
                    └─→ game.phase.changed { phase: "day" }
                            └─→ game.chat.channel.updated { channel: "all", enabled: true }
                            └─→ game.vote.start
                                    └─→ vote.result
                                            └─→ [check win condition]
                                                    └─→ game.ended | game.phase.changed { phase: "night" }
```

---

## 4. Win Conditions

| Điều kiện | Người thắng |
|-----------|-------------|
| Số sói còn sống ≥ số dân còn sống | **Sói thắng** |
| Tất cả sói đã chết | **Dân thắng** |

**Thời điểm kiểm tra:** sau mỗi lần có người chết (sau đêm, sau vote, sau Hunter kéo theo).

> Ví dụ: còn 2 sói và 2 dân → sói thắng ngay, không cần chơi tiếp.

---

## 5. Edge Cases

### 5.1 Disconnect

| Tình huống | Xử lý |
|------------|-------|
| Player disconnect trong lobby | Xóa khỏi phòng, host có thể kick hoặc chờ reconnect |
| Player disconnect trong game | Giữ nguyên role, coi như không hành động đêm đó. Reconnect trong vòng **60s** thì vào lại được. |
| Host disconnect trong game | Tự động assign host mới (player join sớm nhất còn online) |
| Quá 60s không reconnect | Coi như đã chết (out of game), không ảnh hưởng win condition cho đến lượt kiểm tra tiếp theo |

### 5.2 Tie Vote

| Tình huống | Xử lý |
|------------|-------|
| 2+ người cùng số vote cao nhất | **Không ai bị loại** đêm đó |
| Tie xảy ra liên tiếp 2 lần | Vẫn không ai bị loại, tiếp tục vòng tiếp theo |

> Không dùng random tiebreak vì không fair với người chơi.

### 5.3 Multiple Kills

| Tình huống | Xử lý |
|------------|-------|
| Sói chọn người đã được Guard bảo vệ | Không ai chết (bảo vệ thành công) |
| Witch cứu người bị sói giết + Witch độc người khác | 2 sự kiện độc lập: người bị sói giết sống, người bị độc chết |
| Witch cứu chính người bị sói giết, đồng thời sói giết người đó | Người đó sống |
| Hunter bị giết (đêm hoặc vote) | Trigger ngay: Hunter chọn 1 người chết theo trước khi kiểm tra win condition |
| Hunter bị Witch độc | Hunter vẫn trigger |

### 5.4 Các trường hợp role đặc biệt

| Tình huống | Xử lý |
|------------|-------|
| Guard bảo vệ bản thân | **Được phép.** Áp dụng luật không được bảo vệ cùng 1 người 2 đêm liên tiếp (kể cả bản thân Guard). Ví dụ: Guard tự bảo vệ đêm 1 → đêm 2 không được tự bảo vệ nữa. |
| Guard bảo vệ người đã chết | Không hợp lệ, UI chỉ hiện người còn sống |
| Seer xem role của sói | Trả về "Werewolf" |
| Witch dùng hết 2 bình | Còn tồn tại trong game nhưng không có hành động đêm |
| Tất cả Power Role chết hết | Game vẫn tiếp tục bình thường |

---

## 6. Rules

- Mỗi player chỉ được **1 vote** mỗi ngày
- Player đã chết **không được vote** và **không được chat** (trừ kênh spectator nếu có sau này)
- Không thể vote cho chính mình
- Không thể vote cho người đã chết
- Hết thời gian vote mà chưa chọn → **tự động bỏ phiếu trắng** (không tính vào ai)
- Hết thời gian hành động đêm mà chưa chọn → **bỏ qua**, không có hành động

---

## 7. Room Configuration

| Config | Giá trị | Mặc định |
|--------|---------|----------|
| Số người | 6 – 12 | 8 |
| Thời gian hành động đêm mỗi role | 30 – 60s | 30s |
| Thời gian thảo luận ban ngày | 60 – 180s | 60s |
| Thời gian vote | 30 – 60s | 30s |
| Thời gian reconnect | 60s | 60s (không đổi được) |

---

## 8. Out of Scope (hiện tại)

Những tính năng **không làm** ở version này:

- Auth / tài khoản người dùng
- Profile & Ranking
- Admin dashboard
- Spectator mode
- Custom role (thêm role ngoài danh sách)
- Voice chat
- Replay / xem lại game
