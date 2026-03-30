import { useIsFocused } from '@react-navigation/native';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import { Stack } from 'expo-router';
import React from 'react';
import { Pressable, TextInput, View, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';

import { ActionButton } from '@/components/no/action-button';
import { AmbientBackground } from '@/components/no/ambient-background';
import { PersonalizeComposer } from '@/components/no/personalize-composer';
import { ReasonCard } from '@/components/no/reason-card';
import {
  generatePersonalizedNo,
  isApplePersonalizationAvailable,
  isAppleVoicePersonalizationAvailable,
  normalizePersonalizationInput,
  transcribePersonalizationAudioFile,
} from '@/features/no/apple-personalization';
import type { NoReason } from '@/features/no/contracts';
import {
  clearPersonalizedNoReason,
  getPersonalizedNoReasonSnapshot,
  setPersonalizedNoReason,
  subscribeToPersonalizedNoReason,
} from '@/features/no/personalized-reason-store';
import { copyNoReasonToClipboard, fetchFreshNoReason } from '@/features/no/no-reason-service';
import { useMountEffect } from '@/hooks/useMountEffect';
import { resetKeyboardOffset, setKeyboardOffsetY } from '../../../modules/keyboard-dismiss';

const HOME_REASON_TRANSITION_DELAY_MS = 240;
const HOME_NEW_BUTTON_PROGRESS_DELAY_MS = 450;
const HOME_COPY_BUTTON_PROGRESS_DELAY_MS = 180;
const HOME_PERSONALIZE_DRAG_THRESHOLD = 68;
const HOME_PERSONALIZE_DRAG_VELOCITY_THRESHOLD = -820;
const HOME_PERSONALIZE_PULL_LIMIT = 72;
const HOME_COMPOSER_MAX_LENGTH = 140;
const HOME_COMPOSER_FOCUS_DELAY_MS = 140;
const HOME_COMPOSER_DISMISS_DRAG_THRESHOLD = 80;
const HOME_COMPOSER_DISMISS_VELOCITY_THRESHOLD = 800;
const HOME_COMPOSER_CLOSE_DURATION_MS = 180;
const HOME_KEYBOARD_RESET_FALLBACK_DELAY_MS = 320;

function formatRecordingDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function PocketNoHomeScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const inkColor = useCSSVariable('--color-ink') as string;
  const accentColor = useCSSVariable('--color-accent') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const warmSurfaceColor = useCSSVariable('--color-warm-surface') as string;
  const loadingSurfaceColor = useCSSVariable('--color-loading-surface') as string;
  const loadingBorderColor = useCSSVariable('--color-loading-border') as string;
  const actionTrayLift = useSharedValue(0);
  const actionTrayDragDistance = useSharedValue(0);
  const composerProgress = useSharedValue(0);
  const composerDragY = useSharedValue(0);
  const composerDismissing = useSharedValue(false);
  const keyboard = useAnimatedKeyboard();
  const textCy = useSharedValue(0.44);
  const textRy = useSharedValue(0.1);
  const textRx = useSharedValue(0.42);
  const textFill = useSharedValue(0);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const inputRef = React.useRef<TextInput>(null);
  const copySuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const composerFocusTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardResetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const composerDismissInFlightRef = React.useRef(false);
  const copyInFlight = React.useRef(false);
  const anotherInFlight = React.useRef(false);
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | 'loading' | null>('loading');
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isPersonalizationAvailable, setIsPersonalizationAvailable] = React.useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = React.useState<boolean | null>(null);
  const [isComposerMounted, setIsComposerMounted] = React.useState(false);
  const [composerText, setComposerText] = React.useState('');
  const [composerMode, setComposerMode] = React.useState<
    'idle' | 'recording' | 'transcribing' | 'submitting'
  >('idle');
  const [composerErrorMessage, setComposerErrorMessage] = React.useState<string | null>(null);
  const [composerVoiceError, setComposerVoiceError] = React.useState<string | null>(null);
  const personalizedReason = React.useSyncExternalStore(
    subscribeToPersonalizedNoReason,
    getPersonalizedNoReasonSnapshot
  );
  const displayedReason = personalizedReason ?? reason;
  const copiedReasonTextColor = showCopySuccess && colorScheme === 'dark' ? '#ffffff' : inkColor;
  const canOpenPersonalize =
    process.env.EXPO_OS === 'ios' && isPersonalizationAvailable && busyAction === null;
  const isComposerBusy = composerMode === 'transcribing' || composerMode === 'submitting';
  const canSubmitPersonalization =
    composerMode !== 'recording' &&
    !isComposerBusy &&
    normalizePersonalizationInput(composerText).length > 0;
  const recordingDurationLabel = formatRecordingDuration(recorderState.durationMillis);

  const clearCopySuccessTimer = () => {
    if (copySuccessTimeoutRef.current) {
      clearTimeout(copySuccessTimeoutRef.current);
      copySuccessTimeoutRef.current = null;
    }
  };

  const clearComposerFocusTimer = () => {
    if (composerFocusTimeoutRef.current) {
      clearTimeout(composerFocusTimeoutRef.current);
      composerFocusTimeoutRef.current = null;
    }
  };

  const clearKeyboardResetTimer = () => {
    if (keyboardResetTimeoutRef.current) {
      clearTimeout(keyboardResetTimeoutRef.current);
      keyboardResetTimeoutRef.current = null;
    }
  };

  const hideCopySuccess = () => {
    clearCopySuccessTimer();
    setShowCopySuccess(false);
  };

  const flashCopied = () => {
    clearCopySuccessTimer();
    setShowCopySuccess(true);
    copySuccessTimeoutRef.current = setTimeout(() => {
      copySuccessTimeoutRef.current = null;
      setShowCopySuccess(false);
    }, 1000);
  };

  const applyReasonResult = (nextReasonResult: Awaited<ReturnType<typeof fetchFreshNoReason>>) => {
    React.startTransition(() => setReason(nextReasonResult.reason));
    setStatusMessage(null);
  };

  const waitForTransitionBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_REASON_TRANSITION_DELAY_MS);
    });
  };

  const waitForButtonProgressBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_NEW_BUTTON_PROGRESS_DELAY_MS);
    });
  };

  const waitForCopyButtonProgressBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_COPY_BUTTON_PROGRESS_DELAY_MS);
    });
  };

  const loadPersonalizationAvailability = React.useEffectEvent(async () => {
    const nextAvailability = await isApplePersonalizationAvailable();
    const nextVoiceAvailability = nextAvailability
      ? await isAppleVoicePersonalizationAvailable()
      : false;

    React.startTransition(() => {
      setIsPersonalizationAvailable(nextAvailability);
      setIsVoiceAvailable(nextAvailability ? nextVoiceAvailability : false);
    });
  });

  const focusComposerInput = React.useEffectEvent(() => {
    clearComposerFocusTimer();
    composerFocusTimeoutRef.current = setTimeout(() => {
      composerFocusTimeoutRef.current = null;
      inputRef.current?.focus();
    }, HOME_COMPOSER_FOCUS_DELAY_MS);
  });

  const blurComposerInput = React.useEffectEvent(() => {
    clearComposerFocusTimer();
    inputRef.current?.blur();
  });

  const scheduleKeyboardOffsetReset = React.useEffectEvent((delayMs: number) => {
    clearKeyboardResetTimer();

    if (delayMs <= 0) {
      resetKeyboardOffset();
      return;
    }

    keyboardResetTimeoutRef.current = setTimeout(() => {
      keyboardResetTimeoutRef.current = null;
      resetKeyboardOffset();
    }, delayMs);
  });

  const finishComposerDismiss = React.useEffectEvent((
    clearDraft: boolean,
    shouldDelayKeyboardReset: boolean
  ) => {
    setIsComposerMounted(false);
    setComposerMode('idle');
    composerDragY.value = 0;
    composerDismissing.value = false;
    composerDismissInFlightRef.current = false;

    if (clearDraft) {
      setComposerText('');
    }

    scheduleKeyboardOffsetReset(
      shouldDelayKeyboardReset ? HOME_KEYBOARD_RESET_FALLBACK_DELAY_MS : 0
    );
  });

  const resetDismissState = React.useEffectEvent(() => {
    composerDismissing.value = false;
    composerDismissInFlightRef.current = false;
  });

  const requestComposerDismiss = React.useEffectEvent(async (options?: { clearDraft?: boolean }) => {
    if (!isComposerMounted || composerDismissInFlightRef.current) {
      return;
    }

    composerDismissInFlightRef.current = true;

    if (recorderState.isRecording) {
      try {
        await audioRecorder.stop();
      } catch (error) {
        console.warn('Failed to stop voice recording while closing composer', error);
      }
    }

    setComposerErrorMessage(null);
    setComposerVoiceError(null);

    if (process.env.EXPO_OS !== 'web') {
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch (error) {
        console.warn('Failed to reset audio mode while closing composer', error);
      }
    }

    const shouldDelayKeyboardReset =
      process.env.EXPO_OS === 'ios' && keyboard.height.value > insets.bottom + 1;

    blurComposerInput();
    composerProgress.value = withTiming(
      0,
      {
        duration: HOME_COMPOSER_CLOSE_DURATION_MS,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishComposerDismiss)(
            options?.clearDraft ?? false,
            shouldDelayKeyboardReset
          );
        } else {
          runOnJS(resetDismissState)();
        }
      }
    );
  });

  const openComposer = React.useEffectEvent(() => {
    if (!canOpenPersonalize || isComposerMounted) {
      return;
    }

    clearKeyboardResetTimer();
    resetKeyboardOffset();
    hideCopySuccess();
    setStatusMessage(null);
    setComposerErrorMessage(null);
    setComposerVoiceError(null);
    setComposerMode('idle');
    composerDismissInFlightRef.current = false;
    composerDismissing.value = false;
    composerDragY.value = 0;
    setIsComposerMounted(true);
    composerProgress.value = withTiming(1, {
      duration: 260,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    void focusComposerInput();
  });

  const handleCopy = React.useEffectEvent(async () => {
    if (copyInFlight.current) return;
    copyInFlight.current = true;
    hideCopySuccess();
    setBusyAction('copy');
    try {
      if (displayedReason) {
        await Promise.all([
          copyNoReasonToClipboard(displayedReason),
          waitForCopyButtonProgressBeat(),
        ]);
      } else {
        const [nextReasonResult] = await Promise.all([
          fetchFreshNoReason(),
          waitForCopyButtonProgressBeat(),
        ]);
        applyReasonResult(nextReasonResult);
        await copyNoReasonToClipboard(nextReasonResult.reason);
      }
      flashCopied();
    } catch (error) {
      console.warn('Failed to copy no reason', error);
      setStatusMessage('Could not copy right now. Try again.');
    } finally {
      setBusyAction(null);
      copyInFlight.current = false;
    }
  });

  const handleAnotherOne = React.useEffectEvent(async () => {
    if (anotherInFlight.current) return;
    anotherInFlight.current = true;
    clearPersonalizedNoReason();
    hideCopySuccess();
    setBusyAction('another');
    textFill.value = withTiming(1, { duration: 380 });
    try {
      const [nextReasonResult] = await Promise.all([
        fetchFreshNoReason(),
        waitForButtonProgressBeat(),
      ]);
      applyReasonResult(nextReasonResult);
      textFill.value = withTiming(0, { duration: 420 });
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.warn('Failed to load another no reason', error);
      textFill.value = withTiming(0, { duration: 220 });
      setStatusMessage('Could not load another line right now. Try again.');
    } finally {
      setBusyAction(null);
      anotherInFlight.current = false;
    }
  });

  const loadInitialReason = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('loading');

    try {
      const [nextReasonResult] = await Promise.all([
        fetchFreshNoReason(),
        waitForTransitionBeat(),
      ]);
      applyReasonResult(nextReasonResult);
    } catch (error) {
      console.warn('Failed to load initial no reason', error);
      setStatusMessage('Could not load a fresh no right now.');
    } finally {
      setBusyAction(null);
    }
  });

  const handleQuickCopy = React.useEffectEvent(async () => {
    clearPersonalizedNoReason();
    hideCopySuccess();
    setBusyAction('another');
    textFill.value = withTiming(1, { duration: 380 });

    try {
      const nextReasonResult = await fetchFreshNoReason();
      applyReasonResult(nextReasonResult);
      textFill.value = withTiming(0, { duration: 420 });
      await copyNoReasonToClipboard(nextReasonResult.reason);
      flashCopied();
    } catch (error) {
      console.warn('Failed quick copy from home screen', error);
      textFill.value = withTiming(0, { duration: 220 });
      setStatusMessage('Could not copy a fresh no right now.');
    } finally {
      setBusyAction(null);
    }
  });

  const handleComposerSubmit = React.useEffectEvent(async () => {
    const normalizedInput = normalizePersonalizationInput(composerText);

    if (!normalizedInput) {
      setComposerErrorMessage('Add a little context first.');
      return;
    }

    setComposerMode('submitting');
    setComposerErrorMessage(null);

    try {
      const nextReason = await generatePersonalizedNo(normalizedInput);
      setPersonalizedNoReason(nextReason);
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      void requestComposerDismiss({ clearDraft: true });
    } catch (error) {
      console.warn('Failed to generate personalized no reason from text input', error);
      setComposerErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not personalize. Try again.'
      );
      setComposerMode('idle');
    }
  });

  const handleVoicePress = React.useEffectEvent(async () => {
    if (isComposerBusy) {
      return;
    }

    if (recorderState.isRecording) {
      setComposerMode('transcribing');
      setComposerErrorMessage(null);
      setComposerVoiceError(null);

      try {
        await audioRecorder.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        const recordingUri = audioRecorder.uri ?? recorderState.url;

        if (!recordingUri) {
          throw new Error('No voice memo was captured. Try again.');
        }

        const transcript = await transcribePersonalizationAudioFile(recordingUri);
        setComposerText(transcript);
        const nextReason = await generatePersonalizedNo(transcript);
        setPersonalizedNoReason(nextReason);

        if (process.env.EXPO_OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        void requestComposerDismiss({ clearDraft: true });
      } catch (error) {
        console.warn('Failed to generate personalized no reason from voice input', error);
        setComposerVoiceError("Couldn't hear that");
        setComposerMode('idle');
      }
      return;
    }

    inputRef.current?.blur();
    setComposerErrorMessage(null);
    setComposerVoiceError(null);
    setComposerMode('recording');

    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Allow microphone access to use voice.');
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Failed to start voice recording for personalized no', error);
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch (audioModeError) {
        console.warn('Failed to reset audio mode after recording start error', audioModeError);
      }
      setComposerErrorMessage(
        error instanceof Error ? error.message : 'Could not start recording.'
      );
      setComposerMode('idle');
    }
  });

  useMountEffect(() => {
    void loadInitialReason();
    void loadPersonalizationAvailability();

    const subscription = QuickActions.addListener((action) => {
      if (action.id === 'random-no') {
        void handleQuickCopy();
      }
    });

    return () => {
      clearCopySuccessTimer();
      clearComposerFocusTimer();
      clearKeyboardResetTimer();
      resetKeyboardOffset();
      subscription.remove();
    };
  });

  const actionTrayStyle = useAnimatedStyle(() => {
    const pullProgress = Math.min(
      Math.abs(actionTrayLift.value) / HOME_PERSONALIZE_PULL_LIMIT,
      1
    );
    const keyboardOffset = Math.max(keyboard.height.value - insets.bottom, 0);
    const closedScale = interpolate(pullProgress, [0, 1], [1, 1.012]);

    return {
      transform: [
        { translateY: actionTrayLift.value - keyboardOffset * composerProgress.value },
        { scale: interpolate(composerProgress.value, [0, 1], [closedScale, 1]) },
      ],
    };
  });

  const actionTraySurfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(composerProgress.value, [0, 1], [
      warmSurfaceColor,
      'rgba(0,0,0,0)',
    ]),
    borderColor: interpolateColor(composerProgress.value, [0, 1], [
      outlineColor,
      'rgba(0,0,0,0)',
    ]),
  }));

  const actionTrayCueStyle = useAnimatedStyle(() => {
    const pullProgress = Math.min(
      Math.abs(actionTrayLift.value) / HOME_PERSONALIZE_PULL_LIMIT,
      1
    );
    const closedOpacity = interpolate(pullProgress, [0, 1], [0.76, 1]);

    return {
      opacity: closedOpacity * (1 - composerProgress.value),
      transform: [
        { translateY: interpolate(pullProgress, [0, 1], [0, -3]) + 8 * composerProgress.value },
      ],
    };
  });

  const actionTrayClosedContentStyle = useAnimatedStyle(() => ({
    opacity: 1 - composerProgress.value,
    transform: [
      { translateY: interpolate(composerProgress.value, [0, 1], [0, 14]) },
      { scale: interpolate(composerProgress.value, [0, 1], [1, 0.98]) },
    ],
  }));

  const composerBackdropStyle = useAnimatedStyle(() => {
    const dragFade = interpolate(composerDragY.value, [0, 120], [1, 0.3], 'clamp');
    return {
      opacity: interpolate(composerProgress.value, [0, 1], [0, 1]) * dragFade,
    };
  });


  const composerPanelStyle = useAnimatedStyle(() => {
    const progress = composerProgress.value;
    const dragOffset = composerDragY.value;

    return {
      opacity: interpolate(progress, [0, 0.4, 1], [0, 0.6, 1]),
      transform: [
        { translateY: interpolate(progress, [0, 1], [14, 0]) + dragOffset },
        { scale: interpolate(progress, [0, 1], [0.95, 1]) },
      ],
    };
  });

  const actionTrayPan = Gesture.Pan()
    .enabled(canOpenPersonalize && !isComposerMounted)
    .maxPointers(1)
    .activeOffsetY([-12, 12])
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      const upwardDistance = Math.max(0, -event.translationY);
      const dampedDistance =
        upwardDistance <= 56
          ? upwardDistance * 0.48
          : 56 * 0.48 + (upwardDistance - 56) * 0.18;

      actionTrayDragDistance.value = upwardDistance;
      actionTrayLift.value = -Math.min(dampedDistance, HOME_PERSONALIZE_PULL_LIMIT);
    })
    .onEnd((event) => {
      const shouldOpen =
        actionTrayDragDistance.value >= HOME_PERSONALIZE_DRAG_THRESHOLD ||
        event.velocityY <= HOME_PERSONALIZE_DRAG_VELOCITY_THRESHOLD;
      actionTrayDragDistance.value = 0;
      actionTrayLift.value = withSpring(0, { damping: 20, stiffness: 240 });

      if (shouldOpen) {
        runOnJS(openComposer)();
      }
    })
    .onFinalize(() => {
      actionTrayDragDistance.value = 0;
      actionTrayLift.value = withSpring(0, { damping: 20, stiffness: 240 });
    });

  const composerPanGesture = Gesture.Pan()
    .enabled(isComposerMounted && !isComposerBusy)
    .maxPointers(1)
    .activeOffsetY(14)
    .failOffsetX([-20, 20])
    .onStart(() => {
      cancelAnimation(composerProgress);
    })
    .onUpdate((event) => {
      const downwardDistance = Math.max(0, event.translationY);
      const upwardDistance = Math.max(0, -event.translationY);
      const dampedUpward = upwardDistance * 0.15;

      composerDragY.value = downwardDistance > 0 ? downwardDistance : -dampedUpward;

      if (downwardDistance > 0) {
        runOnJS(setKeyboardOffsetY)(downwardDistance);
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY >= HOME_COMPOSER_DISMISS_DRAG_THRESHOLD ||
        event.velocityY >= HOME_COMPOSER_DISMISS_VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        composerDismissing.value = true;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(requestComposerDismiss)();
      } else {
        runOnJS(resetKeyboardOffset)();
        composerDragY.value = withSpring(0, { damping: 20, stiffness: 240 });
        if (composerProgress.value < 1) {
          composerProgress.value = withTiming(1, {
            duration: 120,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
        }
      }
    })
    .onFinalize(() => {
      if (!composerDismissing.value && composerDragY.value !== 0) {
        composerDragY.value = withSpring(0, { damping: 20, stiffness: 240 });
      }
    });

  const voiceLabel =
    composerMode === 'recording'
      ? `Stop \u00B7 ${recordingDurationLabel}`
      : composerVoiceError
        ? composerVoiceError
        : composerMode === 'transcribing'
          ? 'Listening...'
          : undefined;
  const voiceSymbol =
    composerVoiceError
      ? 'xmark'
      : composerMode === 'recording'
        ? 'stop.fill'
        : composerMode === 'transcribing'
          ? 'waveform'
          : 'mic.fill';
  const showVoice =
    isVoiceAvailable === true &&
    composerMode !== 'submitting';

  return (
    <View className="flex-1 bg-paper">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 pt-safe">
        <ReasonCard
          reason={displayedReason}
          footer={statusMessage ?? undefined}
          isLoading={busyAction === 'loading' && displayedReason === null}
          loadingLabel="Loading your next excuse..."
          copyDisabled={busyAction !== null || showCopySuccess}
          copyState={showCopySuccess ? 'success' : 'idle'}
          copiedTextColor={copiedReasonTextColor}
          onLongPress={displayedReason ? () => void handleCopy() : undefined}
          onTextMeasure={(cy, ry, rx) => {
            textCy.value = withSpring(cy, { damping: 18, stiffness: 80 });
            textRy.value = withSpring(ry, { damping: 18, stiffness: 80 });
            textRx.value = withSpring(rx, { damping: 18, stiffness: 80 });
          }}
        />
      </View>

      <AmbientBackground
        isScreenActive={isFocused}
        textCy={textCy}
        textRy={textRy}
        textRx={textRx}
        textFill={textFill}
      />

      {isComposerMounted ? (
        <Pressable
          accessibilityLabel="Close personalized no composer"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={() => void requestComposerDismiss()}>
          <Animated.View
            className="absolute inset-0 bg-black/10"
            style={composerBackdropStyle}
          />
        </Pressable>
      ) : null}

      <GestureDetector gesture={actionTrayPan}>
        <Animated.View
          className="mx-5 mb-safe-offset-4 rounded-[28px] border px-3.5 pt-3.5 pb-3.5"
          style={[
            { boxShadow: '0 18px 42px rgba(0,0,0,0.06)', overflow: 'visible' },
            actionTrayStyle,
            actionTraySurfaceStyle,
          ]}>
          {isPersonalizationAvailable ? (
            <Pressable
              accessibilityLabel="Open personalized no composer"
              accessibilityRole="button"
              disabled={!canOpenPersonalize || isComposerMounted}
              onPress={() => openComposer()}
              style={({ pressed }) => ({
                opacity: pressed && !isComposerMounted ? 0.92 : 1,
              })}>
              <Animated.View className="items-center pb-3" style={actionTrayCueStyle}>
                <View
                  className="h-[5px] w-12 rounded-full"
                  style={{ backgroundColor: loadingBorderColor }}
                />
              </Animated.View>
            </Pressable>
          ) : null}

          <Animated.View className="flex-row gap-2.5" style={actionTrayClosedContentStyle}>
            <ActionButton
              fill
              label="Copy"
              icon="doc.on.doc"
              success={showCopySuccess}
              successLabel="Copied!"
              labelMinWidth={68}
              onPress={() => void handleCopy()}
              disabled={busyAction !== null || showCopySuccess || isComposerMounted}
              tone="primary"
            />
            <ActionButton
              fill
              label="New"
              icon="arrow.clockwise"
              onPress={() => void handleAnotherOne()}
              loading={busyAction === 'another'}
              loadingIconMotion="rotate"
              loadingPalette={{
                backgroundColor: loadingSurfaceColor,
                borderColor: loadingBorderColor,
                textColor: inkColor,
                iconTint: accentColor,
                hintColor: subtleInkColor,
              }}
              loadingAnimationSpec={null}
              disabled={busyAction !== null || isComposerMounted}
              tone="secondary"
            />
          </Animated.View>

          {isComposerMounted ? (
            <View
              pointerEvents="box-none"
              className="absolute inset-x-0 bottom-0"
              style={{ paddingHorizontal: 2, paddingBottom: 2 }}>
              <GestureDetector gesture={composerPanGesture}>
                <Animated.View
                  className="rounded-[30px] border px-3.5 pt-3.5 pb-3.5"
                  style={[
                    {
                      backgroundColor: loadingSurfaceColor,
                      borderColor: loadingBorderColor,
                      borderCurve: 'continuous',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.14)',
                    },
                    composerPanelStyle,
                  ]}>
                  <View className="items-center pb-2.5">
                    <View
                      className="h-[5px] w-10 rounded-full"
                      style={{ backgroundColor: loadingBorderColor }}
                    />
                  </View>

                  <PersonalizeComposer
                    autoFocus={false}
                    errorMessage={composerErrorMessage}
                    inputRef={inputRef}
                    maxLength={HOME_COMPOSER_MAX_LENGTH}
                    onChangeText={(nextValue) => {
                      setComposerText(nextValue);
                      if (composerErrorMessage) {
                        setComposerErrorMessage(null);
                      }
                    }}
                    onClose={() => void requestComposerDismiss()}
                    onSubmit={() => void handleComposerSubmit()}
                    onVoicePress={showVoice ? () => void handleVoicePress() : undefined}
                    submitBusy={composerMode === 'submitting'}
                    submitDisabled={!canSubmitPersonalization}
                    submitSymbol={composerMode === 'submitting' ? 'sparkles' : 'arrow.up'}
                    value={composerText}
                    voiceErrorMessage={composerVoiceError}
                    voiceLabel={voiceLabel}
                    voiceSymbol={voiceSymbol}
                  />
                </Animated.View>
              </GestureDetector>
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
