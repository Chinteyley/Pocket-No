import { NO_REASON_SOURCE } from '../contracts';
import { fetchFreshNoReason, NO_REASON_API_TIMEOUT_MS } from '../no-reason-api';

const originalFetch = global.fetch;
const originalSiteOrigin = process.env.EXPO_PUBLIC_SITE_ORIGIN;

describe('fetchFreshNoReason', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    process.env.EXPO_PUBLIC_SITE_ORIGIN = originalSiteOrigin;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns API delivery for a valid payload', async () => {
    const reason = {
      id: 'api-1',
      text: 'No thank you.',
      copiedText: 'No thank you.',
      source: 'json-catalog' as const,
    };

    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(reason), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    await expect(fetchFreshNoReason()).resolves.toEqual({
      reason,
      delivery: 'api',
    });
  });

  it('accepts legacy remote catalog payloads from older API origins', async () => {
    const reason = {
      id: 'remote-catalog-162',
      text: 'My evil twin might be interested; too bad they are busy too.',
      copiedText: 'My evil twin might be interested; too bad they are busy too.',
      source: 'remote-catalog' as const,
    };

    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(reason), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    await expect(fetchFreshNoReason()).resolves.toEqual({
      reason,
      delivery: 'api',
    });
  });

  it('uses the site origin as the API base', async () => {
    process.env.EXPO_PUBLIC_SITE_ORIGIN = 'https://pocketno.example.com/';

    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'api-1',
          text: 'No thank you.',
          copiedText: 'No thank you.',
          source: 'json-catalog',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    await fetchFreshNoReason();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://pocketno.example.com/api/no',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
      })
    );
  });

  it('falls back when the API responds with a non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(null, {
        status: 503,
      })
    );

    const result = await fetchFreshNoReason();

    expect(result.delivery).toBe('fallback');
    expect(result.reason.source).toBe(NO_REASON_SOURCE);
    expect(result.reason.id).toMatch(/^catalog-\d+$/);
    expect(result.errorMessage).toContain('503');
  });

  it('falls back when the API payload is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ nope: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const result = await fetchFreshNoReason();

    expect(result.delivery).toBe('fallback');
    expect(result.reason.source).toBe(NO_REASON_SOURCE);
    expect(result.reason.text.length).toBeGreaterThan(0);
    expect(result.errorMessage).toBe('No API returned an invalid payload');
  });

  it('falls back when the API request times out', async () => {
    jest.useFakeTimers();

    global.fetch = jest.fn((_input, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason);
        });
      });
    });

    const resultPromise = fetchFreshNoReason();

    await jest.advanceTimersByTimeAsync(NO_REASON_API_TIMEOUT_MS);

    const result = await resultPromise;

    expect(result.delivery).toBe('fallback');
    expect(result.reason.source).toBe(NO_REASON_SOURCE);
    expect(result.errorMessage).toContain(`timed out after ${NO_REASON_API_TIMEOUT_MS}ms`);
  });
});
