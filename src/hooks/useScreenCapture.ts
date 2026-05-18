import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScreenCapture {
  stream: MediaStream | null;
  isSharing: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Wraps `navigator.mediaDevices.getDisplayMedia()` for screen mirroring.
 * - Cancellation by the user (NotAllowedError) is silent — no toast, no throw.
 * - Auto-clears when the underlying track ends (e.g. user clicks "Stop sharing"
 *   in the browser's native bar).
 */
export function useScreenCapture(): UseScreenCapture {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const stop = useCallback(() => {
    const current = streamRef.current;
    if (current) {
      current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen sharing is not supported in this browser.');
      return;
    }

    try {
      // Audio is intentionally off — only video is mirrored to the stage display.
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // When the user clicks the browser's "Stop sharing" bar, the track ends.
      mediaStream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (streamRef.current === mediaStream) {
            streamRef.current = null;
            setStream(null);
          }
        });
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      // The user cancelling the picker throws NotAllowedError — treat as silent no-op.
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Could not start screen share.';
      setError(message);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream,
    isSharing: stream !== null,
    error,
    start,
    stop,
  };
}
