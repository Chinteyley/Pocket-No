import React from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';

import { APP_STORE_URL } from '@/components/landing/app-store';
import { cn } from '@/lib/cn';

const FONT_DISPLAY = { fontFamily: 'Instrument Serif, serif' } as const;
const FONT_BODY = { fontFamily: 'Figtree, sans-serif' } as const;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

type HeroSectionProps = {
  isDesktop: boolean;
};

function useStaggeredEntrance(count: number, delayMs = 60) {
  const [visible, setVisible] = React.useState<boolean[]>(
    () => new Array(count).fill(false),
  );

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          setVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * delayMs),
      );
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [count, delayMs]);

  return visible;
}

function staggerStyle(isVisible: boolean) {
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 500ms ${EASE_OUT}, transform 500ms ${EASE_OUT}`,
  } as const;
}

export function HeroSection({ isDesktop }: HeroSectionProps) {
  const vis = useStaggeredEntrance(5, 80);

  return (
    <View
      className={cn(
        'items-center bg-warm-surface px-6 pb-16 pt-20',
        isDesktop && 'pb-24 pt-32',
      )}>
      <View className={cn('w-full items-center', isDesktop && 'max-w-[720px]')}>
        <View style={staggerStyle(vis[0])}>
          <Image
            source={require('@/assets/pocket-no.svg')}
            style={{ width: 96, height: 96 }}
          />
        </View>

        <Text
          className={cn(
            'mt-6 text-center text-accent',
            isDesktop ? 'text-[20px]' : 'text-[17px]',
          )}
          style={{ ...FONT_BODY, fontWeight: '600', letterSpacing: 0.5, ...staggerStyle(vis[1]) }}>
          Pocket-No
        </Text>

        <Text
          className={cn(
            'mt-4 text-center text-ink',
            isDesktop
              ? 'text-[64px] leading-[72px]'
              : 'text-[42px] leading-[48px]',
          )}
          style={{ ...FONT_DISPLAY, letterSpacing: -1.5, ...staggerStyle(vis[2]) }}>
          Witty excuses,{'\n'}one tap away.
        </Text>

        <Text
          className={cn(
            'mt-5 text-center text-subtle-ink',
            isDesktop
              ? 'max-w-[480px] text-[19px] leading-[28px]'
              : 'max-w-[340px] text-[17px] leading-[26px]',
          )}
          style={{ ...FONT_BODY, ...staggerStyle(vis[3]) }}>
          Open the app, get a fresh no, and copy it wherever the invite is
          waiting. Now available on the App Store.
        </Text>

        <View
          className={cn('mt-7 items-center gap-4', isDesktop && 'flex-row')}
          style={staggerStyle(vis[4])}>
          <Pressable
            accessibilityLabel="Download Pocket-No on the App Store"
            accessibilityRole="link"
            onPress={() => void Linking.openURL(APP_STORE_URL)}
            className="items-center justify-center rounded-[16px] bg-button-primary px-8 py-4"
            style={({ pressed, hovered }) => ({
              transform: pressed
                ? 'scale(0.97)'
                : hovered
                  ? 'scale(1.02)'
                  : 'scale(1)',
              transition: `transform 160ms ${EASE_OUT}`,
            })}>
            <Text
              className="text-[16px] text-button-primary-text"
              style={{ ...FONT_BODY, fontWeight: '700' }}>
              Download on the App Store
            </Text>
          </Pressable>

          <Text
            className={cn(
              'text-center text-subtle-ink',
              isDesktop ? 'text-[15px]' : 'text-[14px]',
            )}
            style={FONT_BODY}>
            Free for iPhone
          </Text>
        </View>
      </View>
    </View>
  );
}
