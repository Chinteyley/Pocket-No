import reasonLinesJson from '../../../reason.json';

import { createNoReason } from './catalog';
import { JSON_CATALOG_NO_REASON_SOURCE, type NoReason } from './contracts';

export type ReasonEntry = {
  id: string;
  text: string;
  index: number;
};

function normalizeReasonLines(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    throw new Error('Local reason catalog must be an array');
  }

  const uniqueReasonLines = new Set<string>();

  for (const entry of payload) {
    if (typeof entry !== 'string') {
      continue;
    }

    const normalizedEntry = entry.trim();
    if (normalizedEntry.length === 0) {
      continue;
    }

    uniqueReasonLines.add(normalizedEntry);
  }

  return [...uniqueReasonLines];
}

const reasonLines = normalizeReasonLines(reasonLinesJson);

function buildEntry(text: string, index: number): ReasonEntry {
  return {
    id: `json-catalog-${index + 1}`,
    text,
    index,
  };
}

export const allReasons: ReasonEntry[] = reasonLines.map(buildEntry);

const reasonById = new Map<string, ReasonEntry>();
for (const entry of allReasons) {
  reasonById.set(entry.id, entry);
}

export function getReasonById(id: string): ReasonEntry | null {
  return reasonById.get(id) ?? null;
}

export function reasonEntryToNoReason(entry: ReasonEntry): NoReason {
  return createNoReason({
    id: entry.id,
    text: entry.text,
    source: JSON_CATALOG_NO_REASON_SOURCE,
  });
}

export function searchReasons(query: string): ReasonEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return allReasons;
  }

  const results: ReasonEntry[] = [];
  for (const entry of allReasons) {
    if (entry.text.toLowerCase().includes(needle)) {
      results.push(entry);
    }
  }
  return results;
}
