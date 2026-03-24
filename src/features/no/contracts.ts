export const NO_REASON_SOURCE = 'catalog' as const;
export const JSON_CATALOG_NO_REASON_SOURCE = 'json-catalog' as const;
export const REMOTE_CATALOG_NO_REASON_SOURCE = 'remote-catalog' as const;
export const NO_REASON_SOURCES = [
  NO_REASON_SOURCE,
  JSON_CATALOG_NO_REASON_SOURCE,
  REMOTE_CATALOG_NO_REASON_SOURCE,
] as const;

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
