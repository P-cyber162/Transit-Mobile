// ============================================================
// utils/apiHelpers.ts — Shared API response helpers
// ============================================================

/** Unwrap Spring PageResponse `{ content: T[] }` or raw arrays. */
export function unwrapList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export function formatTimeLabel(isoOrDate?: string | null): string {
  if (!isoOrDate) return '';
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(isoOrDate);
  }
}
