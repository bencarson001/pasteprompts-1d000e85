const COUNT_KEY = "pp_free_copies";

// How many prompts a logged-out visitor may copy before we ask them to sign up.
// Two feels generous enough to prove value, tight enough to convert.
export const FREE_COPY_LIMIT = 2;

/** Reads how many free copies a logged-out visitor has already used. */
export function getFreeCopies(): number {
  try {
    return Number(localStorage.getItem(COUNT_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

/** Records one more free copy and returns the new total. */
export function incrementFreeCopies(): number {
  const next = getFreeCopies() + 1;
  try {
    localStorage.setItem(COUNT_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** True when the visitor has hit the free limit and should be asked to sign up. */
export function hasReachedFreeLimit(): boolean {
  return getFreeCopies() >= FREE_COPY_LIMIT;
}
