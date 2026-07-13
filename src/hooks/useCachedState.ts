import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useCachedState — like useState but persisted in localStorage, scoped to
 * the signed-in user. Lets feature components keep their inputs/results
 * across tab switches and reloads so users never lose work or wait for the
 * same result twice - without leaking one account's drafts (resume text,
 * LinkedIn URLs, job descriptions, etc.) into another account signed in on
 * the same device afterward.
 */
export function useCachedState<T>(key: string, initial: T) {
  const { user } = useAuth();
  // Every consumer of this hook lives under ProtectedRoute, which unmounts
  // the whole tree on sign-out and remounts it on sign-in, so reading the
  // user id once at mount time always reflects whoever is actually signed
  // in when this component renders.
  const storageKey = `pf:${user?.id ?? 'anon'}:${key}`;
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
