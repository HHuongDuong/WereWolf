# Roles and Card Distribution

## 1. Roles

| Role | Team | Số lượng | Night Action |
|------|------|----------|--------------|
| Werewolf | Sói | Theo bảng chia bài | Chọn 1 kill target |
| Villager | Dân | Theo bảng chia bài | — |
| Seer | Dân | 1 | Xem role 1 người (kết quả private) |
| Guard | Dân | 1 | Bảo vệ 1 người (không được lặp 2 đêm liên tiếp) |
| Hunter | Dân | 1 | Passive — trigger ngay khi bị giết |
| Witch | Dân | 1 | Dùng bình cứu và/hoặc bình độc (mỗi bình 1 lần cả game) |

### Luật đặc biệt từng role

**Guard**
- Được tự bảo vệ bản thân
- **Không được** bảo vệ cùng 1 người 2 đêm liên tiếp (kể cả chính Guard)
- Lưu `lastGuardedId` trong `game:{roomId}` để validate
- E-01/E-02: Guard tự bảo vệ đêm 1 → đêm 2 server từ chối, UI disable option đó

**Seer**
- Gửi kết quả private qua gateway (`seer_result` event)
- Không lưu kết quả vào game state chung — chỉ gửi 1 lần rồi thôi
- Khi Seer xem sói → trả về `"WEREWOLF"`

**Hunter**
- Không có action window đêm
- ⚠️ Trigger ngay khi Hunter bị giết, bất kể lý do (sói cắn / vote / Witch độc)
- E-07: Nếu Guard bảo vệ Hunter đêm đó → Hunter không chết → không trigger
- Kiểm tra win condition **sau** khi Hunter chọn xong target, không phải trước

**Witch**
- Hành động cuối cùng trong đêm (biết sói đã chọn ai)
- `savePotion` và `killPotion` — mỗi cái chỉ dùng 1 lần cả game
- Lưu `{ savePotion: boolean, killPotion: boolean }` vào `game:{roomId}.witchPotions`
- E-03: Từ chối `useSave` nếu không ai bị sói giết đêm đó (không phạm lượt)
- E-04: Hết 2 bình → không có action window, game vẫn tiếp tục bình thường
- Witch cứu và Witch độc là 2 sự kiện độc lập

**Werewolf**
- E-05: Chỉ còn 1 sói → vẫn chọn kill bình thường, không có kênh chat nhóm
- Kênh chat `wolves` chỉ mở ban đêm, chỉ sói còn sống thấy

---

## 2. Card Distribution

| Tổng người | Sói | Dân | Power Roles |
|------------|-----|-----|-------------|
| 6 | 2 | 3 | Seer |
| 7 | 2 | 4 | Seer |
| 8 | 2 | 4 | Seer, Guard |
| 9 | 3 | 4 | Seer, Guard |
| 10 | 3 | 4 | Seer, Guard, Witch |
| 11 | 3 | 5 | Seer, Guard, Witch |
| 12 | 3 | 5 | Seer, Guard, Witch, Hunter |

**Logic chia bài (G-02):**
```java
List<String> roles = buildRoleList(maxPlayers); // Sói → Power Roles → Villager
Collections.shuffle(roles);                      // Fisher-Yates
Map<String, String> roleMap = new HashMap<>();
for (int i = 0; i < playerIds.size(); i++) {
    roleMap.put(playerIds.get(i), roles.get(i));
}
// Lưu roleMap vào Redis trong game:{roomId}
// Gửi private role cho từng player qua gateway event
// KHÔNG bao giờ broadcast roleMap ra channel chung
```
