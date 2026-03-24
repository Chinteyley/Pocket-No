import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

import { useAmbientAnimationEnabled } from '@/hooks/useAmbientAnimationEnabled';
import { useMountEffect } from '@/hooks/useMountEffect';

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
uniform float3 u_bg;
uniform float3 u_fg;

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

  half3 bg  = half3(u_bg.x, u_bg.y, u_bg.z);
  half3 fg  = half3(u_fg.x, u_fg.y, u_fg.z);
  float dot = dotMask * blink * peak * active;
  half3 col = mix(bg, fg, dot);

  // alpha = reveal: transparent in text area (text shows through),
  // opaque outside, and fully opaque everywhere when u_fill=1.
  float alpha = reveal;
  return half4(col * alpha, alpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

type Props = {
  isScreenActive?: boolean;
  textCy?: SharedValue<number>;
  textRy?: SharedValue<number>;
  textRx?: SharedValue<number>;
  textFill?: SharedValue<number>;
};

type AmbientShaderProps = {
  bgRgb: [number, number, number];
  fgRgb: [number, number, number];
  effect: NonNullable<ReturnType<typeof Skia.RuntimeEffect.Make>>;
  height: number;
  width: number;
  cy: SharedValue<number>;
  ry: SharedValue<number>;
  rx: SharedValue<number>;
  fill: SharedValue<number>;
};

function AmbientShaderCanvas({
  effect,
  uniforms,
}: {
  effect: NonNullable<ReturnType<typeof Skia.RuntimeEffect.Make>>;
  uniforms: SharedValue<{
    u_resolution: [number, number];
    u_time: number;
    u_text_cy: number;
    u_text_ry: number;
    u_text_rx: number;
    u_fill: number;
    u_bg: [number, number, number];
    u_fg: [number, number, number];
  }>;
}) {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}

function StaticAmbientShader({
  bgRgb,
  effect,
  fgRgb,
  width,
  height,
  cy,
  ry,
  rx,
  fill,
}: AmbientShaderProps) {
  const uniforms = useDerivedValue(() => ({
    u_resolution: [width, height] as [number, number],
    u_time: 0,
    u_text_cy: cy.value,
    u_text_ry: ry.value,
    u_text_rx: rx.value,
    u_fill: fill.value,
    u_bg: bgRgb,
    u_fg: fgRgb,
  }));

  return <AmbientShaderCanvas effect={effect} uniforms={uniforms} />;
}

function AnimatedAmbientShader({
  bgRgb,
  effect,
  fgRgb,
  width,
  height,
  cy,
  ry,
  rx,
  fill,
}: AmbientShaderProps) {
  const clock = useSharedValue(0);

  useMountEffect(() => {
    clock.value = withTiming(1e9, { duration: 1e9, easing: Easing.linear });

    return () => {
      cancelAnimation(clock);
      clock.value = 0;
    };
  });

  const uniforms = useDerivedValue(() => ({
    u_resolution: [width, height] as [number, number],
    u_time: clock.value,
    u_text_cy: cy.value,
    u_text_ry: ry.value,
    u_text_rx: rx.value,
    u_fill: fill.value,
    u_bg: bgRgb,
    u_fg: fgRgb,
  }));

  return <AmbientShaderCanvas effect={effect} uniforms={uniforms} />;
}

export function AmbientBackground({
  isScreenActive = true,
  textCy,
  textRy,
  textRx,
  textFill,
}: Props) {
  const warmSurface = (useCSSVariable('--color-warm-surface') as string) ?? '#fff7ef';
  const accent = (useCSSVariable('--color-accent') as string) ?? '#e86c2f';
  const shouldAnimate = useAmbientAnimationEnabled(isScreenActive);

  const bgRgb = useMemo(() => hexToRgb(warmSurface), [warmSurface]);
  const fgRgb = useMemo(() => hexToRgb(accent), [accent]);

  const defaultCy = useSharedValue(0);
  const defaultRy = useSharedValue(0);
  const defaultRx = useSharedValue(0);
  const defaultFill = useSharedValue(1);

  const cy = textCy ?? defaultCy;
  const ry = textRy ?? defaultRy;
  const rx = textRx ?? defaultRx;
  const fill = textFill ?? defaultFill;
  const { width, height } = useWindowDimensions();
  const effect = useMemo(() => Skia.RuntimeEffect.Make(SKSL), []);

  if (!effect) return null;

  const shaderProps = {
    bgRgb,
    effect,
    fgRgb,
    width,
    height,
    cy,
    ry,
    rx,
    fill,
  };

  return shouldAnimate ? <AnimatedAmbientShader {...shaderProps} /> : <StaticAmbientShader {...shaderProps} />;
}
