// Production API Configuration for GitHub Pages Deployment
// This file is used when the app is deployed to GitHub Pages

window.CONFIG = {
  // OpenRouter API key (required for AI assistant)
  OPENROUTER_API_KEY: 'YOUR_OPENROUTER_API_KEY',

  // Supabase configuration (uses localStorage + Supabase)
  SUPABASE_URL: 'https://hrcjgcqzhulmxdyfeymw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY2pnY3F6aHVsbXhkeWZleW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mjk3MDYsImV4cCI6MjA4NjUwNTcwNn0.ub_wgpTDdjrmkvMSLPRnJ24eCbMnSycSxgYAY7MbpfM',

  // Backend API URL - auto-detect environment
  BACKEND_URL: (function () {
    if (typeof window !== 'undefined') {
      // In GitHub Pages: https://yourusername.github.io/repo-name
      // In localhost: http://localhost:5000
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocalhost) {
        // Development: use local backend
        return 'http://localhost:5000';
      } else {
        // Production: Use deployed backend API
        // Update this with your actual deployed backend URL
        // Example: https://pcos-api.herokuapp.com or https://pcos-api.railway.app
        return 'https://your-app.railway.app'; // Replace with your actual deployed backend URL
      }
    }
    return 'http://localhost:5000';
  })()
};

console.log('Config loaded. Backend API:', window.CONFIG.BACKEND_URL);
