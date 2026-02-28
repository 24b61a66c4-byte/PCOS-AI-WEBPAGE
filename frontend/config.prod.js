// Production API Configuration for GitHub Pages & Vercel Deployment

window.CONFIG = {
  // OpenRouter API key (required for AI assistant)
  OPENROUTER_API_KEY: 'YOUR_OPENROUTER_API_KEY',

  // Supabase configuration (uses localStorage + Supabase)
  SUPABASE_URL: 'https://hrcjgcqzhulmxdyfeymw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY2pnY3F6aHVsbXhkeWZleW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mjk3MDYsImV4cCI6MjA4NjUwNTcwNn0.ub_wgpTDdjrmkvMSLPRnJ24eCbMnSycSxgYAY7MbpfM',

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

console.log('Config loaded. Backend API:', window.CONFIG.BACKEND_URL);
