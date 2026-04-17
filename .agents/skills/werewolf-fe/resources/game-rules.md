# Game Rules Reference — Werewolf Online (FE perspective)

This file is the authoritative source for game rules that the frontend must enforce or display.
Read this when implementing night action UI, vote UI, or any rule-based validation.

---

## Card Distribution (for displaying role counts in lobby)

| Total Players | Werewolves | Villagers | Power Roles |
|---|---|---|---|
| 6 | 2 | 3 | 1 Seer |
| 7 | 2 | 4 | 1 Seer |
| 8 | 2 | 4 | 1 Seer, 1 Guard |
| 9 | 3 | 4 | 1 Seer, 1 Guard |
| 10 | 3 | 4 | 1 Seer, 1 Guard, 1 Witch |
| 11 | 3 | 5 | 1 Seer, 1 Guard, 1 Witch |
| 12 | 3 | 5 | 1 Seer, 1 Guard, 1 Witch, 1 Hunter |

---

## Night Phase — Action Order & Timing

Actions happen in this order server-side. The FE receives `phase_changed` and then
listens for private events relevant to the player's role:

1. **Guard** (default 30s) — `night_action` with `actionType: "guard"`
2. **Seer** (default 30s) — `night_action` with `actionType: "seer"` → receives `seer_result`
3. **Hunter** — passive, no night action window (triggers only on death)
4. **Werewolf** (default 45s) — wolf chat open + `night_action` with `actionType: "werewolf_kill"`
5. **Witch** (default 30s) — receives `witch_info` (who wolves targeted) → `night_action` with `actionType: "witch"`

> Witch acts **last** because she needs to know who the wolves targeted before deciding whether to use the save potion.

If a player does not act within the timeout, the action is skipped (no penalty UI needed,
but optionally show a "time's up" notification).

---

## Role-Specific UI Rules

### Guard
- Show list of all **alive** players as targets
- **Disable** the player protected last night (stored in local state as `lastGuardTargetId`)
- Guard **may** protect themselves — but same rule applies (can't protect same person 2 nights in a row, including self)
- After submitting: show `night_action_ack`

### Seer
- Show list of all **alive** players except self
- After submitting: receive `seer_result { targetId, role }` privately
- Display result clearly but privately (e.g., modal or side panel only visible to Seer)
- Do NOT store seer results in shared state

### Werewolf
- Open wolf-only chat channel (`channel: "wolves"`)
- Show list of all **alive non-wolf** players as kill targets
- **Each wolf votes independently** — every alive wolf must submit a vote
- Phase only advances when **all alive wolves have voted** (or timeout expires)
- **Final kill target = most-voted target** (majority vote). Tie → resolved alphabetically by guestId (BE handles this, FE just shows result)
- UI implication: show each wolf's current vote if possible (optimistic), but don't finalize until `phase_changed` arrives

### Witch
- Receive `witch_info { werewolfKillTargetId }` — show who the wolves targeted
- **Save potion** (useSave): Disabled if `witchSaveUsed === true` OR if no one was wolf-killed
- **Poison potion** (usePoison): Disabled if `witchPoisonUsed === true`. Show player list to pick target.
- **If both potions already used**: Do NOT show any night action UI for Witch — she has no action this night.
- Witch may pass (do nothing) — show explicit "Pass" button
- Payload: `{ roomId, actionType: "witch", useSave?: bool, usePoison?: bool, poisonTargetId?: string }`

### Hunter
- **No night action window**
- Triggered when Hunter dies from **any cause**: wolves kill, vote elimination, OR Witch poison
- FE receives `hunter_trigger { hunterId }` privately
- Show target picker: all alive players except self
- Hunter must pick before the next phase continues (no timer shown in spec — ask BE for deadline)
- This trigger fires **immediately** when Hunter dies — the FE must show the modal without waiting for the next phase change

### Villager
- No night action — show a "Night is falling... wait for morning" screen

---

## Day Phase UI Flow

1. **Death announcement**: `phase_changed` with `metadata.deadIds[]` → show who died overnight
2. **Discussion**: `game.chat.channel.updated { channel: "all", enabled: true }` → open public chat
3. **Vote**: `vote_started { round, durationSec, candidates[] }` → show vote UI
4. **Vote result**: `vote_result { round, counts, eliminatedId, tied }`:
   - `tied === true` → "No one was eliminated (tie vote)"
   - `eliminatedId !== null` → show who was eliminated
5. If eliminated player was Hunter → `hunter_trigger` fires (private to Hunter)

---

## Vote UI Rules

- Each player gets exactly **1 vote**
- Cannot vote for **self**
- Cannot vote for **dead players**
- If timer runs out without voting → blank vote (no action needed from FE)
- `vote_result.tied === true` → `eliminatedId === null` — display tie message, no elimination
- Show live vote counts if desired (but BE only sends final result — need to handle optimistic UI or just show final)

---

## Win Conditions (for GameEnd screen)

| Winner | Condition |
|---|---|
| `"werewolf"` | Wolves alive ≥ villagers alive |
| `"villager"` | All wolves are dead |

On `game_ended`:
- Show winner team
- Reveal ALL roles: `roles: { [guestId]: role }` — now safe to display everyone's role
- Show round count

---

## Edge Cases the FE Must Handle

| Situation | FE behavior |
|---|---|
| Guard tries to protect same person as last night | Disable that option in UI (track `lastGuardTargetId`) |
| Witch's save potion already used | Disable save button (`witchSaveUsed: true`) |
| Witch tries to save when no one was wolf-killed | Save button disabled/hidden |
| Witch used both potions | Skip night action UI entirely — show "No potions remaining" |
| Hunter dies from wolves | Show `hunter_trigger` modal immediately |
| Hunter dies from vote elimination | Show `hunter_trigger` modal immediately |
| Hunter dies from Witch poison | Show `hunter_trigger` modal immediately (Witch poison also triggers Hunter) |
| Vote tie | Show "No elimination" message, game continues to next night |
| Player disconnects | `player_disconnected` event — show reconnect countdown in player list |
| Player reconnects | `player_reconnected` event — remove disconnect indicator |
| Reconnect within 60s | FE sends `reconnect` event, receives current game state |
| Dead player tries to chat | Block submit in UI (check `deadPlayers` list) |
| Game ends during night | `game_ended` arrives — skip to GameEnd screen immediately |

---

## Chat Channels

| Channel | When open | Who can send | Who can receive |
|---|---|---|---|
| `wolves` | Night phase only | Alive wolves | Alive wolves |
| `all` | Day phase only | All alive players | All alive players |

Dead players: **cannot send** to either channel. (Spectator mode is out of scope.)

The FE should only render the chat input if the player is alive and the channel is open.