const fs = require('fs');
const path = require('path');
const vm = require('vm');

const loaderCode = fs.readFileSync(
  path.join(__dirname, '..', 'frontend', 'config-loader.js'),
  'utf8'
);

function runLoader({ hostname, outcomes }) {
  const appended = [];

  const mockWindow = {
    location: { hostname },
    CONFIG: undefined,
    dispatchEvent: jest.fn(),
  };

  const mockDocument = {
    head: {
      appendChild: jest.fn((script) => {
        appended.push(script.src);
        const outcome = outcomes[script.src] || { type: 'error' };

        if (outcome.type === 'load') {
          if (Object.prototype.hasOwnProperty.call(outcome, 'config')) {
            mockWindow.CONFIG = outcome.config;
          }
          if (typeof script.onload === 'function') script.onload();
        } else if (typeof script.onerror === 'function') {
          script.onerror(new Error(`Failed to load ${script.src}`));
        }

        return script;
      }),
    },
    createElement: jest.fn(() => ({
      src: '',
      onload: null,
      onerror: null,
      remove: jest.fn(),
    })),
  };

  const context = {
    window: mockWindow,
    document: mockDocument,
    CustomEvent: function CustomEvent(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    },
    Promise,
    console,
    setTimeout,
    clearTimeout,
  };

  vm.runInNewContext(loaderCode, context);

  return { mockWindow, appended };
}

describe('config-loader fallback behavior', () => {
  test('uses localhost fallback order: config.local.js then config.js', async () => {
    const expectedConfig = { BACKEND_URL: 'http://localhost:5000' };
    const { mockWindow, appended } = runLoader({
      hostname: 'localhost',
      outcomes: {
        'config.local.js': { type: 'error' },
        'config.js': { type: 'load', config: expectedConfig },
      },
    });

    const readyConfig = await mockWindow.__CONFIG_READY__;
    expect(appended).toEqual(['config.local.js', 'config.js']);
    expect(readyConfig).toEqual(expectedConfig);
    expect(mockWindow.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = mockWindow.dispatchEvent.mock.calls[0][0];
    expect(event.type).toBe('config:ready');
    expect(event.detail.path).toBe('config.js');
  });

  test('uses production fallback order: config.prod.js then config.js', async () => {
    const expectedConfig = { BACKEND_URL: 'https://pcos-zeta.vercel.app' };
    const { mockWindow, appended } = runLoader({
      hostname: 'pcos-zeta.vercel.app',
      outcomes: {
        'config.prod.js': { type: 'load' },
        'config.js': { type: 'load', config: expectedConfig },
      },
    });

    const readyConfig = await mockWindow.__CONFIG_READY__;
    expect(appended).toEqual(['config.prod.js', 'config.js']);
    expect(readyConfig).toEqual(expectedConfig);
  });

  test('resolves with null if all candidates fail', async () => {
    const { mockWindow, appended } = runLoader({
      hostname: '127.0.0.1',
      outcomes: {
        'config.local.js': { type: 'error' },
        'config.js': { type: 'error' },
      },
    });

    const readyConfig = await mockWindow.__CONFIG_READY__;
    expect(appended).toEqual(['config.local.js', 'config.js']);
    expect(readyConfig).toBeNull();
    expect(mockWindow.CONFIG).toBeUndefined();
    const event = mockWindow.dispatchEvent.mock.calls[0][0];
    expect(event.detail.path).toBeNull();
  });
});
