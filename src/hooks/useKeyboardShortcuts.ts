import { useEffect } from 'react';
import type { TimerStatus } from '../types';

interface Options {
  presentationMode: boolean;
  status: TimerStatus;
  onShowControls: () => void;
  onTogglePause: () => void;
  onReset: () => void;
}

/**
 * Single global keydown listener that powers the volunteer-friendly shortcuts:
 *   Escape -> reveal controls (only useful while in Service Mode)
 *   Space  -> pause/resume the countdown
 *   R      -> reset, but only when controls are visible (per spec)
 *
 * Skips the handler entirely when the user is typing into a form control so
 * Space doesn't break HH:MM input.
 */
export function useKeyboardShortcuts({
  presentationMode,
  status,
  onShowControls,
  onTogglePause,
  onReset,
}: Options): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;

      // Escape always works (even while typing) so volunteers can always escape.
      if (event.key === 'Escape') {
        if (presentationMode) {
          event.preventDefault();
          onShowControls();
        }
        return;
      }

      if (isEditable) return;

      if (event.code === 'Space' || event.key === ' ') {
        if (status === 'running' || status === 'paused' || status === 'overtime') {
          event.preventDefault();
          onTogglePause();
        }
        return;
      }

      if (event.code === 'KeyR' || event.key === 'r' || event.key === 'R') {
        if (!presentationMode) {
          event.preventDefault();
          onReset();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode, status, onShowControls, onTogglePause, onReset]);
}
