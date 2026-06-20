import { useState, useEffect, useRef } from 'react';

/**
 * useCachedState — like useState but persisted in localStorage.
 * Lets feature components keep their inputs/results across tab switches and reloads
 * so users never lose work or wait for the same result twice.
 */
export function useCachedState<T>(key: string, initial: T) {
  const storageKey = `pf:${key}`;
  const isFirst = useRef(true);
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* quota / private-mode — ignore */
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}

export function clearCachedState(key: string) {
  try {
    window.localStorage.removeItem(`pf:${key}`);
  } catch {
    /* ignore */
  }
}
