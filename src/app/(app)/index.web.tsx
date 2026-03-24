import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';

import { DemoSection } from '@/components/landing/demo-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { FooterSection } from '@/components/landing/footer-section';
import { HeroSection } from '@/components/landing/hero-section';

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView className="flex-1 bg-paper">
      <Stack.Screen options={{ headerShown: false }} />
      <HeroSection isDesktop={isDesktop} />
      <DemoSection isDesktop={isDesktop} />
      <FeaturesSection isDesktop={isDesktop} />
      <FooterSection isDesktop={isDesktop} />
    </ScrollView>
  );
}
