"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";

const MAX_RECENT = 6;
const recentSearchesStore = createLocalStore<string[]>("antara:recent-searches", []);

export function useRecentSearches() {
  const recent = useSyncExternalStore(
    recentSearchesStore.subscribe,
    recentSearchesStore.getSnapshot,
    recentSearchesStore.getServerSnapshot
  );

  const addRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    recentSearchesStore.set((prev) =>
      [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT)
    );
  }, []);

  const clearRecent = useCallback(() => recentSearchesStore.set([]), []);

  return { recent, addRecent, clearRecent };
}
