import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import type { NoReason } from './contracts';
import {
  fetchFreshNoReason as fetchFreshNoReasonFromApi,
  type FetchFreshNoReasonResult,
} from './no-reason-api';

async function playSuccessHaptic() {
  if (process.env.EXPO_OS === 'web') {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Failed to trigger haptics', error);
  }
}

async function copyReason(reason: NoReason) {
  await Clipboard.setStringAsync(reason.copiedText);
  await playSuccessHaptic();
}

export async function fetchFreshNoReason(): Promise<FetchFreshNoReasonResult> {
  return fetchFreshNoReasonFromApi();
}

export async function copyNoReasonToClipboard(reason: NoReason) {
  await copyReason(reason);
}
