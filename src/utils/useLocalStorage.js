/**
 * useLocalStorage — SSR-safe React hook for JSON values in localStorage.
 */

import { useCallback, useEffect, useState } from "react";

function readStorage(key, initialValue) {
  if (typeof window === "undefined") return initialValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return initialValue;
    return JSON.parse(raw);
  } catch {
    return initialValue;
  }
}

/**
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => readStorage(key, initialValue));

  // Sync if key changes
  useEffect(() => {
    setStored(readStorage(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value) => {
      setStored((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
          }
        } catch {
          /* quota / private mode */
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
    setStored(initialValue);
  }, [key, initialValue]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      if (e.newValue == null) {
        setStored(initialValue);
        return;
      }
      try {
        setStored(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initialValue]);

  return [stored, setValue, remove];
}

export default useLocalStorage;
