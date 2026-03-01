// Production API Configuration for GitHub Pages & Vercel Deployment

window.CONFIG = {
  // OpenRouter API key (required for AI assistant)
  // NOTE: In production, consider using environment variables or a backend proxy
  // IMPORTANT: Do NOT commit real API keys. Use backend proxy or env vars.
  OPENROUTER_API_KEY: 'YOUR_OPENROUTER_API_KEY',

  // Supabase configuration (uses localStorage + Supabase)
  // NOTE: Supabase anon key is safe to expose in frontend - it has limited permissions
  // For enhanced security, use Row Level Security (RLS) policies in Supabase
  SUPABASE_URL: 'https://YOUR_SUPABASE_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // Backend API URL - auto-detect environment
  BACKEND_URL: (function () {
    if (typeof window !== 'undefined') {
      // Detect deployment environment
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isVercel = hostname.includes('vercel.app');
      const isGitHubPages = hostname.includes('github.io');

      if (isLocalhost) {
        // Development: use local backend
        return 'http://localhost:5000';
      } else if (isVercel) {
        // Vercel deployment: use Vercel serverless API
        return window.location.origin;
      } else if (isGitHubPages) {
        // GitHub Pages: use Vercel API (need to configure)
        return 'https://pcos-zeta.vercel.app';
      }
      // Default fallback
      return 'https://pcos-zeta.vercel.app';
    }
    return 'http://localhost:5000';
  })()
};

// Security: Mask sensitive info in console logs
(function () {
  const safeBackendUrl = window.CONFIG.BACKEND_URL || 'not configured';
  const maskedSupabase = window.CONFIG.SUPABASE_URL
    ? window.CONFIG.SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0] + '...'
    : 'not configured';

  console.log('Config loaded. Backend API:', safeBackendUrl, '| Supabase:', maskedSupabase);

  // Warn about API key if still using placeholder
  if (window.CONFIG.OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY') {
    console.warn('SECURITY WARNING: OpenRouter API key is still set to placeholder. Update config.prod.js with your actual key.');
  }
})();
