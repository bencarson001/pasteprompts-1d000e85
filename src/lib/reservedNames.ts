/**
 * Reserved Username & Display Name Security Policy
 * 
 * Enforces strict reservation of "admin", "mod", "moderator" and all
 * permutations/leetspeak variations exclusively for verified platform administrators.
 */

export const ADMIN_EMAIL = "sectionsix.sounds@gmail.com";

export function isPlatformAdmin(email?: string | null, isAdmin?: boolean): boolean {
  if (isAdmin) return true;
  if (email && email.trim().toLowerCase() === ADMIN_EMAIL) return true;
  return false;
}

export interface ReservedCheckResult {
  isReserved: boolean;
  reason?: string;
}

/**
 * Checks if a username (handle) or display name contains prohibited administrative/moderator terms.
 * If the user is the verified platform administrator (ADMIN_EMAIL), they are exempted.
 */
export function checkReservedName(
  rawName: string,
  userEmail?: string | null,
  isAdmin?: boolean,
): ReservedCheckResult {
  // Allow platform administrator to use ADMIN and any variation
  if (isPlatformAdmin(userEmail, isAdmin)) {
    return { isReserved: false };
  }

  const clean = rawName.trim().toLowerCase();
  if (!clean) return { isReserved: false };

  // Convert common leetspeak substitutions
  const leetMap: Record<string, string> = {
    "0": "o",
    "1": "i",
    "!": "i",
    "|": "i",
    "3": "e",
    "4": "a",
    "@": "a",
    "5": "s",
    "$": "s",
    "7": "t",
    "8": "b",
  };

  let unleet = "";
  for (const char of clean) {
    unleet += leetMap[char] || char;
  }

  const alphanumeric = clean.replace(/[^a-z0-9]/g, "");
  const unleetAlphanumeric = unleet.replace(/[^a-z0-9]/g, "");

  // Only block when the reserved word stands alone as a token — not when it
  // merely appears inside a longer legitimate name ("Padmini", "admin.jones").
  const tokens = unleet.split(/[^a-z0-9]+/).filter(Boolean);
  const RESERVED = new Set([
    "admin", "admins", "administrator", "administrators",
    "mod", "mods", "moderator", "moderators",
  ]);

  const isAdminVariation =
    tokens.some((t) => t === "admin" || t === "admins" || t.startsWith("administrator")) ||
    unleetAlphanumeric === "admin" ||
    unleetAlphanumeric === "administrator";

  const isModVariation =
    tokens.some((t) => RESERVED.has(t) && t.startsWith("mod")) ||
    unleetAlphanumeric === "mod" ||
    unleetAlphanumeric === "mods" ||
    unleetAlphanumeric === "moderator" ||
    // Staff-style compounds such as "sitemod" / "modteam" remain reserved.
    /^(team|site|lead|head|official|staff|community|discord|global|chat|forum)mods?$/.test(unleetAlphanumeric) ||
    /^mods?(team|site|lead|head|official|staff|community|discord|global|chat|forum)$/.test(unleetAlphanumeric);

  if (isAdminVariation || isModVariation) {
    return {
      isReserved: true,
      reason: "The terms 'admin', 'mod', and 'moderator' are reserved exclusively for platform administrators.",
    };
  }

  return { isReserved: false };
}
