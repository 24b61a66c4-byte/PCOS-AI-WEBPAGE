// Local development config — DO NOT commit real credentials.
// Copy config.example.js and fill in your real keys here.
// This file is loaded first by config-loader.js on localhost;
// the app falls back to config.js or config.prod.js if it is missing.

window.CONFIG = {
  // AI keys stay on backend only — keep OPENROUTER_API_KEY out of frontend.
  BACKEND_URL: 'http://localhost:5000',
  SUPABASE_URL: 'your-supabase-project-url',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key'
};
