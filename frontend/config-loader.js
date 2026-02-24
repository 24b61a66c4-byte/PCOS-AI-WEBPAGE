// Smart Config Loader
// Automatically selects the right config based on environment
(function() {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

  let configPath = 'config.js';
  
  if (!isLocalhost) {
    configPath = 'config.prod.js';
  }
  
  const script = document.createElement('script');
  script.src = configPath;
  document.head.appendChild(script);
  
  console.log(`[Config] Loaded environment config from: ${configPath}`);
})();
