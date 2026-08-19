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

  // 1. Admin variations
  const isAdminVariation =
    /adm[i1l!]n/i.test(clean) ||
    /4dm[i1l!]n/i.test(clean) ||
    /administrat/i.test(unleetAlphanumeric) ||
    unleetAlphanumeric.includes("admin");

  // 2. Mod / Moderator variations
  const isModVariation =
    /\b(mod|mods|m0d|m0ds)\b/i.test(clean) ||
    /(^|[^a-z0-9])m[o0]ds?([^a-z0-9]|$)/i.test(clean) ||
    alphanumeric === "mod" ||
    alphanumeric === "mods" ||
    alphanumeric === "m0d" ||
    alphanumeric === "m0ds" ||
    /m[o0]derat/i.test(unleetAlphanumeric) ||
    /^(mod|m0d)[_-]|[_-](mod|m0d)$/i.test(clean) ||
    /(team|site|lead|head|official|staff|community|discord|global|chat|forum)(mod|m0d)/i.test(unleetAlphanumeric) ||
    /(mod|m0d)(team|site|lead|head|official|staff|community|discord|global|chat|forum|min|admin|erator)/i.test(unleetAlphanumeric);

  if (isAdminVariation || isModVariation) {
    return {
      isReserved: true,
      reason: "The terms 'admin', 'mod', and 'moderator' are reserved exclusively for platform administrators.",
    };
  }

  return { isReserved: false };
}
