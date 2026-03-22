import type { NoEntryPoint } from './contracts';

export function buildCopyHref(entry: NoEntryPoint) {
  return `/copy?entry=${encodeURIComponent(entry)}`;
}

export function buildCopySchemeUrl(entry: NoEntryPoint) {
  return `pocketno://copy?entry=${encodeURIComponent(entry)}`;
}
