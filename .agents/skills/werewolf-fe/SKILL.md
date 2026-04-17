---
name: werewolf-fe
description: >
  Full context skill for building the Frontend of the Werewolf Online multiplayer game.
  Use this skill whenever the user asks to build, modify, or debug any frontend feature
  for the Werewolf game — including lobby UI, game phases (night/day), role reveal,
  voting screen, chat, WebSocket integration, or any React component related to the game.
  Also trigger when the user asks about WebSocket event handling, game state management,
  or how the frontend should interact with the gateway-service. This skill embeds the
  full project context (RSD, GDD, Architecture, event contracts) so AI agent never needs
  to re-read those docs during FE work.
---

# Werewolf Online — Frontend Development Skill

You are helping build the **NextJS frontend** for Werewolf Online, a realtime multiplayer
social deduction game. The user is a frontend dev.
Be practical, opinionated, and solution-focused. When writing code, always produce
complete, working components — not skeletons or pseudocode.

---

## 1. Project Context (internalized — do NOT ask the user to re-explain)

### Stack
- **Frontend**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Realtime**: Native browser `WebSocket` (NOT socket.io) connecting to `gateway-service` at `ws://localhost:3001`
- **State management**: `zustand` for game state (lightweight, no boilerplate)
- **No auth** — guest-only. Each browser tab generates its own identity.

> ⚠️ **Critical**: Gateway uses the native `ws` package, NOT socket.io. Use `new WebSocket(url)` on the frontend. Messages are JSON with shape `{ event, data }`.

### Guest Identity (critical)
```javascript
// Generated ONCE per tab, stored in sessionStorage (NOT localStorage)
// Each tab = independent player — useful for multi-tab testing
const guestId = sessionStorage.getItem('guestId') 
  ?? (() => {
    const id = 'guest_' + nanoid(10); // exactly 10 alphanumeric chars
    sessionStorage.setItem('guestId', id);
    return id;
  })();
```
`guestId` format: `"guest_"` + 10 alphanumeric characters. Backend validates this strictly.

### Ports
| Service | URL |
|---|---|
| Frontend dev server | `http://localhost:3000` |
| Gateway (WebSocket) | `ws://localhost:3001` |
| Room Service (REST) | `http://localhost:3002` |

---

## 2. WebSocket Event Contract

### Connecting
```typescript
// lib/socket.ts
// Gateway dùng native WebSocket (ws package), KHÔNG phải socket.io
const WS_URL = process.env.NEXT_PUBLIC_GATEWAY_WS_URL ?? 'ws://localhost:3001';

const socket = new WebSocket(WS_URL);

// Gửi event
function emit(event: string, data: unknown) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
}

// Nhận event
socket.onmessage = (e) => {
  const { event, data } = JSON.parse(e.data);
  // dispatch theo event name
};
```

### Client → Gateway (events the FE sends)

| Event | Payload | Notes |
|---|---|---|
| `CREATE_ROOM` | `{ guestId, displayName }` | maxPlayers defaults to 8 on BE |
| `JOIN_ROOM` | `{ guestId, displayName, roomCode }` | roomCode: 6 chars |
| `CONFIGURE_ROOM` | `{ guestId, maxPlayers?, config? }` | Host only. roomId from session (BE-side) |
| `LEAVE_ROOM` | `{ roomId, guestId }` | |
| `START_GAME` | `{ guestId }` | Host only, must have enough players |
| `CANCEL_ROOM` | `{ guestId }` | Host only, status must be waiting |
| `night_action` | `{ roomId, actionType, targetId }` | actionType: `guard\|seer\|werewolf_kill\|witch` ⏳ |
| `chat_message` | `{ roomId, channel, content }` | content max 200 chars ⏳ |
| `vote` | `{ roomId, round, targetId }` | ⏳ |
| `reconnect` | `{ guestId, roomId }` | Within 60s of disconnect ⏳ |

