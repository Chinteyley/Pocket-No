import type { NoReason } from './contracts';

let currentReason: NoReason | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getPersonalizedNoReasonSnapshot() {
  return currentReason;
}

export function subscribeToPersonalizedNoReason(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setPersonalizedNoReason(reason: NoReason) {
  currentReason = reason;
  emitChange();
}

export function clearPersonalizedNoReason() {
  if (currentReason === null) {
    return;
  }

  currentReason = null;
  emitChange();
}
