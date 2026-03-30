import {
  normalizeGeneratedPersonalizedReason,
  normalizePersonalizationInput,
  normalizePersonalizationTranscript,
} from '../apple-personalization';

describe('apple personalization helpers', () => {
  it('normalizes user input whitespace', () => {
    expect(normalizePersonalizationInput('  last-minute   dinner plan  ')).toBe(
      'last-minute dinner plan'
    );
  });

  it('normalizes generated lines and strips wrapping quotes', () => {
    expect(
      normalizeGeneratedPersonalizedReason('  "I already promised tonight to someone less social: me."  ')
    ).toBe('I already promised tonight to someone less social: me.');
  });

  it('normalizes transcript whitespace before reuse as personalization context', () => {
    expect(
      normalizePersonalizationTranscript('  can you cover  this  dinner  tomorrow  ')
    ).toBe('can you cover this dinner tomorrow');
  });

  it('throws when the transcript is empty after normalization', () => {
    expect(() => normalizePersonalizationTranscript('   \n\t   ')).toThrow(
      'Could not hear enough to personalize that no.'
    );
  });

  it('throws when the generated line is empty after normalization', () => {
    expect(() => normalizeGeneratedPersonalizedReason('   ""   ')).toThrow(
      'Apple Intelligence returned an empty personalized reason.'
    );
  });
});
