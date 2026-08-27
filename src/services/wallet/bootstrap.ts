/**
 * Browser environment check.
 * Note: cross-fetch is cleanly aliased to src/shims/cross-fetch.ts in Vite config,
 * preventing any prototype mutation or getter conflicts without monkey-patching browser globals.
 */
export function ensureBrowserEnvironmentPatched(): void {
  // No global monkey-patching needed; shims are resolved at bundle level
}
