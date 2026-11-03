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

  // Check each word separately so harmless text ("Tom Odell", "badminton")
  // isn't joined into a false match. Mirrors the server-side profile trigger.
  const words = unleet.split(/[^a-z]+/).filter(Boolean);
  const modAllow = /^(model|models|modelling|modeling|modern|modest|mode|modes|modular|module|modules|modify|modified)$/;
  const isAdminVariation = words.some((w) => /admi*n/.test(w) && !/badminton/.test(w) && !/^administrat/.test(w));
  const isModVariation = words.some((w) => /mod/.test(w) && !modAllow.test(w));

  if (isAdminVariation || isModVariation) {
    return {
      isReserved: true,
      reason: "The terms 'admin', 'mod', and 'moderator' are reserved exclusively for platform administrators.",
    };
  }

  return { isReserved: false };
}