> ✅ = implemented by BE. ⏳ = not yet implemented on BE side.

### Gateway → Client (events the FE receives)

| Event | Payload | Scope | Notes |
|---|---|---|---|
| `ROOM_UPDATED` | `{ roomId, roomCode, hostId, status, maxPlayers, config, players[] }` | Broadcast | Room state changed |
| `ROOM_CANCELLED` | `{ roomId }` | Broadcast | Host cancelled |
| `ERROR` | `{ code, message }` | **Private** | Validation error |
| `role_assigned` | `{ role }` | **Private** | Only this player sees their role ⏳ |
| `phase_changed` | `{ phase, round, deadlineTimestamp, metadata }` | Broadcast | metadata has deadIds ⏳ |
| `night_action_ack` | `{ actionType, success, reason? }` | **Private** | Confirm night action ⏳ |
| `seer_result` | `{ targetId, role }` | **Private** (Seer only) | ⏳ |
| `witch_info` | `{ soidKillTargetId }` | **Private** (Witch only) | ⏳ |
| `hunter_trigger` | `{ hunterId }` | **Private** (Hunter only) | ⏳ |
| `chat_message` | `{ senderName, channel, content, sentAt }` | Broadcast (by channel) | ⏳ |
| `vote_started` | `{ round, durationSec, candidates[] }` | Broadcast | ⏳ |
| `vote_result` | `{ round, counts, eliminatedId, tied }` | Broadcast | ⏳ |
| `game_ended` | `{ winner, roles: { [guestId]: role } }` | Broadcast | Reveals all roles ⏳ |
| `player_disconnected` | `{ guestId, reconnectDeadline }` | Broadcast | ⏳ |
| `player_reconnected` | `{ guestId }` | Broadcast | ⏳ |

> **Role privacy**: `role_assigned` is **private to one socket**. Never expose a player's role to others. Only reveal all roles in `game_ended`.

---

## 3. Game Phases & UI States

The frontend must handle these distinct UI states/screens:

```
Landing → Lobby → RoleReveal → Night → Day → Vote → GameEnd
```

### Phase mapping from `phase_changed.phase`
| Value | Meaning |
|---|---|
| `"night"` | Night phase begins — show role-specific action UI |
| `"day"` | Day phase — announce deaths, open public chat, then vote |

### Night actions per role
| Role | Action UI |
|---|---|
| `guard` | Pick 1 alive player to protect (disable last-protected target + self if protected self last night) |
| `seer` | Pick 1 alive player to reveal role |
| `werewolf` | Wolf chat enabled + pick kill target (group decision) |
| `witch` | See who wolves picked; optionally use save potion OR poison potion |
| `villager` | Waiting screen — no action |
| `hunter` | No night action — only triggers on death |

### Timers
`phase_changed.deadlineTimestamp` is Unix ms. Display countdown:
```javascript
const remaining = Math.max(0, deadlineTimestamp - Date.now());
```

---

## 4. Game Rules the UI Must Enforce

Read `references/game-rules.md` for the full rules. Key UI constraints:

- **Guard**: Cannot protect the same target 2 nights in a row (including self). Track `lastProtectedId` locally.
- **Witch**: `useSave` only valid if someone was wolf-killed that night. Each potion used once per game.
- **Vote**: Cannot vote for self, cannot vote for dead players, 1 vote per day phase.
- **Dead players**: Cannot chat, cannot vote. Grey them out visually.
- **Role reveal**: Only show your own role. Never render another player's role unless `game_ended`.

---

