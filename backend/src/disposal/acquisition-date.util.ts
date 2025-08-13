/**
 * Deterministically derives a mock acquisition date for an assetId.
 * Keeps this module independent from any real Asset module/service.
 *
 * Strategy: Base date = 2020-01-01 + (hash(assetId) % 1800) days (≈ up to ~5 years)
 */
export function getMockAcquisitionDate(assetId: string): string {
  const base = new Date("2020-01-01T00:00:00Z");
  const offsetDays = hashString(assetId) % 1800;
  const date = new Date(base.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}
