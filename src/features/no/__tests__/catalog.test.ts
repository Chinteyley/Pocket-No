import { createNoReason, DEFAULT_NO_REASON, getRandomNoReason } from '../catalog';
import { NO_REASON_SOURCE, REMOTE_NO_REASON_SOURCE } from '../contracts';

describe('createNoReason', () => {
  it('returns a NoReason with default source', () => {
    const result = createNoReason({ id: 'test-1', text: 'No thanks' });

    expect(result).toEqual({
      id: 'test-1',
      text: 'No thanks',
      copiedText: 'No thanks',
      source: NO_REASON_SOURCE,
    });
  });

  it('accepts a custom source', () => {
    const result = createNoReason({
      id: 'test-2',
      text: 'Not today',
      source: REMOTE_NO_REASON_SOURCE,
    });

    expect(result.source).toBe(REMOTE_NO_REASON_SOURCE);
  });
});

describe('DEFAULT_NO_REASON', () => {
  it('has catalog source and a non-empty text', () => {
    expect(DEFAULT_NO_REASON.source).toBe(NO_REASON_SOURCE);
    expect(DEFAULT_NO_REASON.text.length).toBeGreaterThan(0);
    expect(DEFAULT_NO_REASON.id).toBe('catalog-1');
  });
});

describe('getRandomNoReason', () => {
  it('returns a valid NoReason', () => {
    const result = getRandomNoReason();

    expect(result.id).toMatch(/^catalog-\d+$/);
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.source).toBe(NO_REASON_SOURCE);
  });
});
