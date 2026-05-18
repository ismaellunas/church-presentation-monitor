import { useEffect, useState } from 'react';

/**
 * Returns the current Date, refreshed roughly once per second. Aligns each
 * tick to the next wall-clock second so the displayed digits flip cleanly.
 */
export function useCurrentTime(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timeoutId: number;
    let intervalId: number;

    const scheduleAligned = () => {
      const current = new Date();
      const msUntilNextSecond = 1000 - current.getMilliseconds();
      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), 1000);
      }, msUntilNextSecond);
    };

    scheduleAligned();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return now;
}
