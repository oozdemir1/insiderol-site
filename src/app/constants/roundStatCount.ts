// Homepage "X+" stat displays (ring counts, company/role totals) round
// down to the nearest 5 rather than showing the exact live count — a
// number like "151+" reads as an oddly precise claim for what's meant
// to be an approximate scale indicator, and would visibly tick up by
// one on every page load as data gets seeded/added.
export function roundStatCount(count: number): number {
  if (count <= 0) return 0;

  // Never round a genuinely non-zero count down to 0 — that would read
  // as "nothing here yet" for what's actually a handful of real rows.
  return Math.max(5, Math.floor(count / 5) * 5);
}
