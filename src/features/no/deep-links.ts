import * as Linking from 'expo-linking';

export const NO_COPY_ROUTE = '/copy' as const;
const DEFAULT_COPY_ENTRY = 'app' as const;

export const NO_COPY_ENTRIES = ['app', 'shortcut'] as const;

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

export function resolveNoCopyRouteHrefFromSystemPath(path: string) {
  const normalizedPath = normalizeNoCopySystemPath(path);

  if (!normalizedPath) {
    return null;
  }

  const normalizedUrl = new URL(normalizedPath, 'pocketno:///');

  return buildNoCopyRouteHref(
    resolveNoCopyEntry(normalizedUrl.searchParams.get('entry') ?? undefined),
    resolveCopyLaunchId(normalizedUrl.searchParams.get('launchId') ?? undefined)
  );
}

export function inspectNoCopySystemPath(path: string, initial = false) {
  try {
    const systemUrl = new URL(path, 'pocketno:///');
    const normalizedHostname = systemUrl.hostname.toLowerCase();
    const normalizedPathname =
      normalizedHostname === NO_COPY_ROUTE.slice(1) && systemUrl.pathname.length === 0
        ? NO_COPY_ROUTE
        : systemUrl.pathname.replace(/\/+$/, '') || '/';

    if (normalizedPathname !== NO_COPY_ROUTE) {
      return {
        path,
        initial,
        protocol: systemUrl.protocol,
        hostname: systemUrl.hostname,
        pathname: systemUrl.pathname,
        search: systemUrl.search,
        normalizedHostname,
        normalizedPathname,
        reason: 'pathname did not match copy route',
        normalizedPath: null,
      };
    }

    const searchParams = buildNoCopySearchParams(
      systemUrl.searchParams.get('entry') ?? undefined,
      systemUrl.searchParams.get('launchId') ?? undefined
    );

    return {
      path,
      initial,
      protocol: systemUrl.protocol,
      hostname: systemUrl.hostname,
      pathname: systemUrl.pathname,
      search: systemUrl.search,
      normalizedHostname,
      normalizedPathname,
      reason: 'copy route matched',
      normalizedPath: `${NO_COPY_ROUTE}?${searchParams.toString()}`,
    };
  } catch (error) {
    return {
      path,
      initial,
      reason: 'invalid url',
      normalizedPath: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
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

export function normalizeNoCopySystemPath(path: string, initial = false) {
  return inspectNoCopySystemPath(path, initial).normalizedPath;
}
