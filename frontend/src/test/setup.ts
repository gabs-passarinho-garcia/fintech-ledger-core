/**
 * Global test setup file
 * Configures testing environment and utilities
 */
import { afterEach } from 'bun:test';
import '@testing-library/jest-dom';

// Initialize DOM environment with happy-dom
const { Window } = await import('happy-dom');
const win = new Window();
const doc = win.document;

// Set global DOM objects
// @ts-expect-error - global assignment for test environment
globalThis.window = win;
// @ts-expect-error - global assignment for test environment
globalThis.document = doc;
// @ts-expect-error - global assignment for test environment
globalThis.navigator = win.navigator;

// Mock window.matchMedia
Object.defineProperty(win, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(win, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// @ts-expect-error - global assignment for test environment
globalThis.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(win, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

// @ts-expect-error - global assignment for test environment
globalThis.sessionStorage = sessionStorageMock;

// Clean up after each test
afterEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

