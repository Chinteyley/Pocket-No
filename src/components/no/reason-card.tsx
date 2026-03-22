import React from 'react';
import { Text, View } from 'react-native';

import type { NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';

type ReasonCardProps = {
  reason: NoReason | null;
  eyebrow: string;
  footer: string;
};

export function ReasonCard({ reason, eyebrow, footer }: ReasonCardProps) {
  return (
    <View
      style={{
        gap: 16,
        borderRadius: 30,
        padding: 22,
        backgroundColor: noPalette.surface,
        borderWidth: 1,
        borderColor: noPalette.outline,
        boxShadow: `0 22px 48px ${noPalette.shadowSoft}`,
      }}>
      <Text
        selectable
        style={{
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: noPalette.muted,
        }}>
        {eyebrow}
      </Text>

      <Text
        selectable
        style={{
          fontSize: reason ? 30 : 22,
          lineHeight: reason ? 38 : 30,
          fontWeight: '900',
          letterSpacing: -1,
          color: noPalette.ink,
        }}>
        {reason?.text ?? 'Composing a respectable refusal.'}
      </Text>

      <View
        style={{
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: noPalette.surfaceMuted,
          borderWidth: 1,
          borderColor: noPalette.outline,
        }}>
        <Text
          selectable
          style={{
            fontSize: 14,
            lineHeight: 21,
            color: noPalette.subtleInk,
          }}>
          {footer}
        </Text>
      </View>
    </View>
  );
}
