import { useMemo } from 'react';
import { CURRENT_TIME_TEXT_COLOR } from '../lib/palette';

interface Props {
  now: Date;
  hour12: boolean;
  background: string;
}

export function CurrentTimePanel({ now, hour12, background }: Props) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12,
      }),
    [hour12],
  );

  const formatted = formatter.format(now);
  // Split off the AM/PM part so it can render smaller.
  const [timePart, periodPart] = formatted.split(/\s+/);

  return (
    <section
      className="relative flex flex-col items-center justify-center h-full w-full select-none"
      style={{ backgroundColor: background, color: CURRENT_TIME_TEXT_COLOR }}
      aria-label="Current time"
    >
      <div className="absolute top-[1.5vh] left-[2vh] text-[1.6vh] uppercase tracking-[0.3em] text-white/40 font-semibold">
        Current Time
      </div>
      <div className="flex items-baseline gap-[1.5vh] font-mono font-bold tracking-tight leading-none">
        <span className="text-[21vh]">{timePart}</span>
        {periodPart && <span className="text-[5vh]">{periodPart}</span>}
      </div>
    </section>
  );
}
