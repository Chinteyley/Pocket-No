import { normalizeNoCopySystemPath } from '@/features/no/deep-links';

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  return normalizeNoCopySystemPath(path, initial) ?? path;
}
