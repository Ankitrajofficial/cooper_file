export const FREE_MONTHLY_LINK_LIMIT = 2;
export const FREE_REVIEWS_PER_LINK = 100;

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
