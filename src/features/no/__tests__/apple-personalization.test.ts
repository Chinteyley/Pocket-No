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

describe('apple voice personalization preparation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('reuses the prepared transcription model between availability and transcription', async () => {
    jest.resetModules();

    const prepare = jest.fn().mockResolvedValue(undefined);
    const model = { prepare };
    const transcriptionModel = jest.fn(() => model);
    const isAvailable = jest.fn(() => true);
    const arrayBuffer = new ArrayBuffer(8);
    const fileArrayBuffer = jest.fn().mockResolvedValue(arrayBuffer);
    const File = jest.fn(() => ({ arrayBuffer: fileArrayBuffer }));
    const transcribe = jest.fn().mockResolvedValue({
      text: '  tell them no  ',
    });

    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));

    const {
      applePersonalizationDependencies,
      isAppleVoicePersonalizationAvailable,
      transcribePersonalizationAudioFile,
    } = require('../apple-personalization');

    applePersonalizationDependencies.loadAppleModule = jest.fn().mockResolvedValue({
      apple: {
        isAvailable,
        transcriptionModel,
      },
    });
    applePersonalizationDependencies.loadAiModule = jest.fn().mockResolvedValue({
      experimental_transcribe: transcribe,
    });
    applePersonalizationDependencies.loadExpoFileSystemModule = jest.fn().mockResolvedValue({
      File,
    });

    await expect(isAppleVoicePersonalizationAvailable()).resolves.toBe(true);
    await expect(
      transcribePersonalizationAudioFile('file:///tmp/personalize.m4a')
    ).resolves.toBe('tell them no');

    expect(isAvailable).toHaveBeenCalledTimes(2);
    expect(transcriptionModel).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(File).toHaveBeenCalledWith('file:///tmp/personalize.m4a');
    expect(fileArrayBuffer).toHaveBeenCalledTimes(1);
    expect(transcribe).toHaveBeenCalledWith({
      model,
      audio: arrayBuffer,
    });
  });

  it('continues to use apple() directly for text personalization', async () => {
    jest.resetModules();

    const appleLanguageModel = {};
    const apple = Object.assign(jest.fn(() => appleLanguageModel), {
      isAvailable: jest.fn(() => true),
      transcriptionModel: jest.fn(),
    });
    const generateObject = jest.fn().mockResolvedValue({
      object: { reason: '  "Hard pass."  ' },
    });

    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(123);
    const {
      applePersonalizationDependencies,
      generatePersonalizedNo,
    } = require('../apple-personalization');

    applePersonalizationDependencies.loadAppleModule = jest.fn().mockResolvedValue({
      apple,
    });
    applePersonalizationDependencies.loadAiModule = jest.fn().mockResolvedValue({
      generateObject,
    });

    await expect(generatePersonalizedNo('  dinner tonight  ')).resolves.toMatchObject({
      id: 'apple-personalized-123',
      text: 'Hard pass.',
      source: 'apple-personalized',
    });

    expect(apple).toHaveBeenCalledTimes(1);
    expect(apple.transcriptionModel).not.toHaveBeenCalled();
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: appleLanguageModel,
        prompt: 'Context: dinner tonight',
      })
    );

    nowSpy.mockRestore();
  });
});
