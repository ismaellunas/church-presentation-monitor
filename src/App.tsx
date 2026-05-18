import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { CountdownPanel } from './components/CountdownPanel';
import { CurrentTimePanel } from './components/CurrentTimePanel';
import { ScreenMirror } from './components/ScreenMirror';
import { StageLayout } from './components/StageLayout';
import { useCountdown } from './hooks/useCountdown';
import { useCurrentTime } from './hooks/useCurrentTime';
import { useFullscreen } from './hooks/useFullscreen';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScreenCapture } from './hooks/useScreenCapture';
import { computeTargetFromClock, hhmmToMs } from './lib/time';
import { DEFAULT_SETTINGS, type PersistedSettings } from './types';

const SETTINGS_KEY = 'cms.settings.v1';

export default function App() {
  const [settings, setSettings] = useLocalStorage<PersistedSettings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
  );

  const [presentationMode, setPresentationMode] = useState(false);

  const now = useCurrentTime();
  const countdown = useCountdown();
  const screen = useScreenCapture();
  const fullscreen = useFullscreen();

  const updateSettings = useCallback(
    (patch: Partial<PersistedSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setSettings],
  );

  const handleStart = useCallback(() => {
    let target: number | null = null;
    if (settings.mode === 'duration') {
      const ms = hhmmToMs(settings.lastDurationHHMM);
      if (ms === null || ms <= 0) return;
      target = Date.now() + ms;
    } else {
      target = computeTargetFromClock(settings.lastTargetHHMM);
    }
    if (target === null) return;
    countdown.start(target);
    setPresentationMode(true);
  }, [countdown, settings.lastDurationHHMM, settings.lastTargetHHMM, settings.mode]);

  const handleShowControls = useCallback(() => {
    setPresentationMode(false);
  }, []);

  // Wire up Esc/Space/R via the shared hook so all shortcut policy lives in one place.
  useKeyboardShortcuts({
    presentationMode,
    status: countdown.status,
    onShowControls: handleShowControls,
    onTogglePause: countdown.togglePause,
    onReset: countdown.reset,
  });

  // The 'idle' state previews whatever HH:MM the user has configured so they
  // see what's about to start.
  const previewMs = useMemo(() => {
    if (countdown.status !== 'idle') return null;
    if (settings.mode === 'duration') {
      return hhmmToMs(settings.lastDurationHHMM) ?? 0;
    }
    const target = computeTargetFromClock(settings.lastTargetHHMM);
    if (target === null) return 0;
    return Math.max(0, target - Date.now());
  }, [countdown.status, settings.mode, settings.lastDurationHHMM, settings.lastTargetHHMM]);

  // If the timer is reset back to idle while in service mode, surface controls
  // again so the volunteer isn't left staring at a "Ready" screen with no buttons.
  useEffect(() => {
    if (countdown.status === 'idle' && presentationMode) {
      setPresentationMode(false);
    }
  }, [countdown.status, presentationMode]);

  return (
    <>
      <StageLayout
        presentationMode={presentationMode}
        onShowControls={handleShowControls}
        screenMirror={
          <ScreenMirror stream={screen.stream} onSelectScreen={screen.start} />
        }
        currentTimePanel={
          <CurrentTimePanel
            now={now}
            hour12={settings.hour12}
            background={settings.currentTimeBg}
          />
        }
        countdownPanel={
          <CountdownPanel
            status={countdown.status}
            remainingMs={countdown.remainingMs}
            isOvertime={countdown.isOvertime}
            background={settings.countdownBg}
            previewMs={previewMs}
          />
        }
      />

      {!presentationMode && (
        <ConfigPanel
          settings={settings}
          updateSettings={updateSettings}
          status={countdown.status}
          isSharing={screen.isSharing}
          screenError={screen.error}
          isFullscreen={fullscreen.isFullscreen}
          onSelectScreen={screen.start}
          onStopSharing={screen.stop}
          onStart={handleStart}
          onTogglePause={countdown.togglePause}
          onReset={countdown.reset}
          onToggleFullscreen={fullscreen.toggle}
          onHideControls={() => setPresentationMode(true)}
        />
      )}
    </>
  );
}
