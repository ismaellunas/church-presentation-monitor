import { useCallback, useEffect, useState } from 'react';

interface UseFullscreen {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

/**
 * Wraps the Fullscreen API (`document.fullscreenElement`, `requestFullscreen`,
 * `exitFullscreen`). Kept separate from `presentationMode` so the user can run
 * Service Mode without forcing a real browser fullscreen.
 */
export function useFullscreen(): UseFullscreen {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // User can deny; not fatal for stage display.
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Non-fatal.
    }
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
