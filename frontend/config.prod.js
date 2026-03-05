// Production API Configuration for GitHub Pages & Vercel Deployment

window.CONFIG = {
  // AI requests are proxied through backend API routes.
  // Keep provider keys in server environment variables only.

  // Supabase configuration (uses localStorage + Supabase)
  // NOTE: Supabase anon key is safe to expose in frontend - it has limited permissions
  // For enhanced security, use Row Level Security (RLS) policies in Supabase
  SUPABASE_URL: 'https://hrcjgcqzhulmxdyfeymw.supabase.co/',
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
        // Vercel deployment: use Vercel root (app.js appends /api/... paths)
        return window.location.origin;
      } else if (isGitHubPages) {
        // GitHub Pages: use Vercel domain (app.js appends /api/... paths)
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
})();
