import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';

import type { NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';

type ReasonCardProps = {
  reason: NoReason | null;
  showCopied: boolean;
};

export function ReasonCard({ reason, showCopied }: ReasonCardProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 20,
      }}>
      <Animated.Text
        key={reason?.text ?? 'empty'}
        entering={FadeIn.duration(400)}
        selectable
        style={{
          fontSize: reason ? 32 : 24,
          lineHeight: reason ? 42 : 32,
          fontWeight: '800',
          letterSpacing: -1.2,
          color: reason ? noPalette.ink : noPalette.muted,
          textAlign: 'center',
        }}>
        {reason?.text ?? '—'}
      </Animated.Text>

      {showCopied && (
        <Animated.View
          entering={ZoomIn.springify().damping(14)}
          exiting={FadeOut.duration(300)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: noPalette.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source="sf:checkmark"
            style={{ width: 18, height: 18, tintColor: '#ffffff' }}
          />
        </Animated.View>
      )}
    </View>
  );
}
