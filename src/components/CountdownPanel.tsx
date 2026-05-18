import type { TimerStatus } from '../types';
import { formatDuration } from '../lib/time';
import { COUNTDOWN_COLORS } from '../lib/palette';

interface Props {
  status: TimerStatus;
  remainingMs: number;
  isOvertime: boolean;
  background: string;
  /** ms preview shown when status === 'idle' so user sees what's configured. */
  previewMs: number | null;
}

const TEN_MIN_MS = 10 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;

function pickColor(remainingMs: number, isOvertime: boolean): string {
  if (isOvertime) return COUNTDOWN_COLORS.red;
  if (remainingMs <= FIVE_MIN_MS) return COUNTDOWN_COLORS.red;
  if (remainingMs <= TEN_MIN_MS) return COUNTDOWN_COLORS.yellow;
  return COUNTDOWN_COLORS.green;
}

export function CountdownPanel({
  status,
  remainingMs,
  isOvertime,
  background,
  previewMs,
}: Props) {
  const isIdle = status === 'idle';
  const isPaused = status === 'paused';

  const displayMs = isIdle && previewMs !== null ? previewMs : Math.abs(remainingMs);
  const color = isIdle ? '#52525b' : pickColor(remainingMs, isOvertime);

  return (
    <section
      className="relative flex flex-col items-center justify-center h-full w-full select-none"
      style={{ backgroundColor: background, color }}
      aria-label="Countdown timer"
    >
      <div className="absolute top-[1.5vh] left-[2vh] text-[1.6vh] uppercase tracking-[0.3em] text-white/40 font-semibold">
        Countdown
      </div>

      {isPaused && (
        <div className="absolute top-[1.5vh] right-[2vh] text-[1.6vh] uppercase tracking-[0.3em] text-amber-300 font-semibold">
          Paused
        </div>
      )}

      <div className="font-mono font-bold tracking-tight leading-none text-[14vh]">
        {formatDuration(displayMs)}
      </div>

      {isOvertime && (
        <div
          className="mt-[1vh] font-bold tracking-[0.3em] text-[5vh] leading-none"
          style={{ color: COUNTDOWN_COLORS.red }}
        >
          OVERTIME
        </div>
      )}

      {isIdle && (
        <div className="mt-[1vh] text-[2vh] uppercase tracking-[0.25em] text-white/30 font-semibold">
          Ready
        </div>
      )}
    </section>
  );
}
