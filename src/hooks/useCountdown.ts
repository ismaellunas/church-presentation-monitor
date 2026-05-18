import { useCallback, useEffect, useRef, useState } from 'react';
import type { CountdownState, TimerStatus } from '../types';

const TICK_MS = 250;

const INITIAL: CountdownState = {
  status: 'idle',
  targetTimestamp: null,
  pausedRemainingMs: null,
};

export interface UseCountdown {
  status: TimerStatus;
  targetTimestamp: number | null;
  /** ms until target. Negative means overtime. 0 when idle. */
  remainingMs: number;
  isOvertime: boolean;
  start: (targetTimestamp: number) => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  reset: () => void;
}

export function useCountdown(): UseCountdown {
  const [state, setState] = useState<CountdownState>(INITIAL);
  // `tick` is bumped from setInterval to drive re-renders while the timer runs.
  const [tick, setTick] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Drive UI updates ~4x/sec while active. Drift-free because remainingMs is
  // always derived from Date.now() vs the stored target timestamp.
  useEffect(() => {
    if (state.status !== 'running' && state.status !== 'overtime') return;
    const id = window.setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.status]);

  // Auto-transition running -> overtime once remaining time goes negative.
  useEffect(() => {
    if (state.status !== 'running' || state.targetTimestamp === null) return;
    if (Date.now() >= state.targetTimestamp) {
      setState((prev) => ({ ...prev, status: 'overtime' }));
    }
  }, [state.status, state.targetTimestamp, tick]);

  const start = useCallback((targetTimestamp: number) => {
    const now = Date.now();
    setState({
      status: targetTimestamp <= now ? 'overtime' : 'running',
      targetTimestamp,
      pausedRemainingMs: null,
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running' && prev.status !== 'overtime') return prev;
      const remaining = (prev.targetTimestamp ?? Date.now()) - Date.now();
      return {
        status: 'paused',
        targetTimestamp: null,
        pausedRemainingMs: remaining,
      };
    });
  }, []);

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused' || prev.pausedRemainingMs === null) return prev;
      const newTarget = Date.now() + prev.pausedRemainingMs;
      return {
        status: prev.pausedRemainingMs <= 0 ? 'overtime' : 'running',
        targetTimestamp: newTarget,
        pausedRemainingMs: null,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    const current = stateRef.current.status;
    if (current === 'running' || current === 'overtime') {
      pause();
    } else if (current === 'paused') {
      resume();
    }
  }, [pause, resume]);

  const reset = useCallback(() => {
    setState(INITIAL);
  }, []);

  let remainingMs = 0;
  if (state.status === 'paused') {
    remainingMs = state.pausedRemainingMs ?? 0;
  } else if (state.targetTimestamp !== null) {
    remainingMs = state.targetTimestamp - Date.now();
  }

  const isActive = state.status !== 'idle';
  return {
    status: state.status,
    targetTimestamp: state.targetTimestamp,
    remainingMs,
    isOvertime: isActive && remainingMs <= 0,
    start,
    pause,
    resume,
    togglePause,
    reset,
  };
}
