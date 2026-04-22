const GUEST_ID_KEY = "werewolf:guestId";

function generateSuffix(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

export function getOrCreateGuestId() {
  if (typeof window === "undefined") {
    return "guest_server0000";
  }

  const stored = window.sessionStorage.getItem(GUEST_ID_KEY);
  if (stored && /^guest_[a-zA-Z0-9]{10}$/.test(stored)) {
    return stored;
  }

  const generated = `guest_${generateSuffix(10)}`;
  window.sessionStorage.setItem(GUEST_ID_KEY, generated);
  return generated;
}
