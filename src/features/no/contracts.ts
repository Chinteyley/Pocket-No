export const NO_REASON_SOURCE = 'catalog' as const;
export const REMOTE_NO_REASON_SOURCE = 'remote-catalog' as const;
export const NO_REASON_SOURCES = [NO_REASON_SOURCE, REMOTE_NO_REASON_SOURCE] as const;

export type NoReasonSource = (typeof NO_REASON_SOURCES)[number];

export type NoReason = {
  id: string;
  text: string;
  copiedText: string;
  source: NoReasonSource;
};

export function isNoReasonSource(value: unknown): value is NoReasonSource {
  return typeof value === 'string' && NO_REASON_SOURCES.includes(value as NoReasonSource);
}

export const NO_ENTRY_POINTS = ['app', 'quick-action', 'widget', 'action-button'] as const;

export type NoEntryPoint = (typeof NO_ENTRY_POINTS)[number];

export function parseNoEntryPoint(value: string | string[] | undefined): NoEntryPoint {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate && NO_ENTRY_POINTS.includes(candidate as NoEntryPoint)) {
    return candidate as NoEntryPoint;
  }

  return 'app';
}
