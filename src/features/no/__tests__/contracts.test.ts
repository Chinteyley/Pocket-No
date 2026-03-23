import { isNoReasonSource } from '../contracts';

describe('isNoReasonSource', () => {
  it('returns true for valid sources', () => {
    expect(isNoReasonSource('catalog')).toBe(true);
    expect(isNoReasonSource('remote-catalog')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isNoReasonSource('unknown')).toBe(false);
    expect(isNoReasonSource(42)).toBe(false);
    expect(isNoReasonSource(null)).toBe(false);
  });
});
