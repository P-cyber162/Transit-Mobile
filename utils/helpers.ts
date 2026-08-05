// ============================================================
// utils/helpers.ts — Shared Helper Functions
// ============================================================

export function formatTime(date: Date | string | number): string {
  try {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '--:--';
  }
}

export function formatDate(date: Date | string | number): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Active':
    case 'PRESENT':
    case 'ON_DUTY':
    case 'STARTED':
    case 'RESUMED':
    case 'Completed':
    case 'On Time':
      return { bg: 'rgba(29, 158, 117, 0.15)', text: '#1D9E75', border: 'rgba(29, 158, 117, 0.3)' };
    case 'Delayed':
    case 'LATE':
    case 'PAUSED':
    case 'UNDER_REVIEW':
      return { bg: 'rgba(239, 159, 39, 0.15)', text: '#EF9F27', border: 'rgba(239, 159, 39, 0.3)' };
    case 'Critical':
    case 'ABSENT':
    case 'Cancelled':
      return { bg: 'rgba(218, 90, 48, 0.15)', text: '#D85A30', border: 'rgba(218, 90, 48, 0.3)' };
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' };
  }
}

export function truncate(text: string, maxLength = 35): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