## 5. Recommended Component Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing — enter name, create/join room
│   ├── lobby/
│   │   └── page.tsx            # Waiting room, player list, host controls
│   ├── game/
│   │   └── page.tsx            # Main game — renders by phase
│   └── layout.tsx              # Root layout (ZustandProvider, etc.)
├── components/
│   ├── game/
│   │   ├── NightPanel.tsx      # Role-specific night action UI
│   │   ├── DayPanel.tsx        # Death announcement + discussion
│   │   ├── VotePanel.tsx       # Voting UI with countdown
│   │   ├── ChatBox.tsx         # Reusable chat (channel-aware)
│   │   ├── PlayerList.tsx      # Shows all players, alive/dead state
│   │   ├── RoleCard.tsx        # Private role reveal at game start
│   │   └── GameEndScreen.tsx   # Winner + full role reveal
│   └── ui/
│       ├── Countdown.tsx       # Deadline timer
│       └── ErrorToast.tsx      # For ERROR events from gateway
├── hooks/
│   ├── useSocket.ts        # Native WebSocket connection + event dispatcher
│   ├── useGameState.ts     # Zustand store for game state
│   └── useCountdown.ts     # Countdown timer from deadlineTimestamp
├── lib/
│   ├── socket.ts           # WebSocket singleton
│   └── guestId.ts          # guestId generation from sessionStorage
└── constants/
    └── roles.ts            # Role metadata (name, team, description, icon)
```

---

## 6. WebSocket Singleton Pattern

```typescript
// lib/socket.ts
// Gateway dùng native WebSocket — messages có format { event, data }

const WS_URL = process.env.NEXT_PUBLIC_GATEWAY_WS_URL ?? 'ws://localhost:3001';

type MessageHandler = (data: unknown) => void;

let ws: WebSocket | null = null;
const handlers = new Map<string, MessageHandler[]>();

export function getSocket(): WebSocket {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      handlers.get(event)?.forEach((fn) => fn(data));
    };
  }
  return ws;
}

export function emit(event: string, data: unknown) {
  const socket = getSocket();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  } else {
    // Queue until open
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ event, data }));
    }, { once: true });
  }
}

export function on(event: string, handler: MessageHandler) {
  if (!handlers.has(event)) handlers.set(event, []);
  handlers.get(event)!.push(handler);
}

export function off(event: string, handler: MessageHandler) {
  const list = handlers.get(event) ?? [];
  handlers.set(event, list.filter((fn) => fn !== handler));
}

export function disconnectSocket() {
  ws?.close();
  ws = null;
  handlers.clear();
}
```

---

## 7. Zustand Game State Store (recommended shape)

```javascript
// hooks/useGameState.js
import { create } from 'zustand';

export const useGameState = create((set, get) => ({
  // Room
  roomId: null,
  roomCode: null,
  hostId: null,
  roomStatus: 'idle', // FE-only states: 'idle' (chưa vào phòng nào)
                      // BE status:      'waiting' | 'in_game' | 'finished'
  players: [],        // [{ guestId, displayName }]
  maxPlayers: 8,
  config: {},

  // Game
  myRole: null,       // Only this player's role
  phase: null,        // 'night' | 'day'
  round: 0,
  deadlineTimestamp: null,
  alivePlayers: [],   // guestIds of alive players
  deadPlayers: [],    // guestIds of dead players

  // Night state
  nightMetadata: {},  // { deadIds, eliminatedId }
  witchSaveUsed: false,
  witchPoisonUsed: false,
  lastGuardTargetId: null,

  // Vote
  voteRound: null,
  voteCandidates: [],
  myVote: null,
  voteResult: null,

  // Chat
  messages: [],

  // Actions
  setRoomData: (data) => set({ ...data }),
  setRole: (role) => set({ myRole: role }),
  applyPhaseChange: ({ phase, round, deadlineTimestamp, metadata }) =>
    set((state) => ({
      phase, round, deadlineTimestamp,
      deadPlayers: [
        ...state.deadPlayers,
        ...(metadata?.deadIds ?? []),
        ...(metadata?.eliminatedId ? [metadata.eliminatedId] : []),
      ],
      alivePlayers: state.alivePlayers.filter(
        id => ![...(metadata?.deadIds ?? []), metadata?.eliminatedId].includes(id)
      ),
      nightMetadata: metadata ?? {},
    })),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  reset: () => set({ roomId: null, myRole: null, phase: null, messages: [] }),
}));
```

---

## 8. useSocket Hook Pattern

```typescript
// hooks/useSocket.ts
'use client'; // Next.js — chỉ chạy ở client
import { useEffect } from 'react';
import { on, off, getSocket } from '../lib/socket';
import { useGameState } from './useGameState';

