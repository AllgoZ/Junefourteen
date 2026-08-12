import { readStorage, writeStorage } from "@/lib/storage";

/**
 * Minimal external store for localStorage-backed state, read via
 * useSyncExternalStore. Avoids the "setState in an effect" hydration
 * pattern — the snapshot is hydrated lazily on first read (client only,
 * `getServerSnapshot` covers the server/first-paint case) and updates are
 * written synchronously from event handlers, never from render.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  let cache = fallback;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function getSnapshot(): T {
    if (!hydrated && typeof window !== "undefined") {
      cache = readStorage<T>(key, fallback);
      hydrated = true;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  function subscribe(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function set(next: T | ((prev: T) => T)): void {
    const resolved = typeof next === "function" ? (next as (prev: T) => T)(getSnapshot()) : next;
    cache = resolved;
    hydrated = true;
    writeStorage(key, resolved);
    listeners.forEach((listener) => listener());
  }

  return { getSnapshot, getServerSnapshot, subscribe, set };
}
