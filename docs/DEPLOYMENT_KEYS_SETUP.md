# API Keys & Secrets Deployment Setup

**Last Updated**: March 1, 2026

## ✅ Local Configuration Complete

All API keys have been added to:
- `agent-secrets.local.json` (gitignored, master copy)
- `backend/.env` (for local development)

### Keys Already Set Locally:

| Key | Status | Location |
|-----|--------|----------|
| OPENROUTER_API_KEY | ✅ Fixed (typo corrected) | backend/.env |
| OPENAI_API_KEY | ✅ Configured | backend/.env |
| PERPLEXITY_API_KEY | ✅ Configured | backend/.env |
| SUPABASE_URL | ✅ Configured | backend/.env |
| SUPABASE_SERVICE_KEY | ✅ Configured | backend/.env |

## 🚀 Vercel Environment Variables Setup

**To enable AI chat on production, set these in Vercel Dashboard:**

```bash
https://vercel.com/your-project/settings/environment-variables
```

**Required Variables for Production:**

```
OPENROUTER_API_KEY = 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
SUPABASE_URL = https://hrcjgcqzhulmxdyfeymw.supabase.co/
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional Variables:**
- OPENAI_API_KEY (fallback AI provider)
- PERPLEXITY_API_KEY (fallback AI provider)

## 📋 What Each Key Does

### OPENROUTER_API_KEY
- **Purpose**: Powers the `/api/ai/chat` endpoint
- **Used by**: Frontend chat assistant
- **Monthly Limit**: $5.00 (free tier)
- **Test**: POST to `/api/ai/chat` with OpenRouter chat format

### SUPABASE Keys
- **Purpose**: Database storage for PCOS entries
- **Used by**: `/api/analyze` endpoint (save analysis results)
- **Can skip**: If `SKIP_SUPABASE=1` in backend/.env

### OPENAI / PERPLEXITY Keys
- **Purpose**: Alternative AI providers
- **Used by**: Future expansion (not currently active)
- **Status**: Optional

## 🔒 Security Checklist

- [x] All keys stored in gitignored `agent-secrets.local.json`
- [x] No keys committed to git history
- [x] .env file has sensitive keys (gitignored)
- [x] Backend .env updated with correct variable names
- [ ] Vercel environment variables set (NEXT: do this manually)
- [ ] Rotate keys if exposed in chat history

## 🧪 Testing

### Test OpenRouter API Locally:
```bash
python backend/app.py
```

Then POST to `/api/ai/chat`:
```json
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "What is PCOS?"}],
  "temperature": 0.7
}
```

Expected Response: `200 OK` with AI response

### Test Supabase Connection:
```bash
POST /api/analyze
{
  "age": 28,
  "cycle_length": 42,
  "period_length": 7,
  "symptoms": ["irregular_cycles", "acne"]
}
```

Expected: Analysis result + stored in Supabase

## 📝 Next Steps

1. **Set Vercel Environment Variables** (manual step in dashboard)
   - Copy OPENROUTER_API_KEY
   - Copy SUPABASE_URL
   - Copy SUPABASE_SERVICE_KEY

2. **Deploy to Vercel**
   ```bash
   git push origin main
   ```

3. **Test Production Endpoints**
   - Chat: `https://pcos-zeta.vercel.app/api/ai/chat`
   - Analysis: `https://pcos-zeta.vercel.app/api/analyze`

4. **Rotate Keys** (security best practice)
   - OpenRouter: https://openrouter.ai/keys
   - Supabase: https://app.supabase.com/project/your-project/settings/api

## ⚠️ Important Notes

- **agent-secrets.local.json** is gitignored and won't upload to GitHub
- **backend/.env** is also gitignored (local development only)
- **Vercel** needs separate environment variables (set via dashboard)
- **Don't commit** the .env file to version control

---

**Coordinator**: GitHub Copilot (Claude Haiku 4.5)  
**Status**: Ready for Vercel deployment
