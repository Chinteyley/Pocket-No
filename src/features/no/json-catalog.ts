import reasonLinesJson from '../../../reason.json';

import { createNoReason, getRandomNoReason } from './catalog';
import { JSON_CATALOG_NO_REASON_SOURCE, type NoReason } from './contracts';

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

  const reasonLines = [...uniqueReasonLines];
  if (reasonLines.length === 0) {
    throw new Error('Local reason catalog was empty');
  }

  return reasonLines;
}

const localReasonLines = normalizeReasonLines(reasonLinesJson);

export async function fetchJsonCatalogNoReason(): Promise<NoReason> {
  try {
    const index = Math.floor(Math.random() * localReasonLines.length);
    const text = localReasonLines[index] ?? localReasonLines[0];

    return createNoReason({
      id: `json-catalog-${index + 1}`,
      text,
      source: JSON_CATALOG_NO_REASON_SOURCE,
    });
  } catch (error) {
    console.warn('Failed to load local reason catalog', error);
    return getRandomNoReason();
  }
}