export function useSocket(guestId: string) {
  const { setRoomData, setRole, applyPhaseChange, addMessage } = useGameState();

  useEffect(() => {
    // Khởi tạo kết nối khi component mount
    getSocket();

    const onRoomUpdated = (data: any) => setRoomData({
      roomId: data.roomId,
      roomCode: data.roomCode,
      hostId: data.hostId,
      roomStatus: data.status,
      players: data.players,
      maxPlayers: data.maxPlayers,
      config: data.config,
      alivePlayers: data.players.map((p: any) => p.guestId),
    });
    const onRoomCancelled = () => setRoomData({ roomStatus: 'idle', roomId: null });
    const onRoleAssigned = ({ role }: any) => setRole(role);
    const onPhaseChanged = (data: any) => applyPhaseChange(data);
    const onChatMessage = (msg: any) => addMessage(msg);
    const onError = ({ code, message }: any) => {
      console.error(`[WS ERROR ${code}]`, message);
      // surface via toast
    };

    on('ROOM_UPDATED', onRoomUpdated);
    on('ROOM_CANCELLED', onRoomCancelled);
    on('role_assigned', onRoleAssigned);
    on('phase_changed', onPhaseChanged);
    on('chat_message', onChatMessage);
    on('ERROR', onError);

    return () => {
      off('ROOM_UPDATED', onRoomUpdated);
      off('ROOM_CANCELLED', onRoomCancelled);
      off('role_assigned', onRoleAssigned);
      off('phase_changed', onPhaseChanged);
      off('chat_message', onChatMessage);
      off('ERROR', onError);
    };
  }, [guestId]);
}
```

---

## 9. Key Implementation Notes

### Multi-tab testing
Since `sessionStorage` isolates per tab, you can open 6–12 tabs to simulate a full game.
Each tab gets a unique `guestId`. This is intentional by design.

### Reconnect flow (⏳ — implement when BE is ready)
```javascript
// On socket reconnect event within 60s:
socket.emit('reconnect', { guestId, roomId });
// BE returns current game state → re-hydrate store
```

### Phase countdown
```javascript
// hooks/useCountdown.js
import { useState, useEffect } from 'react';

