import { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
  onSelectScreen: () => void;
}

export function ScreenMirror({ stream, onSelectScreen }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browser API: a media stream is attached to a <video> element via srcObject.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      video.play().catch(() => {
        // autoPlay should suffice; ignore play interruption errors.
      });
    }
  }, [stream]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-contain bg-black"
      />
      {!stream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none gap-[2vh] px-6">
          <div className="text-[10vh] leading-none" aria-hidden>
            {/* Simple monitor glyph using emoji-free Unicode for broad font support. */}
            <span className="inline-block">▭</span>
          </div>
          <div className="text-[3vh] font-semibold text-zinc-200">No screen selected</div>
          <div className="text-[1.8vh] text-zinc-400">
            Click Select Screen to mirror a monitor, window, or tab.
          </div>
          <button
            type="button"
            onClick={onSelectScreen}
            className="mt-[1vh] rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[2.2vh] font-semibold px-[3vh] py-[1.2vh] shadow-lg"
          >
            Select Screen
          </button>
        </div>
      )}
    </div>
  );
}
