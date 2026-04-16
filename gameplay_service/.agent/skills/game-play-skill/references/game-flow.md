# Game Flow and Logic

## 3. Game Flow

### Vòng lặp tổng quan

```
[room.started] → [Deal Cards] → [Night Phase] → [Night Resolution]
                                                        ↓
                                              [Day Phase + Vote]
                                                        ↓
                                              [checkWinCondition]
                                              ↙               ↘
                                      game.ended       Night Phase mới
```

### Night Phase — Thứ tự action window (BẮT BUỘC)

```
1. Guard    → guardDuration    (default 30s)
2. Seer     → seerDuration     (default 30s)
3. Werewolf → werewolfDuration (default 45s)  ← có kênh chat wolves
4. Witch    → witchDuration    (default 30s)  ← nhận witch_info trước khi action
```

> Hunter KHÔNG có action window. Nếu Hunter bị Witch độc trong đêm → trigger Hunter ngay trong phase đêm, trước khi broadcast kết quả ngày.

Timeout tự động (G-16): Mỗi role có timer **riêng biệt**. Hết giờ → bỏ qua action, chuyển bước tiếp ngay.

### Day Phase — Thứ tự thực thi

```
1. resolveNight()       → tính deadIds[]
2. updateAlive()        → cập nhật isAlive trong Redis TRƯỚC khi broadcast
3. publish game.phase.changed { phase:"day", metadata:{ deadIds } }
4. publish game.chat.channel.updated { channel:"all", enabled:true }
5. [discussDuration]    → đợi hết thời gian thảo luận
6. publish game.vote.start { alivePlayerIds, durationSec }
7. consume vote.result  → xử lý eliminatedId
8. trigger Hunter nếu cần → chờ Hunter chọn xong
9. checkWinCondition()
```

---

## 4. Night Resolution Logic (G-08)

```java
NightResult resolveNight(String roomId) {
    NightActions actions = getFromRedis("game:" + roomId + ".nightActions");
    List<String> deaths = new ArrayList<>();

    String wolfTarget    = actions.getWolfTarget();
    String guardTarget   = actions.getGuardTarget();
    String witchSaved    = actions.getWitchSaved();
    String witchPoisoned = actions.getWitchPoisoned();

    // 1. Wolf kill — bị Guard block hoặc Witch cứu thì hủy
    if (wolfTarget != null
            && !wolfTarget.equals(guardTarget)
            && !wolfTarget.equals(witchSaved)) {
        deaths.add(wolfTarget);
    }

    // 2. Witch độc — độc lập với Guard, không bị chặn
    if (witchPoisoned != null) {
        deaths.add(witchPoisoned);
    }

    // 3. Hunter trigger — xử lý ngay trước khi trả về
    for (String deadId : new ArrayList<>(deaths)) {
        if ("HUNTER".equals(getRole(roomId, deadId))) {
            String hunterTarget = awaitHunterChoice(roomId, deadId);
            if (hunterTarget != null) deaths.add(hunterTarget);
        }
    }

    // 4. Cập nhật lastGuardedId cho đêm tiếp theo
    setLastGuarded(roomId, guardTarget);

    return new NightResult(deaths);
}
```

**Ưu tiên xử lý (theo thứ tự):**
1. Guard block → wolf kill vô hiệu lực
2. Witch save → override wolf kill
3. Witch poison → độc lập, không bị Guard chặn
4. Hunter trigger → xử lý ngay, thêm victim vào deaths[]

---

## 5. Win Condition (G-14)

```java
WinResult checkWinCondition(String roomId) {
    List<Player> alive = getAlivePlayers(roomId);
    long wolves    = alive.stream().filter(p -> "WEREWOLF".equals(p.role)).count();
    long villagers = alive.stream().filter(p -> !"WEREWOLF".equals(p.role)).count();

    if (wolves == 0)          return WinResult.VILLAGERS;
    if (wolves >= villagers)  return WinResult.WOLVES;
    return WinResult.NONE; // game tiếp tục
}
```

**Thời điểm gọi `checkWinCondition` — không được bỏ sót:**
- Sau `resolveNight()` — bao gồm sau Hunter trigger trong đêm
- Sau khi xử lý `vote.result` (eliminated player đã `isAlive=false`)
- Sau khi Hunter trigger từ vote xong
- E-12: Tất cả sói chết trong đêm → kết thúc ngay, không chạy Day Phase
