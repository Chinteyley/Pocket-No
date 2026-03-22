import { getRandomNoReason } from './catalog';
import { isNoReasonSource, type NoReason } from './contracts';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNoReason(value: unknown): value is NoReason {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.copiedText === 'string' &&
    isNoReasonSource(value.source)
  );
}

export async function fetchFreshNoReason(): Promise<NoReason> {
  try {
    const response = await fetch('/api/no', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`No API returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isNoReason(payload)) {
      throw new Error('No API returned an invalid payload');
    }

    return payload;
  } catch {
    return getRandomNoReason();
  }
}
