import { router, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonalizeComposer } from '@/components/no/personalize-composer';
import {
  generatePersonalizedNo,
  isApplePersonalizationAvailable,
  normalizePersonalizationInput,
} from '@/features/no/apple-personalization';
import { setPersonalizedNoReason } from '@/features/no/personalized-reason-store';
import { useMountEffect } from '@/hooks/useMountEffect';

const PERSONALIZATION_INPUT_MAX_LENGTH = 140;

export default function PersonalizeScreen() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = React.useState('');
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<TextInput>(null);

  const loadAvailability = React.useEffectEvent(async () => {
    const nextAvailability = await isApplePersonalizationAvailable();
    React.startTransition(() => setIsAvailable(nextAvailability));
  });

  const handleSubmit = React.useEffectEvent(async () => {
    const normalizedInput = normalizePersonalizationInput(inputValue);
    if (!normalizedInput) {
      setErrorMessage('Add a little context first.');
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const reason = await generatePersonalizedNo(normalizedInput);
      setPersonalizedNoReason(reason);
      router.back();
    } catch (error) {
      console.warn('Failed to generate personalized no reason', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not generate a personalized no right now.'
      );
    } finally {
      setBusy(false);
    }
  });

  useMountEffect(() => {
    void loadAvailability();
  });

  const canSubmit =
    !busy &&
    isAvailable === true &&
    normalizePersonalizationInput(inputValue).length > 0;
  const noteMessage =
    isAvailable === false
      ? 'Apple Intelligence is not available right now on this device.'
      : isAvailable === null
        ? 'Checking Apple Intelligence availability…'
        : null;

  return (
    <View className="flex-1 bg-paper">
      <Stack.Screen options={{ title: 'Personalize' }} />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-paper"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}>
        <PersonalizeComposer
          autoFocus
          errorMessage={errorMessage}
          inputRef={inputRef}
          maxLength={PERSONALIZATION_INPUT_MAX_LENGTH}
          noteMessage={noteMessage}
          onChangeText={(nextValue) => {
            setInputValue(nextValue);
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          onClose={() => router.back()}
          onSubmit={() => void handleSubmit()}
          submitBusy={busy}
          submitDisabled={!canSubmit}
          submitSymbol={busy ? 'sparkles' : 'arrow.up'}
          value={inputValue}
        />
      </ScrollView>
    </View>
  );
}
