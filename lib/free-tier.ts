export const FREE_MONTHLY_LINK_LIMIT = 2;
export const FREE_REVIEWS_PER_LINK = 100;

// Temporary: allow every user to create unlimited review links per month,
// ignoring FREE_MONTHLY_LINK_LIMIT above. Flip back to `false` to re-enable
// the monthly cap.
export const UNLIMITED_MONTHLY_LINKS = true;

export function getCurrentMonthBounds(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    monthStart,
    nextMonthStart,
  };
}

export function getCurrentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
