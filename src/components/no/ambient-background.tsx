import React from 'react';
import { View } from 'react-native';

import { noPalette } from '@/features/no/theme';

export function AmbientBackground() {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -110,
          right: -30,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: noPalette.accentWash,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -90,
          bottom: 120,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: '#f8d7be',
          opacity: 0.8,
        }}
      />
    </>
  );
}
