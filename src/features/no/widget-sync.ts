import { DEFAULT_NO_REASON } from './catalog';
import type { NoReason } from './contracts';
import type { PocketNoWidgetProps } from './no-reason-widget';

const FAR_FUTURE_MS = 365 * 24 * 60 * 60 * 1000;

function toWidgetProps(reason: NoReason): PocketNoWidgetProps {
  return {
    text: reason.text,
    kicker: 'TAP TO COPY',
  };
}

async function loadPocketNoWidget() {
  const module = await import('./no-reason-widget');
  return module.default;
}

function dualEntryTimeline(props: PocketNoWidgetProps) {
  const now = new Date();
  const farFuture = new Date(now.getTime() + FAR_FUTURE_MS);

  return [
    { date: now, props },
    { date: farFuture, props },
  ];
}

export async function ensureNoReasonWidgetSnapshot() {
  if (process.env.EXPO_OS !== 'ios') {
    return;
  }

  try {
    const PocketNoWidget = await loadPocketNoWidget();
    const timeline = await PocketNoWidget.getTimeline();

    if (timeline.length === 0) {
      PocketNoWidget.updateTimeline(dualEntryTimeline(toWidgetProps(DEFAULT_NO_REASON)));
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
    PocketNoWidget.updateTimeline(dualEntryTimeline(toWidgetProps(reason)));
  } catch (error) {
    console.warn('Failed to update widget snapshot', error);
  }
}
