import React from 'react';
import { Directory, File, Paths } from 'expo-file-system';

const FAVORITES_DIR = 'pocket-no';
const FAVORITES_FILE = 'favorites.json';
const WRITE_DEBOUNCE_MS = 160;
const SCHEMA_VERSION = 1 as const;

type FavoritesFile = {
  version: typeof SCHEMA_VERSION;
  ids: string[];
};

let favorites: ReadonlySet<string> = new Set<string>();
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function resolveFavoritesFile(): File {
  return new File(Paths.document, FAVORITES_DIR, FAVORITES_FILE);
}

function ensureDir() {
  try {
    const dir = new Directory(Paths.document, FAVORITES_DIR);
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to ensure favorites directory', error);
  }
}

function parseFavoritesFile(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'ids' in parsed &&
      Array.isArray((parsed as FavoritesFile).ids)
    ) {
      return (parsed as FavoritesFile).ids.filter(
        (value): value is string => typeof value === 'string' && value.length > 0
      );
    }
  } catch (error) {
    console.warn('Failed to parse favorites file', error);
  }
  return [];
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      const file = resolveFavoritesFile();
      if (!file.exists) {
        hydrated = true;
        return;
      }
      const raw = await file.text();
      const ids = parseFavoritesFile(raw);
      favorites = new Set(ids);
    } catch (error) {
      console.warn('Failed to hydrate favorites store', error);
    } finally {
      hydrated = true;
      emitChange();
    }
  })();

  return hydrationPromise;
}

function scheduleWrite() {
  if (writeTimer) {
    clearTimeout(writeTimer);
  }
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      ensureDir();
      const payload: FavoritesFile = {
        version: SCHEMA_VERSION,
        ids: [...favorites],
      };
      const file = resolveFavoritesFile();
      if (!file.exists) {
        file.create({ intermediates: true });
      }
      file.write(JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist favorites', error);
    }
  }, WRITE_DEBOUNCE_MS);
}

export function subscribeToFavorites(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    void hydrate();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getFavoritesSnapshot(): ReadonlySet<string> {
  return favorites;
}

export function isFavorite(id: string): boolean {
  return favorites.has(id);
}

export function addFavorite(id: string) {
  if (favorites.has(id)) return;
  const next = new Set(favorites);
  next.add(id);
  favorites = next;
  scheduleWrite();
  emitChange();
}

export function removeFavorite(id: string) {
  if (!favorites.has(id)) return;
  const next = new Set(favorites);
  next.delete(id);
  favorites = next;
  scheduleWrite();
  emitChange();
}

export function toggleFavorite(id: string) {
  if (favorites.has(id)) {
    removeFavorite(id);
  } else {
    addFavorite(id);
  }
}

export function clearFavorites() {
  if (favorites.size === 0) return;
  favorites = new Set();
  scheduleWrite();
  emitChange();
}

export function useFavorites(): ReadonlySet<string> {
  return React.useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesSnapshot
  );
}

export function useIsFavorite(id: string | null | undefined): boolean {
  const set = useFavorites();
  if (!id) return false;
  return set.has(id);
}
