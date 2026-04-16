const WebSocket = require('ws');

const GATEWAY_WS_URL = process.env.GATEWAY_WS_URL || 'ws://localhost:3001';
const TOTAL_JOINERS = Number(process.env.TOTAL_JOINERS || 7);
const JOIN_DELAY_MS = Number(process.env.JOIN_DELAY_MS || 300);
const ROOM_UPDATE_TIMEOUT_MS = Number(process.env.ROOM_UPDATE_TIMEOUT_MS || 8000);

function randomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = 'guest_';
  for (let i = 0; i < 10; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function send(ws, event, data) {
  ws.send(JSON.stringify({ event, data }));
}

function waitForRoomUpdated(ws, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for ROOM_UPDATED'));
    }, timeoutMs);

    function onMessage(raw) {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (err) {
        return;
      }

      if (msg.event === 'ROOM_UPDATED' && msg.data && msg.data.roomCode) {
        cleanup();
        resolve(msg.data);
      }
    }

    function onError(err) {
      cleanup();
      reject(err);
    }

    function cleanup() {
      clearTimeout(timer);
      ws.off('message', onMessage);
      ws.off('error', onError);
    }

    ws.on('message', onMessage);
    ws.on('error', onError);
  });
}

async function connectClient(label) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(GATEWAY_WS_URL);

    ws.on('open', () => resolve(ws));
    ws.on('error', reject);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (err) {
        return;
      }

      if (msg.event === 'ERROR') {
        // eslint-disable-next-line no-console
        console.error(`[${label}] ERROR`, msg.data);
      } else if (msg.event) {
        // eslint-disable-next-line no-console
        console.log(`[${label}] ${msg.event}`, msg.data || '');
      }
    });
  });
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('[Sim] Connecting host...');
  const hostSocket = await connectClient('host');
  const hostId = randomId();
  const hostName = 'Host';

  send(hostSocket, 'CREATE_ROOM', { guestId: hostId, displayName: hostName });
  // eslint-disable-next-line no-console
  console.log('[Sim] CREATE_ROOM sent, waiting for ROOM_UPDATED...');

  const roomData = await waitForRoomUpdated(hostSocket, ROOM_UPDATE_TIMEOUT_MS);
  const roomCode = roomData.roomCode;
  const roomId = roomData.roomId;

  // eslint-disable-next-line no-console
  console.log(`[Sim] Room ready: code=${roomCode} roomId=${roomId}`);

  for (let i = 1; i <= TOTAL_JOINERS; i += 1) {
    const label = `guest_${i}`;
    const ws = await connectClient(label);
    const guestId = randomId();
    const displayName = `Guest${i}`;

    send(ws, 'JOIN_ROOM', {
      guestId,
      displayName,
      roomCode,
    });

    // eslint-disable-next-line no-console
    console.log(`[Sim] ${label} sent JOIN_ROOM`);
    await wait(JOIN_DELAY_MS);
  }

  // eslint-disable-next-line no-console
  console.log('[Sim] Done. Keep process alive to observe events.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[Sim] Failed:', err.message || err);
  process.exit(1);
});
