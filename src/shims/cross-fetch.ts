/**
 * Isomorphic / Browser-safe shim for `cross-fetch`.
 *
 * Root Cause Analysis:
 * Standard `cross-fetch` in browser environments bundles `dist/browser-ponyfill.js`, which attempts
 * to instantiate a prototype-linked object inheriting from `window` / `globalThis`:
 * ```js
 * function F() { this.fetch = false; ... }
 * F.prototype = __global__;
 * return new F();
 * ```
 * In sandboxed iframes, strict mode, and modern Chromium/WebKit environments, `window.fetch`
 * is defined with a getter-only accessor on `Window.prototype` or `window`.
 * Assigning `this.fetch = false` on an object inheriting from an accessor without a setter throws:
 * "TypeError: Cannot set property fetch of #<Window> which has only a getter"
 *
 * This shim resolves the error by directly exporting the environment's native Fetch API
 * without performing any prototype mutations or property assignments on `window`.
 */

const nativeFetch =
  typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function'
    ? globalThis.fetch.bind(globalThis)
    : typeof window !== 'undefined' && typeof window.fetch === 'function'
    ? window.fetch.bind(window)
    : typeof fetch === 'function'
    ? fetch
    : (() => {
        throw new Error('Fetch API is not available in the current environment.');
      });

const nativeHeaders =
  typeof globalThis !== 'undefined' && typeof globalThis.Headers !== 'undefined'
    ? globalThis.Headers
    : typeof window !== 'undefined' && typeof window.Headers !== 'undefined'
    ? window.Headers
    : typeof Headers !== 'undefined'
    ? Headers
    : undefined;

const nativeRequest =
  typeof globalThis !== 'undefined' && typeof globalThis.Request !== 'undefined'
    ? globalThis.Request
    : typeof window !== 'undefined' && typeof window.Request !== 'undefined'
    ? window.Request
    : typeof Request !== 'undefined'
    ? Request
    : undefined;

const nativeResponse =
  typeof globalThis !== 'undefined' && typeof globalThis.Response !== 'undefined'
    ? globalThis.Response
    : typeof window !== 'undefined' && typeof window.Response !== 'undefined'
    ? window.Response
    : typeof Response !== 'undefined'
    ? Response
    : undefined;

export default nativeFetch;
export {
  nativeFetch as fetch,
  nativeHeaders as Headers,
  nativeRequest as Request,
  nativeResponse as Response,
};