export function useCountdown(deadlineTimestamp) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadlineTimestamp) return;
    const tick = () => setRemaining(Math.max(0, deadlineTimestamp - Date.now()));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadlineTimestamp]);
  return remaining; // ms
}
```

### CONFIGURE_ROOM payload
Only send changed fields:
```javascript
socket.emit('CONFIGURE_ROOM', {
  guestId,
  maxPlayers: 10,           // optional
  config: { voteDuration: 45 } // optional, partial update
});
```

---

## 10. Role Reference

| Role | Team | Night Action | Key UI Note |
|---|---|---|---|
| `werewolf` | Sói | Choose kill target | Can see wolf chat channel |
| `villager` | Dân | None | Just waits |
| `seer` | Dân | Reveal one player's role | Show result privately |
| `guard` | Dân | Protect one player | Disable last-night's target |
| `hunter` | Dân | None at night | Trigger UI only on death |
| `witch` | Dân | Save / poison | Show wolf's kill target first |

---

## 11. When to Read Reference Files

- **Full game rules & edge cases** → `references/game-rules.md`
- **Kafka events** (if building a debug panel) → not needed for FE
- **Config ranges** (for CONFIGURE_ROOM form validation) → see Section 2.6 of RSD or inline below:

| Field | Min | Max | Default |
|---|---|---|---|
| maxPlayers | 6 | 12 | 8 |
| guardDuration | 20 | 60 | 30 |
| seerDuration | 20 | 60 | 30 |
| werewolfDuration | 30 | 60 | 45 |
| witchDuration | 20 | 60 | 30 |
| discussDuration | 30 | 180 | 60 |
| voteDuration | 20 | 60 | 30 |

---

## 12. Coding Standards for This Project

- Use **Next.js App Router** — all interactive components must have `'use client'` directive
- **TypeScript** throughout — no `.js` or `.jsx` files
- **Tailwind CSS** for all styling — no inline styles or CSS modules
- Gửi WS event bằng `emit(EVENT, payload)` từ `lib/socket.ts` — dùng UPPERCASE cho events đã implement, lowercase cho pending (theo BE convention)
- Always handle the `ERROR` WebSocket event and surface it to the user (toast hoặc banner)
- **Never log or display another player's role** — đây là security requirement cứng
- Dead players must be visually distinct (`opacity-50`, strikethrough tên) và bị disable khỏi các interactive elements (chat, vote)
- Use `deadlineTimestamp` từ BE — **không tự tính thời gian** dựa trên local timer
- Environment variables dùng prefix `NEXT_PUBLIC_` (ví dụ: `NEXT_PUBLIC_GATEWAY_WS_URL`)

---

## 13. UI/UX Design System

> **Priority: UI/UX phải đẹp, phải tốt.** Section này là bắt buộc — không được bỏ qua khi viết bất kỳ component nào.

### Visual Identity — Dark Fantasy Theme

Werewolf là game về đêm tối, bí ẩn, phán xét, và sự phản bội. UI phải phản ánh đúng cảm xúc đó.

**Không được làm:**
- UI trắng/sáng generic kiểu dashboard SaaS
- Button màu xanh lá mặc định của Tailwind
- Card phẳng, không có depth
- Font mặc định của browser

**Phải làm:**
- Dark mode là mặc định và duy nhất
- Dùng màu sắc có chủ đích theo phase (đêm vs ngày)
- Micro-animations cho mọi state transition
- Typography premium, có personality

---

### Color Palette

```css
/* Dùng CSS variables trong globals.css — map sang Tailwind config */
:root {
  /* Backgrounds */
  --bg-base: #0d0d14;          /* Nền tối nhất — màn hình chính */
  --bg-surface: #13131f;       /* Card, panel */
  --bg-elevated: #1a1a2e;      /* Dropdown, modal */
  --bg-overlay: #0d0d14cc;     /* Backdrop overlay */

  /* Accent — đỏ máu cho team Sói */
  --wolf-red: #c0392b;
  --wolf-red-glow: #e74c3c;

  /* Accent — vàng ánh trăng cho team Dân */
  --village-gold: #f39c12;
  --village-gold-glow: #f1c40f;

  /* Night phase tint */
  --night-blue: #1a1a3e;
  --night-purple: #2d1b69;

  /* Day phase tint */
  --day-amber: #2d1f00;

  /* Text */
  --text-primary: #e8e8f0;
  --text-secondary: #8888aa;
  --text-muted: #44445a;

  /* Status */
  --alive-green: #27ae60;
  --dead-gray: #555566;
  --danger-red: #e74c3c;
  --warning-amber: #f39c12;
}
```

---

### Typography

```typescript
// tailwind.config.ts
fontFamily: {
  display: ['Cinzel', 'serif'],      // Tiêu đề lớn — dark fantasy feel
  body: ['Inter', 'sans-serif'],     // Body text — readable
  mono: ['JetBrains Mono', 'monospace'], // Code, ID, roomCode
}
```

Import từ Google Fonts trong `layout.tsx`:
```html
<!-- Cinzel cho title, Inter cho body -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

**Quy tắc:**
- Tên game, màn hình chính, tên phase → `font-display` (Cinzel)
- Body text, mô tả, chat → `font-body` (Inter)
- `roomCode`, `guestId` → `font-mono`

