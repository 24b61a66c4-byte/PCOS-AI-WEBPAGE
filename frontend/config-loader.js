// Smart Config Loader
// Loads config with environment-aware fallback sequence and exposes readiness promise.
(function() {
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

  const candidates = isLocalhost
    ? ['config.local.js', 'config.js']
    : ['config.prod.js', 'config.js'];

  let resolveConfigReady;
  window.__CONFIG_READY__ = new Promise((resolve) => {
    resolveConfigReady = resolve;
  });

  function finalize(loadedPath) {
    const config = window.CONFIG && typeof window.CONFIG === 'object' ? window.CONFIG : null;
    if (typeof resolveConfigReady === 'function') {
      resolveConfigReady(config);
      resolveConfigReady = null;
    }

    try {
      window.dispatchEvent(new CustomEvent('config:ready', {
        detail: {
          path: loadedPath || null,
          config,
        },
      }));
    } catch (error) {
      // No-op for environments without CustomEvent support.
    }
  }

  function tryLoadConfig(index) {
    if (index >= candidates.length) {
      console.warn('[Config] No config file loaded; window.CONFIG may be undefined.');
      finalize(null);
      return;
    }

    const configPath = candidates[index];
    const script = document.createElement('script');
    script.src = configPath;

    script.onload = () => {
      const hasConfig = window.CONFIG && typeof window.CONFIG === 'object';
      if (hasConfig) {
        console.log(`[Config] Loaded environment config from: ${configPath}`);
        finalize(configPath);
        return;
      }

      console.warn(`[Config] ${configPath} loaded but window.CONFIG was not defined; trying next fallback.`);
      script.remove();
      tryLoadConfig(index + 1);
    };

    script.onerror = () => {
      console.warn(`[Config] Failed to load ${configPath}, trying next fallback.`);
      script.remove();
      tryLoadConfig(index + 1);
    };

    document.head.appendChild(script);
  }

  tryLoadConfig(0);
})();
