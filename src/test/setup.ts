import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

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
