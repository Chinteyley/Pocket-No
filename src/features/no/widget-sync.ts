import { DEFAULT_NO_REASON } from './catalog';
import type { NoReason } from './contracts';
import type { PocketNoWidgetProps } from './no-reason-widget';

function toWidgetProps(reason: NoReason): PocketNoWidgetProps {
  return {
    text: reason.text,
    kicker: 'Tap for a fresh no',
    detail: 'Opens the app and copies another one fast.',
  };
}

async function loadPocketNoWidget() {
  const module = await import('./no-reason-widget');
  return module.default;
}

export async function ensureNoReasonWidgetSnapshot() {
  if (process.env.EXPO_OS !== 'ios') {
    return;
  }

  try {
    const PocketNoWidget = await loadPocketNoWidget();
    const timeline = await PocketNoWidget.getTimeline();

    if (timeline.length === 0) {
      PocketNoWidget.updateSnapshot(toWidgetProps(DEFAULT_NO_REASON));
    }
  } catch (error) {
    console.warn('Failed to prime widget snapshot', error);
  }
}

export async function updateNoReasonWidgetSnapshot(reason: NoReason) {
  if (process.env.EXPO_OS !== 'ios') {
    return;
  }

  try {
    const PocketNoWidget = await loadPocketNoWidget();
    PocketNoWidget.updateSnapshot(toWidgetProps(reason));
  } catch (error) {
    console.warn('Failed to update widget snapshot', error);
  }
}
