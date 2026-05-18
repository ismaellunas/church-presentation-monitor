import { useCallback, useEffect, useState } from 'react';

/**
 * Persists a JSON-serializable value to localStorage. Reads lazily on mount,
 * falls back to `initial` on parse failure or missing key.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota errors / private mode — non-fatal for a stage display.
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === 'function' ? (next as (prev: T) => T)(prev) : next,
    );
  }, []);

  return [value, update];
}
