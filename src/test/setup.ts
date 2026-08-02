import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
// Side-effect import: extends both Vitest's expect at runtime AND its
// TypeScript types so matchers like toBeInTheDocument are recognized.
import "@testing-library/jest-dom/vitest";

// Node 24 ships a native `localStorage` driven by `--localstorage-file` that
// gets injected into globals when @sentry/nextjs is in the dependency tree.
// Without a path it lacks the standard methods (.clear() etc.) and shadows
// jsdom's implementation. We force a clean in-memory Storage for tests.
function installInMemoryLocalStorage() {
  let store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
}

installInMemoryLocalStorage();

// jsdom implements no layout, so it ships no scrollIntoView. Components that
// keep an active option visible would throw instead of being testable.
// Guarded because this setup file also runs for node-environment test files.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// lib/env validates on import and throws when a required variable is missing —
// deliberately, so a misconfigured runtime fails loudly. Give the suite a valid
// baseline; tests that care about resolution call resolveEnv() directly.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.BLOB_READ_WRITE_TOKEN ??= "vercel_blob_rw_test-token";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next/headers — `cookies()` requires a request scope that doesn't exist
// in unit tests. Each test file can override this if it needs to assert cookie
// behaviour.
vi.mock("next/headers", () => {
  const store = new Map<string, string>();
  const cookiesApi = {
    get: (name: string) =>
      store.has(name) ? { name, value: store.get(name)! } : undefined,
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    delete: (name: string) => {
      store.delete(name);
    },
  };
  return {
    cookies: async () => cookiesApi,
    headers: async () => new Headers(),
  };
});
