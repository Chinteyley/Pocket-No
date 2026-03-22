import { normalizeNoCopySystemPath } from '@/features/no/deep-links';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return normalizeNoCopySystemPath(path) ?? path;
}
