import React from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import { Uniwind } from 'uniwind';

const THEME_DIR = 'pocket-no';
const THEME_FILE = 'theme.json';
const WRITE_DEBOUNCE_MS = 220;
const SCHEMA_VERSION = 1 as const;

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeFile {
  version: typeof SCHEMA_VERSION;
  preference: ThemePreference;
}

const VALID_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

let preference: ThemePreference = 'system';
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function resolveThemeFile(): File {
  return new File(Paths.document, THEME_DIR, THEME_FILE);
}

function ensureDir() {
  try {
    const dir = new Directory(Paths.document, THEME_DIR);
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to ensure theme directory', error);
  }
}

function applyTheme(next: ThemePreference) {
  try {
    Uniwind.setTheme(next);
  } catch (error) {
    console.warn('Failed to apply theme', error);
  }
}

function parseThemeFile(raw: string): ThemePreference {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'preference' in parsed &&
      typeof (parsed as ThemeFile).preference === 'string' &&
      VALID_PREFERENCES.includes((parsed as ThemeFile).preference)
    ) {
      return (parsed as ThemeFile).preference;
    }
  } catch (error) {
    console.warn('Failed to parse theme file', error);
  }
  return 'system';
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      const file = resolveThemeFile();
      if (!file.exists) {
        hydrated = true;
        return;
      }
      const raw = await file.text();
      preference = parseThemeFile(raw);
      applyTheme(preference);
    } catch (error) {
      console.warn('Failed to hydrate theme store', error);
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
      const payload: ThemeFile = {
        version: SCHEMA_VERSION,
        preference,
      };
      const file = resolveThemeFile();
      if (!file.exists) {
        file.create({ intermediates: true });
      }
      file.write(JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist theme preference', error);
    }
  }, WRITE_DEBOUNCE_MS);
}

export function subscribeToThemePreference(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    void hydrate();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getThemePreferenceSnapshot(): ThemePreference {
  return preference;
}

export function setThemePreference(next: ThemePreference) {
  if (preference === next) return;
  preference = next;
  applyTheme(next);
  scheduleWrite();
  emitChange();
}

export function useThemePreference(): ThemePreference {
  return React.useSyncExternalStore(
    subscribeToThemePreference,
    getThemePreferenceSnapshot,
    getThemePreferenceSnapshot
  );
}
