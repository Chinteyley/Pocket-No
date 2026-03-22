import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Matrix dot-grid with alpha-based clear zone.
// Inside text area: transparent (text shows through).
// During fill transition: floods opaque, covering text.
const SKSL = `
uniform float2 u_resolution;
uniform float  u_time;
uniform float  u_text_cy;
uniform float  u_text_ry;
uniform float  u_text_rx;
uniform float  u_fill;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

half4 main(float2 xy) {
  float t        = u_time * 0.001;
  float cellSize = u_resolution.x / 26.0;

  float2 cell   = floor(xy / cellSize);
  float2 cellUV = fract(xy / cellSize);

  float active = step(0.25, hash(cell + float2(21.3, 5.7)));
  float freq   = 0.15 + hash(cell)                    * 0.55;
  float phase  = hash(cell + float2(7.3, 2.1))        * 6.283;
  float peak   = 0.20 + hash(cell + float2(3.7, 9.1)) * 0.55;

  float blink = 0.5 + 0.5 * sin(t * freq * 6.283 + phase);
  blink = pow(blink, 2.0);

  float2 d       = abs(cellUV - 0.5);
  float  dotMask = step(max(d.x, d.y), 0.16);

  float2 uv         = xy / u_resolution;
  float2 offset     = (uv - float2(0.5, u_text_cy)) / float2(u_text_rx, u_text_ry);
  // 0 inside text area, 1 outside
  float  revealBase = smoothstep(0.85, 1.2, length(offset));
  // During fill, revealBase → 1 everywhere (floods text area)
  float  reveal     = mix(revealBase, 1.0, u_fill);

  half3 bg  = half3(1.000, 0.973, 0.941);
  half3 fg  = half3(0.910, 0.424, 0.184);
  float dot = dotMask * blink * peak * active;
  half3 col = mix(bg, fg, dot);

  // alpha = reveal: transparent in text area (text shows through),
  // opaque outside, and fully opaque everywhere when u_fill=1.
  float alpha = reveal;
  return half4(col * alpha, alpha);
}
`;

type Props = {
  textCy: SharedValue<number>;
  textRy: SharedValue<number>;
  textRx: SharedValue<number>;
  textFill: SharedValue<number>;
};

export function AmbientBackground({ textCy, textRy, textRx, textFill }: Props) {
  const { width, height } = useWindowDimensions();
  const clock = useSharedValue(0);

  const effect = useMemo(() => Skia.RuntimeEffect.Make(SKSL), []);

  useEffect(() => {
    clock.value = withTiming(1e9, { duration: 1e9, easing: Easing.linear });
  }, [clock]);

  const uniforms = useDerivedValue(() => ({
    u_resolution: [width, height] as [number, number],
    u_time:    clock.value,
    u_text_cy: textCy.value,
    u_text_ry: textRy.value,
    u_text_rx: textRx.value,
    u_fill:    textFill.value,
  }));

  if (!effect) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}
