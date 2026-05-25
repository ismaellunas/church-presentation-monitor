import type { ReactNode } from 'react';

interface Props {
  presentationMode: boolean;
  onShowControls: () => void;
  screenMirror: ReactNode;
  currentTimePanel: ReactNode;
  countdownPanel: ReactNode;
}

/**
 * Centers a 16:9 frame on screen with a black letterbox. Top half shows the
 * mirrored screen, bottom half splits into current-time and countdown.
 * In Service Mode (presentation), the corner × and "Show Controls" pill are the
 * only escape hatches for non-technical users.
 */
export function StageLayout({
  presentationMode,
  onShowControls,
  screenMirror,
  currentTimePanel,
  countdownPanel,
}: Props) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      <div className="relative aspect-video w-full max-h-screen max-w-[177.78vh] grid grid-rows-[1fr_28vh] bg-black">
        <div className="min-h-0">{screenMirror}</div>
        <div className="min-h-0 grid grid-cols-2">
          <div className="min-w-0">{currentTimePanel}</div>
          <div className="min-w-0">{countdownPanel}</div>
        </div>

        {presentationMode && (
          <div className="absolute top-[1.5vh] right-[1.5vh] flex items-center gap-[1vh] z-10">
            <button
              type="button"
              onClick={onShowControls}
              className="rounded-full bg-black/60 hover:bg-black/80 text-white/90 text-[1.8vh] font-semibold px-[2vh] py-[1vh] shadow-lg"
              aria-label="Show controls"
            >
              Show Controls
            </button>
            <button
              type="button"
              onClick={onShowControls}
              className="rounded-full bg-black/60 hover:bg-black/80 text-white/90 leading-none flex items-center justify-center shadow-lg"
              style={{ width: '5vh', height: '5vh', fontSize: '3vh' }}
              aria-label="Close service mode"
              title="Show controls (Esc)"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
