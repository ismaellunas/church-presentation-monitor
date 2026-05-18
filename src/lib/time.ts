/**
 * Validates an "HH:MM" string. Hours 0-99 (lets users enter 90-minute talks),
 * minutes 0-59. Returns null when invalid.
 */
export function parseHHMM(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 99) return null;
  if (minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

export function hhmmToMs(value: string): number | null {
  const parsed = parseHHMM(value);
  if (!parsed) return null;
  return parsed.hours * 3_600_000 + parsed.minutes * 60_000;
}

/**
 * Computes the next occurrence of a wall-clock "HH:MM" today.
 * If the time has already passed today, rolls over to the same time tomorrow.
 */
export function computeTargetFromClock(value: string, now = new Date()): number | null {
  const parsed = parseHHMM(value);
  if (!parsed) return null;
  // Wall-clock target time interprets HH as 0-23.
  if (parsed.hours > 23) return null;
  const target = new Date(now);
  target.setHours(parsed.hours, parsed.minutes, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

/**
 * Formats a non-negative ms duration as "H:MM:SS" (hour optional) or "M:SS".
 * For overtime callers should pass Math.abs(ms) and render "OVERTIME" separately.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}
