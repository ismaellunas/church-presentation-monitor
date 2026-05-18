export type TimerMode = 'duration' | 'targetTime';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'overtime';

export interface CountdownState {
  status: TimerStatus;
  /** ms epoch when countdown should hit zero. Recomputed on start/resume. */
  targetTimestamp: number | null;
  /** While paused, ms remaining when the user paused. Source of truth while paused. */
  pausedRemainingMs: number | null;
}

export interface PersistedSettings {
  mode: TimerMode;
  /** "HH:MM" — the duration last entered, used in duration mode. */
  lastDurationHHMM: string;
  /** "HH:MM" — the wall-clock target last entered, used in target-time mode. */
  lastTargetHHMM: string;
  /** Hex color for the current-time panel background. */
  currentTimeBg: string;
  /** Hex color for the countdown panel background. */
  countdownBg: string;
  /** True = 12-hour clock, false = 24-hour clock. */
  hour12: boolean;
}

export const DEFAULT_SETTINGS: PersistedSettings = {
  mode: 'duration',
  lastDurationHHMM: '00:25',
  lastTargetHHMM: '11:30',
  currentTimeBg: '#3f3f46',
  countdownBg: '#000000',
  hour12: true,
};
