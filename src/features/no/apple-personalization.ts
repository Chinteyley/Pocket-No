import { Platform } from 'react-native';
import { z } from 'zod';

import { createNoReason } from './catalog';
import { APPLE_PERSONALIZED_NO_REASON_SOURCE, type NoReason } from './contracts';

const personalizedReasonSchema = z.object({
  reason: z.string().trim().min(1).max(180),
});

const PERSONALIZATION_SYSTEM_PROMPT = `You write Pocket-No lines.

Return exactly one original line that sounds sharp, human, and copy-ready.
Keep it under 140 characters.
Do not use emojis, hashtags, or lists.
Do not explain yourself.
Do not mention Apple Intelligence, AI, or personalization.
Make the line feel lightly witty, not corny.`;

function createPersonalizationUnavailableError() {
  return new Error('Apple Intelligence is not available on this device.');
}

function createVoicePersonalizationUnavailableError() {
  return new Error('Voice personalization is not available on this device.');
}

export function normalizePersonalizationInput(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizePersonalizationTranscript(value: string) {
  const normalizedValue = normalizePersonalizationInput(value);

  if (!normalizedValue) {
    throw new Error('Could not hear enough to personalize that no.');
  }

  return normalizedValue;
}

export function normalizeGeneratedPersonalizedReason(value: string) {
  const collapsedValue = value.trim().replace(/\s+/g, ' ');
  const withoutQuotes = collapsedValue.replace(/^["'“”]+|["'“”]+$/g, '');
  const normalizedValue = withoutQuotes.trim();

  if (!normalizedValue) {
    throw new Error('Apple Intelligence returned an empty personalized reason.');
  }

  return normalizedValue;
}

export async function isApplePersonalizationAvailable() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    const { apple } = await import('@react-native-ai/apple');
    return apple.isAvailable();
  } catch (error) {
    console.warn('Failed to check Apple Intelligence availability', error);
    return false;
  }
}

export async function isAppleVoicePersonalizationAvailable() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    const { apple } = await import('@react-native-ai/apple');

    if (!apple.isAvailable()) {
      return false;
    }

    await apple.transcriptionModel().prepare();
    return true;
  } catch (error) {
    console.warn('Failed to check Apple voice personalization availability', error);
    return false;
  }
}

export async function transcribePersonalizationAudioFile(fileUri: string) {
  if (Platform.OS !== 'ios') {
    throw createVoicePersonalizationUnavailableError();
  }

  const [{ apple }, { experimental_transcribe: transcribe }, { File }] = await Promise.all([
    import('@react-native-ai/apple'),
    import('ai'),
    import('expo-file-system'),
  ]);

  if (!apple.isAvailable()) {
    throw createVoicePersonalizationUnavailableError();
  }

  const audioFile = new File(fileUri);
  const transcript = await transcribe({
    model: apple.transcriptionModel(),
    audio: await audioFile.arrayBuffer(),
  });

  return normalizePersonalizationTranscript(transcript.text);
}

export async function generatePersonalizedNoFromAudioFile(fileUri: string) {
  const transcript = await transcribePersonalizationAudioFile(fileUri);
  return {
    transcript,
    reason: await generatePersonalizedNo(transcript),
  };
}

export async function generatePersonalizedNo(input: string): Promise<NoReason> {
  if (Platform.OS !== 'ios') {
    throw createPersonalizationUnavailableError();
  }

  const normalizedInput = normalizePersonalizationInput(input);
  if (!normalizedInput) {
    throw new Error('Tell Pocket-No what you need to say no to first.');
  }

  const [{ apple }, { generateObject }] = await Promise.all([
    import('@react-native-ai/apple'),
    import('ai'),
  ]);

  if (!apple.isAvailable()) {
    throw createPersonalizationUnavailableError();
  }

  const result = await generateObject({
    model: apple(),
    schema: personalizedReasonSchema,
    system: PERSONALIZATION_SYSTEM_PROMPT,
    prompt: `Context: ${normalizedInput}`,
    temperature: 0.65,
    maxOutputTokens: 80,
    topP: 0.9,
  });

  const text = normalizeGeneratedPersonalizedReason(result.object.reason);

  return createNoReason({
    id: `apple-personalized-${Date.now()}`,
    text,
    source: APPLE_PERSONALIZED_NO_REASON_SOURCE,
  });
}
