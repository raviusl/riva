/**
 * Deterministic platform event ids (shared — engines must not fork hash logic).
 */

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function platformEventIdFromSeed(seed: string): string {
  const parts: string[] = [];
  let cursor = seed;
  while (parts.join("").length < 32) {
    const h = fnv1a(cursor).toString(16).padStart(8, "0");
    parts.push(h);
    cursor = `${cursor}:${h}`;
  }
  const hex = parts.join("").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const s = hex.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}
