import { Image } from 'expo-image';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

type TabSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
};

type TabCardGroupProps = {
  children: React.ReactNode;
};

type TabCardRowProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: SFSymbol;
  trailing?: React.ReactNode;
  destructive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

type TabStatPillProps = {
  label: string;
};

type TabEmptyStateProps = {
  icon: SFSymbol;
  title: string;
  description: string;
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  onActionPress?: () => void;
};

type TabFallbackHeaderProps = {
  title: string;
  subtitle: string;
};

export function useTabScreenColors() {
  return {
    paperColor: (useCSSVariable('--color-paper') as string) ?? '#ffffff',
    surfaceColor: (useCSSVariable('--color-surface') as string) ?? '#ffffff',
    surfaceMutedColor: (useCSSVariable('--color-surface-muted') as string) ?? '#f5f5f5',
    warmSurfaceColor: (useCSSVariable('--color-warm-surface') as string) ?? '#fff7ef',
    inkColor: (useCSSVariable('--color-ink') as string) ?? '#111111',
    subtleInkColor: (useCSSVariable('--color-subtle-ink') as string) ?? '#555555',
    accentColor: (useCSSVariable('--color-accent') as string) ?? '#e86c2f',
    accentWashColor: (useCSSVariable('--color-accent-wash') as string) ?? '#fde8d8',
    outlineColor: (useCSSVariable('--color-outline') as string) ?? 'rgba(0,0,0,0.08)',
    shadowSoftColor:
      (useCSSVariable('--color-shadow-soft') as string) ?? 'rgba(0, 0, 0, 0.06)',
  };
}

export function TabFallbackHeader({ title, subtitle }: TabFallbackHeaderProps) {
  const { warmSurfaceColor, outlineColor, inkColor, subtleInkColor } = useTabScreenColors();

  return (
    <View
      style={{
        backgroundColor: warmSurfaceColor,
        borderBottomWidth: 1,
        borderBottomColor: outlineColor,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
      }}>
      <Text
        className="text-[32px] leading-[36px] font-extrabold tracking-[-1px]"
        style={{ color: inkColor }}>
        {title}
      </Text>
      <Text
        className="mt-1 text-[14px] font-semibold tracking-[-0.1px]"
        style={{ color: subtleInkColor }}>
        {subtitle}
      </Text>
    </View>
  );
}

export function TabSectionHeader({
  title,
  actionLabel,
  onActionPress,
  actionAccessibilityLabel,
}: TabSectionHeaderProps) {
  const { subtleInkColor, accentColor } = useTabScreenColors();

  return (
    <View
      style={{
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
      <Text
        className="text-[12px] font-bold uppercase tracking-[1.2px]"
        style={{ color: subtleInkColor }}>
        {title}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          hitSlop={10}
          onPress={onActionPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.55 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}>
          <Text
            className="text-[12px] font-bold uppercase tracking-[1px]"
            style={{ color: accentColor }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function TabCardGroup({ children }: TabCardGroupProps) {
  const { surfaceColor, outlineColor, shadowSoftColor } = useTabScreenColors();

  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: surfaceColor,
        borderRadius: 24,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: outlineColor,
        overflow: 'hidden',
        boxShadow: `0 12px 28px ${shadowSoftColor}`,
      }}>
      {children}
    </View>
  );
}

export function TabCardRow({
  title,
  subtitle,
  leadingIcon,
  trailing,
  destructive = false,
  selected = false,
  disabled = false,
  isLast = false,
  onPress,
  accessibilityLabel,
}: TabCardRowProps) {
  const { inkColor, subtleInkColor, accentColor, accentWashColor, outlineColor } =
    useTabScreenColors();
  const labelColor = destructive ? accentColor : inkColor;
  const iconTintColor = destructive ? accentColor : selected ? accentColor : subtleInkColor;
  const rowBackgroundColor = selected ? accentWashColor : 'transparent';

  const content = (pressed: boolean) => (
    <View
      style={{
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: rowBackgroundColor,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: outlineColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      }}>
      {leadingIcon ? (
        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
          {Platform.OS === 'ios' ? (
            <Image
              contentFit="contain"
              source={`sf:${leadingIcon}`}
              style={{ width: 20, height: 20 }}
              tintColor={iconTintColor}
            />
          ) : (
            <SymbolView name={leadingIcon} size={20} tintColor={iconTintColor} weight="semibold" />
          )}
        </View>
      ) : null}
      <View style={{ flex: 1, gap: subtitle ? 3 : 0 }}>
        <Text
          className="text-[16px] font-semibold tracking-[-0.25px]"
          style={{ color: labelColor }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[13px] leading-[18px]" style={{ color: subtleInkColor }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={{ marginLeft: 8 }}>{trailing}</View> : null}
    </View>
  );

  if (!onPress) {
    return content(false);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

export function TabStatPill({ label }: TabStatPillProps) {
  const { surfaceMutedColor, subtleInkColor, outlineColor } = useTabScreenColors();

  return (
    <View
      style={{
        backgroundColor: surfaceMutedColor,
        borderWidth: 1,
        borderColor: outlineColor,
        borderRadius: 999,
        borderCurve: 'continuous',
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}>
      <Text
        className="text-[12px] font-semibold tracking-[-0.08px]"
        style={{ color: subtleInkColor, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </View>
  );
}

export function TabEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionAccessibilityLabel,
  onActionPress,
}: TabEmptyStateProps) {
  const { inkColor, subtleInkColor, surfaceMutedColor, outlineColor } = useTabScreenColors();

  return (
    <View style={{ paddingHorizontal: 28, paddingVertical: 56, gap: 12, alignItems: 'center' }}>
      {Platform.OS === 'ios' ? (
        <Image
          contentFit="contain"
          source={`sf:${icon}`}
          style={{ width: 42, height: 42, opacity: 0.5 }}
          tintColor={subtleInkColor}
        />
      ) : (
        <SymbolView name={icon} size={42} tintColor={subtleInkColor} weight="semibold" />
      )}
      <Text
        className="text-[22px] leading-[28px] font-extrabold tracking-[-0.6px] text-center"
        style={{ color: inkColor }}>
        {title}
      </Text>
      <Text
        className="text-[15px] leading-[22px] text-center"
        style={{ color: subtleInkColor, maxWidth: 300 }}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          onPress={onActionPress}
          style={({ pressed }) => ({
            marginTop: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: surfaceMutedColor,
            borderWidth: 1,
            borderColor: outlineColor,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}>
          <Text className="text-[14px] font-bold tracking-[-0.1px]" style={{ color: inkColor }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
