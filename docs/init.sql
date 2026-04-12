-- ═══════════════════════════════════════════════════════════════
--  Werewolf Online — PostgreSQL Init Schema
--  Auto-executed khi postgres container khởi động lần đầu
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
--  Room Service Tables
-- ─────────────────────────────────────────

-- Phòng chơi
CREATE TABLE IF NOT EXISTS rooms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(6)  UNIQUE NOT NULL,           -- mã join phòng, dạng "A3K9Z1"
    host_id     VARCHAR(50) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting | in_game | finished
    max_players INT         NOT NULL CHECK (max_players BETWEEN 6 AND 12),
    config      JSONB       NOT NULL DEFAULT '{"guardDuration":30,"seerDuration":30,"werewolfDuration":45,"witchDuration":30,"discussDuration":60,"voteDuration":30}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at    TIMESTAMPTZ                            -- null cho đến khi game kết thúc
);

-- Người chơi trong phòng
CREATE TABLE IF NOT EXISTS room_players (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      UUID        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    player_id    VARCHAR(50) NOT NULL,                 -- guest ID từ frontend (tự sinh)
    display_name VARCHAR(50) NOT NULL,
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, player_id)
);

-- Index cho room lookup
CREATE INDEX IF NOT EXISTS idx_rooms_code    ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status  ON rooms(status);

-- ─────────────────────────────────────────
--  Chat Service Tables
-- ─────────────────────────────────────────

-- Tin nhắn (cùng DB, khác schema ownership)
CREATE TABLE IF NOT EXISTS messages (
    id          BIGSERIAL   PRIMARY KEY,               -- BIGSERIAL: insert nhanh hơn UUID
    room_id     UUID        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    round       INT         NOT NULL,
    phase       VARCHAR(20) NOT NULL,                  -- night | day
    channel     VARCHAR(20) NOT NULL,                  -- all | wolves
    sender_id   VARCHAR(50) NOT NULL,
    sender_name VARCHAR(50) NOT NULL,                  -- denormalize, tránh JOIN
    content     TEXT        NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: query theo phòng + channel khi load lại chat
CREATE INDEX IF NOT EXISTS idx_messages_room_channel
    ON messages(room_id, channel, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_room_round
    ON messages(room_id, round, phase);
