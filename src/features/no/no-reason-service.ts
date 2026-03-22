import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import type { NoReason } from './contracts';
import { fetchFreshNoReason as fetchFreshNoReasonFromApi } from './no-reason-api';
import { updateNoReasonWidgetSnapshot } from './widget-sync';

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
  await updateNoReasonWidgetSnapshot(reason);
  await playSuccessHaptic();
}

export async function fetchFreshNoReason() {
  return fetchFreshNoReasonFromApi();
}

export async function createAndCopyNoReason() {
  const reason = await fetchFreshNoReason();
  await copyReason(reason);
  return reason;
}

export async function copyNoReasonToClipboard(reason: NoReason) {
  await copyReason(reason);
}
