import { getRandomNoReason } from './catalog';
import { isNoReasonSource, type NoReason } from './contracts';

export type NoReasonDelivery = 'api' | 'fallback';
export const NO_REASON_API_TIMEOUT_MS = 4000;

export type FetchFreshNoReasonResult = {
  reason: NoReason;
  delivery: NoReasonDelivery;
  errorMessage?: string;
};

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

function normalizeApiBase(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return '';
  }

  return trimmedValue.replace(/\/+$/, '');
}

function getApiBase() {
  return normalizeApiBase(process.env.EXPO_PUBLIC_SITE_ORIGIN) || '';
}

function buildRequestTimeoutError() {
  return new Error(`No API request timed out after ${NO_REASON_API_TIMEOUT_MS}ms`);
}

async function fetchNoReasonResponse(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(buildRequestTimeoutError());
  }, NO_REASON_API_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw controller.signal.reason instanceof Error
        ? controller.signal.reason
        : buildRequestTimeoutError();
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildFallbackResult(errorMessage: string): FetchFreshNoReasonResult {
  console.warn('Falling back to bundled no catalog', errorMessage);

  return {
    reason: getRandomNoReason(),
    delivery: 'fallback',
    errorMessage,
  };
}

export async function fetchFreshNoReason(): Promise<FetchFreshNoReasonResult> {
  const apiBase = getApiBase();

  try {
    const response = await fetchNoReasonResponse(`${apiBase}/api/no`);

    if (!response.ok) {
      throw new Error(`No API returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isNoReason(payload)) {
      return buildFallbackResult('No API returned an invalid payload');
    }

    return {
      reason: payload,
      delivery: 'api',
    };
  } catch (error) {
    return buildFallbackResult(error instanceof Error ? error.message : 'No API request failed');
  }
}
