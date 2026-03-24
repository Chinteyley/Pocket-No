import React from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

const FONT_DISPLAY = { fontFamily: 'Instrument Serif, serif' } as const;
const FONT_BODY = { fontFamily: 'Figtree, sans-serif' } as const;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

type FeaturesSectionProps = {
  isDesktop: boolean;
};

const FEATURES = [
  {
    title: 'Instant',
    description:
      'One tap to copy. No scrolling, no browsing, no decision fatigue. Open the app, get an excuse, done.',
  },
  {
    title: 'Thoughtful',
    description:
      'Every line is crafted to be honest but polite. Say no without burning bridges or feeling guilty.',
  },
  {
    title: 'Everywhere',
    description:
      'Home screen quick actions, Siri Shortcuts, and a widget. Say no without even opening the app.',
  },
] as const;

function useIntersectionReveal(ref: React.RefObject<View | null>) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current as unknown as HTMLElement | null;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export function FeaturesSection({ isDesktop }: FeaturesSectionProps) {
  const sectionRef = React.useRef<View>(null);
  const visible = useIntersectionReveal(sectionRef);

  return (
    <View
      ref={sectionRef}
      className={cn(
        'items-center bg-warm-surface px-6 py-16',
        isDesktop && 'py-24',
      )}>
      <View className={cn('w-full', isDesktop && 'max-w-[720px]')}>
        <Text
          className={cn(
            'mb-12 text-center text-ink',
            isDesktop
              ? 'text-[40px] leading-[48px]'
              : 'text-[32px] leading-[40px]',
          )}
          style={{
            ...FONT_DISPLAY,
            letterSpacing: -0.8,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            // @ts-expect-error -- web-only CSS property
            transition: `opacity 500ms ${EASE_OUT}, transform 500ms ${EASE_OUT}`,
          }}>
          Say no without the guilt.
        </Text>

        <View
          className={cn(
            'gap-8',
            isDesktop && 'flex-row gap-10',
          )}>
          {FEATURES.map((feature, index) => (
            <View
              key={feature.title}
              className={cn('flex-1', !isDesktop && 'items-center')}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                // @ts-expect-error -- web-only CSS property
                transition: `opacity 500ms ${EASE_OUT} ${120 + index * 60}ms, transform 500ms ${EASE_OUT} ${120 + index * 60}ms`,
              }}>
              <View className="mb-3 h-[3px] w-8 rounded-full bg-accent" />
              <Text
                className={cn(
                  'mb-2 text-ink',
                  isDesktop ? 'text-[22px]' : 'text-[20px]',
                  !isDesktop && 'text-center',
                )}
                style={FONT_DISPLAY}>
                {feature.title}
              </Text>
              <Text
                className={cn(
                  'text-subtle-ink',
                  isDesktop
                    ? 'text-[15px] leading-[23px]'
                    : 'max-w-[320px] text-center text-[15px] leading-[23px]',
                )}
                style={FONT_BODY}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
