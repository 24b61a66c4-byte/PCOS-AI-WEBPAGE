# PCOS Smart Assistant - API Documentation

## Global Functions

### Theme Management
- `initTheme()` - Initialize theme from localStorage
- `toggleTheme()` - Toggle between dark/light theme

### Data Management
- `getLatestEntry()` - Get latest entry from localStorage
- `pushEntryToSupabase(entry)` - Push entry to Supabase (async)
- `fetchDatasetStats()` - Fetch dataset statistics (async)
- `fetchLatestEntryFromSupabase()` - Fetch latest from Supabase (async)

### Form Functions
- `collectDraft()` - Collect form data from DOM
- `saveDraft()` - Save draft to localStorage
- `loadDraft()` - Load draft from localStorage
- `scheduleDraftSave()` - Debounced draft save
- `validateStep(step)` - Validate current step
- `showStep(step)` - Show specific step
- `generateReview()` - Generate review HTML

### Analysis Functions
- `buildPcosInsight(entry)` - Build PCOS insight object
- `buildCareSuggestions(entry)` - Build care suggestions
- `buildSuggestions(entry, stats)` - Build general suggestions
- `analyzeCurrentStep(step, stepData)` - Analyze current step (async)
- `generateLocalAnalysis(step, stepData)` - Local fallback analysis

### AI Chat
- `sendChatMessage(userMessage, imageBase64)` - Send message to AI (async)
- `addChatMessage(content, isUser, imageUrl)` - Add message to chat

### Dashboard
- `initDashboard()` - Initialize dashboard with data
- `formatDate(value)` - Format date for display

### Insights
- `getInsightLanguage()` - Get current insight language
- `renderPcosInsight()` - Render PCOS insight panel
- `renderFormSuggestions()` - Render care suggestions

### Utilities
- `sanitizeHTML(str)` - Sanitize HTML string
- `sanitizeInput(str, maxLength)` - Sanitize user input

## Configuration

The app expects `window.CONFIG` with:
```
javascript
window.CONFIG = {
  OPENROUTER_API_KEY: 'your-key',
  SUPABASE_URL: 'your-url',
  SUPABASE_ANON_KEY: 'your-key',
  BACKEND_URL: 'http://localhost:5000'
}
```

## Form Steps

1. Personal Information (age, weight, height)
2. Menstrual Cycle (cycle_length, period_length, last_period)
3. Symptoms (checkbox array)
4. Lifestyle (activity, sleep, stress, diet)
5. Clinical (city, pcos status, medications)
6. Review

## Events

- Form submission triggers localStorage save + optional Supabase sync
- Backend API call for comprehensive analysis
- Redirect to results.html on success
