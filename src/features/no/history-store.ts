import React from 'react';
import { Directory, File, Paths } from 'expo-file-system';

const HISTORY_DIR = 'pocket-no';
const HISTORY_FILE = 'history.json';
const WRITE_DEBOUNCE_MS = 220;
const SCHEMA_VERSION = 1 as const;
const MAX_ENTRIES = 30;

export interface HistoryEntry {
  id: string;
  ts: number;
}

interface HistoryFile {
  version: typeof SCHEMA_VERSION;
  entries: HistoryEntry[];
}

let history: readonly HistoryEntry[] = [];
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function resolveHistoryFile(): File {
  return new File(Paths.document, HISTORY_DIR, HISTORY_FILE);
}

function ensureDir() {
  try {
    const dir = new Directory(Paths.document, HISTORY_DIR);
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to ensure history directory', error);
  }
}

function parseHistoryFile(raw: string): HistoryEntry[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'entries' in parsed &&
      Array.isArray((parsed as HistoryFile).entries)
    ) {
      return (parsed as HistoryFile).entries
        .filter(
          (entry): entry is HistoryEntry =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof (entry as HistoryEntry).id === 'string' &&
            (entry as HistoryEntry).id.length > 0 &&
            typeof (entry as HistoryEntry).ts === 'number'
        )
        .slice(0, MAX_ENTRIES);
    }
  } catch (error) {
    console.warn('Failed to parse history file', error);
  }
  return [];
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      const file = resolveHistoryFile();
      if (!file.exists) {
        hydrated = true;
        return;
      }
      const raw = await file.text();
      history = parseHistoryFile(raw);
    } catch (error) {
      console.warn('Failed to hydrate history store', error);
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
      const payload: HistoryFile = {
        version: SCHEMA_VERSION,
        entries: [...history],
      };
      const file = resolveHistoryFile();
      if (!file.exists) {
        file.create({ intermediates: true });
      }
      file.write(JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist history', error);
    }
  }, WRITE_DEBOUNCE_MS);
}

export function subscribeToHistory(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    void hydrate();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getHistorySnapshot(): readonly HistoryEntry[] {
  return history;
}

export function recordHistoryEntry(id: string) {
  if (!id) return;
  const now = Date.now();
  const deduped = history.filter((entry) => entry.id !== id);
  const next = [{ id, ts: now }, ...deduped].slice(0, MAX_ENTRIES);
  history = next;
  scheduleWrite();
  emitChange();
}

export function clearHistory() {
  if (history.length === 0) return;
  history = [];
  scheduleWrite();
  emitChange();
}

export function useHistory(): readonly HistoryEntry[] {
  return React.useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getHistorySnapshot
  );
}