---

### UI Patterns per Screen

#### Landing Page
- Full-screen dark background với subtle particle hoặc fog effect
- Logo/title game dùng `font-display`, có glow animation màu đỏ nhạt
- 2 CTA rõ ràng: "Tạo phòng" và "Tham gia phòng"
- Input tên hiển thị để user thấy mình sẽ chơi với tên gì

#### Lobby Page
- Hiện `roomCode` cực to, dễ share (font-mono, border dashed)
- Player list dạng card, có slot trống ghost để biết còn thiếu bao nhiêu người
- Host badge khác với player thường
- Số lượng `[X / maxPlayers]` với progress bar
- Host controls (Configure, Start) chỉ hiện khi là Host
- Phase badge "Chờ đủ người" nhấp nháy nhẹ

#### Night Phase
- Background shift sang `--night-blue` / `--night-purple`
- Overlay tối hơn, cảm giác bí ẩn nguy hiểm
- Countdown timer là element nổi bật nhất trên màn hình — số to, màu đỏ khi < 10s
- Role-specific panel ở trung tâm
- Player không có action → overlay "Đêm đang xuống..." với animation sao/sương mù

#### Day Phase
- Background shift sang `--day-amber` (ấm hơn nhưng vẫn tối)
- Death announcement: animation đặc biệt, dramatic — không chỉ là text thông báo
- Chat box mở ra với animation slide-in
- Dead players: ảnh xám, gạch ngang tên, icon ☠️

#### Vote Phase
- Countdown timer cực kỳ nổi bật
- Mỗi ứng cử viên là 1 card có thể click — highlight khi hover, selected state rõ ràng
- Vote count hiện theo real-time nếu BE hỗ trợ (hoặc sau khi `vote_result`)
- Nút "Bỏ phiếu" phải confirm — tránh misclick

#### Role Card (nhận role)
- Animation reveal như lật bài
- Màu nền khác nhau theo team: đỏ tối cho Sói, xanh/vàng cho Dân
- Giải thích ngắn gọn về role và nhiệm vụ
- CTA "OK, tôi hiểu rồi" để dismiss

---

### Micro-animations (bắt buộc)

Dùng Tailwind `transition` + `animate-` hoặc CSS keyframes:

| Element | Animation |
|---|---|
| Player join/leave phòng | Slide in từ phải, fade out khi leave |
| Phase transition | Full screen fade qua màu tối rồi fade vào phase mới |
| Countdown < 10s | Text chuyển đỏ + `animate-pulse` |
| Dead player | Fade to grayscale + slight scale down |
| Role reveal card | `rotateY(0deg)` từ `rotateY(90deg)` — flip animation |
| Nút bấm | `scale-95` khi active, `scale-100` default |
| Error toast | Slide in từ trên + auto dismiss sau 4s |
| Button loading | Spinner icon trong nút khi đang chờ socket response |

```css
/* Flip animation cho RoleCard */
@keyframes flip-in {
  from { transform: rotateY(90deg); opacity: 0; }
  to   { transform: rotateY(0deg);  opacity: 1; }
}
.role-reveal {
  animation: flip-in 0.4s ease-out forwards;
}
```

---

### Component Quality Checklist

Trước khi coi 1 component là done, phải pass hết:

- [ ] Dark background — không có màu trắng/sáng nào lộ ra
- [ ] Hover state rõ ràng trên mọi clickable element
- [ ] Loading state khi đang chờ socket/network
- [ ] Empty state đẹp (ví dụ: lobby chưa có ai ngoài mình)
- [ ] Error state hiển thị user-friendly (không throw raw error)
- [ ] Dead player bị grey out và disable đúng cách
- [ ] Countdown timer dễ đọc mọi lúc
- [ ] Mobile-friendly (min-width: 375px)
- [ ] Text không bị overflow hay truncate xấu
