// Smart Config Loader
// Loads config with environment-aware fallback sequence
(function() {
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

  const candidates = isLocalhost
    ? ['config.local.js', 'config.js']
    : ['config.prod.js', 'config.js'];

  function tryLoadConfig(index) {
    if (index >= candidates.length) {
      console.warn('[Config] No config file loaded; window.CONFIG may be undefined.');
      return;
    }

    const configPath = candidates[index];
    const script = document.createElement('script');
    script.src = configPath;

    script.onload = () => {
      console.log(`[Config] Loaded environment config from: ${configPath}`);
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
