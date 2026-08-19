/**
 * Validates if a string is a valid UUID.
 */
export function isUuid(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Converts any ID (such as a Firebase UID) into a deterministic, valid UUID format
 * that PostgreSQL UUID columns accept without syntax errors.
 */
export function toValidUuid(str?: string | null): string {
  if (!str || typeof str !== "string") return "00000000-0000-0000-0000-000000000000";
  const trimmed = str.trim();
  if (isUuid(trimmed)) return trimmed.toLowerCase();

  // Deterministic 128-bit hash from the input string
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x61c88647, h4 = 0x9e3779b9;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }
  const hex = [
    (h1 >>> 0).toString(16).padStart(8, "0"),
    (h2 >>> 0).toString(16).padStart(8, "0"),
    (h3 >>> 0).toString(16).padStart(8, "0"),
    (h4 >>> 0).toString(16).padStart(8, "0"),
  ].join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
