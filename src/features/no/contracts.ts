export const NO_REASON_SOURCE = 'catalog' as const;

export type NoReason = {
  id: string;
  text: string;
  copiedText: string;
  source: typeof NO_REASON_SOURCE;
};

export const NO_ENTRY_POINTS = ['app', 'quick-action', 'widget', 'action-button'] as const;

export type NoEntryPoint = (typeof NO_ENTRY_POINTS)[number];

export function parseNoEntryPoint(value: string | string[] | undefined): NoEntryPoint {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate && NO_ENTRY_POINTS.includes(candidate as NoEntryPoint)) {
    return candidate as NoEntryPoint;
  }

  return 'app';
}
