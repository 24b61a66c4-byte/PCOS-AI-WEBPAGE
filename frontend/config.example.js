// API Configuration Template
// 
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to 'config.js' in the same folder
// 2. Fill in your actual API keys below
// 3. Never commit config.js to Git (it's already in .gitignore)
//
// Get your API keys:
// - OpenRouter: https://openrouter.ai/ (Required for AI features)
// - Supabase: https://supabase.com/ (Optional for cloud sync)

window.CONFIG = {
  // OpenRouter API key (required for AI assistant and image analysis)
  // Free models are used: llama-3.1-8b-instruct and llama-3.2-11b-vision
  OPENROUTER_API_KEY: 'your-openrouter-api-key-here',
  
  // Supabase configuration (optional - app works with localStorage only)
  SUPABASE_URL: 'your-supabase-project-url',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  
  // Backend API URL (for health analysis and doctor recommendations)
  // Use 'http://localhost:5000' for local development
  // Use your deployed API URL for production (e.g., 'https://your-api.herokuapp.com')
  BACKEND_URL: 'http://localhost:5000'
};
