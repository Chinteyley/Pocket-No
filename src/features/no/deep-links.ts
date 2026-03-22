import * as Linking from 'expo-linking';

export const NO_COPY_ROUTE = '/copy' as const;
const DEFAULT_COPY_ENTRY = 'app' as const;

export const NO_COPY_ENTRIES = ['app', 'shortcut', 'widget'] as const;

export type NoCopyEntry = (typeof NO_COPY_ENTRIES)[number];

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function isNoCopyEntry(value: unknown): value is NoCopyEntry {
  return typeof value === 'string' && NO_COPY_ENTRIES.includes(value as NoCopyEntry);
}

export function resolveNoCopyEntry(value: string | string[] | undefined): NoCopyEntry {
  const normalizedValue = firstString(value);
  return isNoCopyEntry(normalizedValue) ? normalizedValue : DEFAULT_COPY_ENTRY;
}

export function resolveCopyLaunchId(value: string | string[] | undefined) {
  return firstString(value) ?? 'initial';
}

function buildNoCopySearchParams(
  entry: string | string[] | undefined,
  launchId: string | string[] | undefined
) {
  const searchParams = new URLSearchParams();
  searchParams.set('entry', resolveNoCopyEntry(entry));
  searchParams.set('launchId', resolveCopyLaunchId(launchId));
  return searchParams;
}

export function describeNoCopyEntry(entry: NoCopyEntry) {
  switch (entry) {
    case 'widget':
      return 'Opened from your widget.';
    case 'shortcut':
      return 'Opened from your Shortcut.';
    default:
      return 'Copy a fresh no without extra taps.';
  }
}

export function buildNoCopyRouteHref(entry: NoCopyEntry, launchId = String(Date.now())) {
  return {
    pathname: NO_COPY_ROUTE,
    params: {
      entry,
      launchId,
    },
  } as const;
}

export function buildNoCopyRouteUrl(entry: NoCopyEntry, launchId = String(Date.now())) {
  return Linking.createURL(NO_COPY_ROUTE, {
    scheme: 'pocketno',
    isTripleSlashed: true,
    queryParams: {
      entry,
      launchId,
    },
  });
}

export function normalizeNoCopySystemPath(path: string) {
  try {
    const systemUrl = new URL(path, 'pocketno:///');
    const normalizedHostname = systemUrl.hostname.toLowerCase();
    const normalizedPathname =
      normalizedHostname === NO_COPY_ROUTE.slice(1) && systemUrl.pathname.length === 0
        ? NO_COPY_ROUTE
        : systemUrl.pathname.replace(/\/+$/, '') || '/';

    if (normalizedPathname !== NO_COPY_ROUTE) {
      return null;
    }

    const searchParams = buildNoCopySearchParams(
      systemUrl.searchParams.get('entry') ?? undefined,
      systemUrl.searchParams.get('launchId') ?? undefined
    );

    return `${NO_COPY_ROUTE}?${searchParams.toString()}`;
  } catch {
    return null;
  }
}
