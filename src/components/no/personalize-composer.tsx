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
  voiceDisabled?: boolean;
  voiceLabel?: string;
  voiceHint?: string;
  voiceSymbol?: SFSymbol;
  errorMessage?: string | null;
  noteMessage?: string | null;
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
  voiceDisabled = false,
  voiceLabel = 'Record voice',
  voiceHint = 'Talk it out and Pocket-No will turn it into a sharper no.',
  voiceSymbol = 'mic.fill',
  errorMessage,
  noteMessage,
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
  const buttonSecondaryBorderColor = useCSSVariable('--color-button-secondary-border') as string;

  const canUseVoice = typeof onVoicePress === 'function';

  return (
    <View className="gap-3">
      <View className="flex-row items-start justify-between gap-3 px-1">
        <View className="flex-1 gap-1">
          <Text selectable className="text-[15px] font-bold tracking-[-0.2px] text-ink">
            Make it more personal
          </Text>
          <Text selectable className="text-[13px] leading-[19px] text-subtle-ink">
            Add a little context or say it out loud. Pocket-No will write one sharper line
            on-device.
          </Text>
        </View>

        {onClose ? (
          <Pressable
            accessibilityLabel="Close personalized no composer"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
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
        <Text
          selectable
          className="text-[11px] font-bold uppercase tracking-[1px] text-muted">
          What are you saying no to?
        </Text>

        <View className="flex-row items-end gap-3 pt-3">
          <TextInput
            ref={inputRef}
            autoFocus={autoFocus}
            editable={!submitBusy}
            maxLength={maxLength}
            multiline
            numberOfLines={4}
            onChangeText={onChangeText}
            placeholder="Team dinner, weekend favor, one more project, last-minute plan..."
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

          <Pressable
            accessibilityLabel={submitBusy ? 'Generating personalized no' : 'Generate personalized no'}
            accessibilityRole="button"
            disabled={submitDisabled}
            onPress={onSubmit}
            style={({ pressed }) => ({
              opacity: submitDisabled ? 0.5 : 1,
              transform: [{ scale: pressed && !submitDisabled ? 0.97 : 1 }],
            })}>
            <View
              className="size-12 items-center justify-center rounded-full"
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

        <View className="flex-row items-center justify-between pt-2">
          <Text selectable className="text-[13px] leading-[18px] text-subtle-ink">
            One line only. Keep it short.
          </Text>
          <Text
            selectable
            className="text-[13px] leading-[18px] text-muted"
            style={{ fontVariant: ['tabular-nums'] }}>
            {value.length}/{maxLength}
          </Text>
        </View>
      </View>

      {canUseVoice ? (
        <Pressable
          accessibilityLabel={voiceLabel}
          accessibilityRole="button"
          disabled={voiceDisabled}
          onPress={onVoicePress}
          style={({ pressed }) => ({
            opacity: voiceDisabled ? 0.55 : 1,
            transform: [{ scale: pressed && !voiceDisabled ? 0.98 : 1 }],
          })}>
          <View
            className="flex-row items-center gap-3 rounded-[26px] border px-4 py-3.5"
            style={{
              backgroundColor: voiceDisabled ? surfaceMutedColor : accentWashColor,
              borderColor: voiceDisabled ? buttonSecondaryBorderColor : 'transparent',
              borderCurve: 'continuous',
            }}>
            <View
              className="size-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: voiceDisabled ? surfaceColor : accentColor,
                borderCurve: 'continuous',
              }}>
              <SymbolView
                name={voiceSymbol}
                size={18}
                tintColor={voiceDisabled ? subtleInkColor : buttonPrimaryTextColor}
                weight="semibold"
              />
            </View>

            <View className="flex-1 gap-0.5">
              <Text selectable className="text-[15px] font-bold tracking-[-0.2px] text-ink">
                {voiceLabel}
              </Text>
              <Text selectable className="text-[13px] leading-[18px] text-subtle-ink">
                {voiceHint}
              </Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {noteMessage ? (
        <View
          className="rounded-[22px] px-4 py-3"
          style={{
            backgroundColor: surfaceMutedColor,
            borderCurve: 'continuous',
          }}>
          <Text selectable className="text-[14px] leading-[21px] text-subtle-ink">
            {noteMessage}
          </Text>
        </View>
      ) : null}

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
