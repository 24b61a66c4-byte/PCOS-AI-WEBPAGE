// Jest setup file
// Mock global objects needed for tests

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((i) => Object.keys(store)[i] || null)
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window.CONFIG
global.window = Object.create(global);
global.window.CONFIG = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-key',
  OPENROUTER_API_KEY: 'test-api-key',
  BACKEND_URL: 'http://localhost:5000'
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock fetch
global.fetch = jest.fn();

// Mock Lenis (smooth scrolling library)
jest.mock('lenis', () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    scrollTo: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn()
  }));
});

// Suppress console warnings in tests (optional)
// global.console = {
//   ...console,
//   warn: jest.fn(),
//   error: jest.fn()
// };
