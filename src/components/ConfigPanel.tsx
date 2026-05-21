import { useEffect, useMemo, useRef, useState } from 'react';
import type { PersistedSettings, TimerStatus, TimerMode } from '../types';
import {
  CURRENT_TIME_SWATCHES,
  COUNTDOWN_SWATCHES,
  type Swatch,
} from '../lib/palette';
import { parseHHMM } from '../lib/time';
import { SetupGuide } from './SetupGuide';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface Props {
  settings: PersistedSettings;
  updateSettings: (patch: Partial<PersistedSettings>) => void;
  status: TimerStatus;
  isSharing: boolean;
  screenError: string | null;
  isFullscreen: boolean;
  onSelectScreen: () => void;
  onStopSharing: () => void;
  onStart: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onHideControls: () => void;
}

const PRIMARY_BUTTON =
  'h-14 rounded-lg px-5 text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow';
const COLORS = {
  green: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white',
  red: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white',
  blue: 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white',
  zinc: 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 text-white',
};

export function ConfigPanel({
  settings,
  updateSettings,
  status,
  isSharing,
  screenError,
  isFullscreen,
  onSelectScreen,
  onStopSharing,
  onStart,
  onTogglePause,
  onReset,
  onToggleFullscreen,
  onHideControls,
}: Props) {
  const isIdle = status === 'idle';
  const isPaused = status === 'paused';

  const inputValue =
    settings.mode === 'duration' ? settings.lastDurationHHMM : settings.lastTargetHHMM;

  const inputValid = useMemo(() => {
    const parsed = parseHHMM(inputValue);
    if (!parsed) return false;
    if (settings.mode === 'targetTime' && parsed.hours > 23) return false;
    return true;
  }, [inputValue, settings.mode]);

  const handleHHMMChange = (next: string) => {
    if (settings.mode === 'duration') {
      updateSettings({ lastDurationHHMM: next });
    } else {
      updateSettings({ lastTargetHHMM: next });
    }
  };

  const handleModeChange = (mode: TimerMode) => updateSettings({ mode });

  const startDisabled = !inputValid || !isIdle;

  const steps = [
    {
      number: 1,
      title: 'Select screen to mirror',
      helper: isSharing
        ? 'Screen is being mirrored.'
        : 'Pick a monitor, window, or tab to show on the TV.',
      done: isSharing,
      action: isSharing ? (
        <button
          type="button"
          onClick={onStopSharing}
          className={`${PRIMARY_BUTTON} ${COLORS.red}`}
        >
          Stop Sharing
        </button>
      ) : (
        <button
          type="button"
          onClick={onSelectScreen}
          className={`${PRIMARY_BUTTON} ${COLORS.green}`}
        >
          Select Screen
        </button>
      ),
    },
    {
      number: 2,
      title: 'Set timer',
      helper:
        settings.mode === 'duration'
          ? 'How long should the talk last? (HH:MM)'
          : 'What clock time should the timer end at? (HH:MM, 24h)',
      done: inputValid,
    },
    {
      number: 3,
      title: 'Start timer',
      helper: isIdle
        ? 'Press Start when the speaker begins.'
        : isPaused
          ? 'Timer is paused. Press Resume to continue.'
          : 'Timer is running.',
      done: !isIdle,
      action: isIdle ? (
        <button
          type="button"
          onClick={onStart}
          disabled={startDisabled}
          className={`${PRIMARY_BUTTON} ${COLORS.green}`}
        >
          Start
        </button>
      ) : (
        <button
          type="button"
          onClick={onTogglePause}
          className={`${PRIMARY_BUTTON} ${COLORS.zinc}`}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      ),
    },
    {
      number: 4,
      title: 'Enter fullscreen',
      helper: isFullscreen
        ? 'In fullscreen — press Esc or use the Exit button to leave.'
        : 'Make the layout fill the whole screen for a clean cast.',
      done: isFullscreen,
      action: (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`${PRIMARY_BUTTON} ${COLORS.blue}`}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </button>
      ),
    },
    {
      number: 5,
      title: 'Cast to TV',
      helper:
        'Open Chrome\'s ⋮ menu → Cast… → choose your TV or Chromecast. (Browsers don\'t let this app cast for you.)',
      done: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/85 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-white">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Church Stage Monitor</h1>
            <p className="text-sm text-zinc-400">
              Set up the stage display, then enter Service Mode for a clean cast.
            </p>
          </div>
          <button
            type="button"
            onClick={onHideControls}
            className={`${PRIMARY_BUTTON} ${COLORS.zinc} h-12 px-4`}
            title="Hide all controls (you can still press Esc to come back)"
          >
            Hide Controls
          </button>
        </header>

        {screenError && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            Screen share failed: {screenError}
          </div>
        )}

        <SetupGuide steps={steps} />

        <section className="mt-6 grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Timer settings
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="duration"
                checked={settings.mode === 'duration'}
                onChange={() => handleModeChange('duration')}
                className="h-4 w-4"
              />
              <span>Duration</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="targetTime"
                checked={settings.mode === 'targetTime'}
                onChange={() => handleModeChange('targetTime')}
                className="h-4 w-4"
              />
              <span>Until clock time</span>
            </label>

            <div className="ml-auto flex items-center gap-3">
              <label className="text-sm text-zinc-400" htmlFor="hhmm">
                HH:MM
              </label>
              <input
                id="hhmm"
                type="text"
                inputMode="numeric"
                pattern="\\d{1,2}:\\d{2}"
                value={inputValue}
                onChange={(event) => handleHHMMChange(event.target.value)}
                placeholder={settings.mode === 'duration' ? '00:25' : '11:30'}
                className={`w-32 rounded-md border bg-zinc-900 px-3 py-2 font-mono text-lg ${
                  inputValid ? 'border-zinc-700' : 'border-red-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Clock format:</span>
            <div className="inline-flex rounded-md border border-zinc-700 bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => updateSettings({ hour12: true })}
                className={`px-3 py-1 text-sm rounded ${
                  settings.hour12 ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                }`}
              >
                12-hour
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ hour12: false })}
                className={`px-3 py-1 text-sm rounded ${
                  !settings.hour12 ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                }`}
              >
                24-hour
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Colors
          </h2>

          <div>
            <div className="mb-2 text-sm text-zinc-300">Current time background</div>
            <SwatchRow
              swatches={CURRENT_TIME_SWATCHES}
              value={settings.currentTimeBg}
              onChange={(v) => updateSettings({ currentTimeBg: v })}
            />
          </div>

          <div>
            <div className="mb-2 text-sm text-zinc-300">Countdown background</div>
            <SwatchRow
              swatches={COUNTDOWN_SWATCHES}
              value={settings.countdownBg}
              onChange={(v) => updateSettings({ countdownBg: v })}
            />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStart}
              disabled={startDisabled}
              className={`${PRIMARY_BUTTON} ${COLORS.green}`}
            >
              Start
            </button>
            <button
              type="button"
              onClick={onTogglePause}
              disabled={isIdle}
              className={`${PRIMARY_BUTTON} ${COLORS.zinc}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={isIdle}
              className={`${PRIMARY_BUTTON} ${COLORS.red}`}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSelectScreen}
              className={`${PRIMARY_BUTTON} ${COLORS.blue}`}
            >
              Select Screen
            </button>
            <button
              type="button"
              onClick={onStopSharing}
              disabled={!isSharing}
              className={`${PRIMARY_BUTTON} ${COLORS.zinc}`}
            >
              Stop Sharing
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`${PRIMARY_BUTTON} ${COLORS.zinc}`}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
            <button
              type="button"
              onClick={onHideControls}
              className={`${PRIMARY_BUTTON} ${COLORS.zinc}`}
              title="Service Mode hides every button except the corner × / Show Controls."
            >
              Hide Controls (Service Mode)
            </button>
          </div>
        </section>

        <footer className="mt-6 border-t border-zinc-800 pt-4">
          <KeyboardShortcuts />
          <div className="mt-4 flex justify-end gap-2">
            <OwnershipInfoButton />
            <a
              href="https://www.facebook.com/greatemmanuel.worshipchurch/"
              target="_blank"
              rel="noopener noreferrer"
              title="GEWCI on Facebook"
              aria-label="GEWCI on Facebook"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 transition-colors hover:bg-[#1877F2] hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/ElCajoOfficial"
              target="_blank"
              rel="noopener noreferrer"
              title="Developer — El Cajo"
              aria-label="Developer — El Cajo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 transition-colors hover:bg-emerald-600 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function OwnershipInfoButton() {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const open = pinned || hovered;

  useEffect(() => {
    if (!pinned) return;

    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setPinned(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPinned(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [pinned]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => setPinned((prev) => !prev)}
        aria-label="Ownership information"
        aria-expanded={open}
        title="Ownership information"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 transition-colors hover:bg-sky-600 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 z-20 mb-2 w-64 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs leading-snug text-zinc-300 shadow-xl"
        >
          This tool is owned by{' '}
          <span className="font-semibold text-white">
            GEWCI (Great Emmanuel Worship Church Inc.)
          </span>
          . All rights reserved to the owner.
        </div>
      )}
    </div>
  );
}

function SwatchRow({
  swatches,
  value,
  onChange,
}: {
  swatches: Swatch[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((swatch) => {
        const selected = swatch.value.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={swatch.value}
            type="button"
            onClick={() => onChange(swatch.value)}
            title={swatch.name}
            aria-pressed={selected}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              selected
                ? 'border-white bg-zinc-800'
                : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <span
              className="inline-block h-5 w-5 rounded border border-zinc-600"
              style={{ backgroundColor: swatch.value }}
              aria-hidden
            />
            <span className="text-zinc-200">{swatch.name}</span>
          </button>
        );
      })}
    </div>
  );
}
