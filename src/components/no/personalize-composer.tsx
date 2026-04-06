import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

type PersonalizeComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  submitDisabled: boolean;
  submitBusy?: boolean;
  submitSymbol?: SFSymbol;
  onVoicePress?: () => void;
  voiceSymbol?: SFSymbol;
  voiceLabel?: string;
  voiceErrorMessage?: string | null;
  errorMessage?: string | null;
  maxLength?: number;
  inputRef?: React.RefObject<TextInput | null>;
  autoFocus?: boolean;
  onClose?: () => void;
};

export function PersonalizeComposer({
  value,
  onChangeText,
  onSubmit,
  submitDisabled,
  submitBusy = false,
  submitSymbol = 'arrow.up',
  onVoicePress,
  voiceSymbol = 'mic.fill',
  voiceLabel = 'Voice',
  voiceErrorMessage,
  errorMessage,
  maxLength = 140,
  inputRef,
  autoFocus = false,
  onClose,
}: PersonalizeComposerProps) {
  const inkColor = useCSSVariable('--color-ink') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const accentColor = useCSSVariable('--color-accent') as string;
  const accentWashColor = useCSSVariable('--color-accent-wash') as string;
  const surfaceColor = useCSSVariable('--color-surface') as string;
  const surfaceMutedColor = useCSSVariable('--color-surface-muted') as string;
  const buttonPrimaryTextColor = useCSSVariable('--color-button-primary-text') as string;

  const canUseVoice = typeof onVoicePress === 'function';

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text selectable className="text-[15px] font-bold tracking-[-0.2px] text-ink">
          Personalize
        </Text>

        {onClose ? (
          <Pressable
            accessibilityLabel="Close personalized no composer"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <View
              className="size-9 items-center justify-center rounded-full border"
              style={{
                backgroundColor: surfaceMutedColor,
                borderColor: outlineColor,
              }}>
              <SymbolView name="xmark" size={15} tintColor={inkColor} weight="semibold" />
            </View>
          </Pressable>
        ) : null}
      </View>

      <View
        className="rounded-[28px] border px-4 pt-4 pb-3"
        style={{
          backgroundColor: surfaceColor,
          borderColor: outlineColor,
          borderCurve: 'continuous',
        }}>
        <TextInput
          ref={inputRef}
          autoFocus={autoFocus}
          editable={!submitBusy}
          maxLength={maxLength}
          multiline
          numberOfLines={4}
          onChangeText={onChangeText}
          placeholder="What are you saying no to?"
          placeholderTextColor={subtleInkColor}
          selectionColor={accentColor}
          style={{
            flex: 1,
            minHeight: 110,
            maxHeight: 164,
            color: inkColor,
            fontSize: 19,
            lineHeight: 28,
            fontWeight: '700',
            textAlignVertical: 'top',
            paddingTop: 0,
            paddingBottom: 0,
          }}
          value={value}
        />

        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-row items-center gap-2">
            {canUseVoice ? (
              <Pressable
                accessibilityLabel={voiceErrorMessage ?? voiceLabel}
                accessibilityRole="button"
                onPress={onVoicePress}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}>
                <View
                  className="size-11 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: voiceErrorMessage ? accentWashColor : surfaceMutedColor,
                    borderCurve: 'continuous',
                  }}>
                  <SymbolView
                    name={voiceSymbol}
                    size={voiceErrorMessage ? 14 : 18}
                    tintColor={voiceErrorMessage ? accentColor : subtleInkColor}
                    weight="semibold"
                  />
                </View>
              </Pressable>
            ) : null}

            {canUseVoice && voiceLabel ? (
              <Text
                selectable
                className="text-[13px] font-semibold"
                style={{
                  color: voiceErrorMessage ? accentColor : subtleInkColor,
                  fontVariant: ['tabular-nums'],
                }}>
                {voiceLabel}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center gap-3">
            {value.length > 0 ? (
              <Text
                selectable
                className="text-[13px] leading-[18px] text-muted"
                style={{ fontVariant: ['tabular-nums'] }}>
                {value.length}/{maxLength}
              </Text>
            ) : null}

            <Pressable
              accessibilityLabel={submitBusy ? 'Generating personalized no' : 'Generate personalized no'}
              accessibilityRole="button"
              disabled={submitDisabled}
              onPress={onSubmit}
              style={({ pressed }) => ({
                opacity: submitDisabled ? 0.5 : 1,
                transform: [{ scale: pressed && !submitDisabled ? 0.92 : 1 }],
              })}>
              <View
                className="size-11 items-center justify-center rounded-full"
                style={{
                  backgroundColor: accentColor,
                  borderCurve: 'continuous',
                  boxShadow: '0 14px 32px rgba(0,0,0,0.12)',
                }}>
                <SymbolView
                  name={submitSymbol}
                  size={18}
                  tintColor={buttonPrimaryTextColor}
                  weight="semibold"
                />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {errorMessage ? (
        <View
          className="rounded-[22px] px-4 py-3"
          style={{
            backgroundColor: accentWashColor,
            borderCurve: 'continuous',
          }}>
          <Text selectable className="text-[14px] leading-[21px] text-ink">
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
