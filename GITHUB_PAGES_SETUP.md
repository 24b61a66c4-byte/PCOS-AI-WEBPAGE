# GitHub Pages Deployment Guide

Your PCOS Smart Assistant is now set up for automatic GitHub Pages deployment! 🚀

## Current Status
- ✅ GitHub Actions workflow created
- ✅ Smart config loader implemented  
- ✅ Changes pushed to GitHub
- ⏳ PR #2 ready to merge

## Next Steps

### 1. **Merge the Pull Request**
   - Go to: https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE/pulls
   - Click on PR #2
   - Click "Merge pull request"
   - Confirm merge to main

### 2. **Wait for Deployment**
   - Once merged, GitHub Actions will automatically:
     - Build your frontend files
     - Deploy to GitHub Pages
     - Takes ~1-2 minutes

### 3. **Access Your Deployed App**
   When ready, visit: **https://24b61a66c4-byte.github.io/PCOS-AI-WEBPAGE/**

### 4. **Enable GitHub Pages** (if not auto-enabled)
   - Go to: https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE/settings/pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
   - Save

## How It Works

### Local Development (http://localhost:8000)
- Uses `frontend/config.js` (localhost:5000 backend)
- Your local Flask server at http://localhost:5000

### GitHub Pages Deployment (GitHub Pages URL)
- Uses `frontend/config.prod.js` (production API)
- The config loader automatically detects the environment

## Configuring Your Backend API

For production, you need to deploy your Flask backend. Options:

### Option A: Railway.app (Recommended - Free tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option B: Heroku
```bash
# Deploy to Heroku (if you have an account)
heroku login
git push heroku main
```

### Option C: Render.com
1. Connect GitHub repo
2. Create new Web Service
3. Set start command: `cd backend && python app.py`

## Update the Production API URL

Once your backend is deployed, update:

**File:** `frontend/config.prod.js`

Find and replace:
```javascript
return 'https://api.pcos-assistant.com'; // Replace with your deployed backend URL
```

With your actual backend URL:
```javascript
return 'https://your-deployed-backend.railway.app'; // Example for Railway
```

## Testing

### Local Testing
```powershell
cd frontend
python -m http.server 8000

# Visit: http://localhost:8000/form.html
```

### Production Testing
Visit: https://24b61a66c4-byte.github.io/PCOS-AI-WEBPAGE/form.html

## Features

✅ Auto-deployment on every `main` branch push  
✅ Intelligent environment detection  
✅ CORS-enabled API communication  
✅ Supabase database integration  
✅ LocalStorage fallback  
✅ Multi-language support  
✅ Dark theme support  

## Troubleshooting

**App loads but API calls fail?**
- Check your backend is deployed and accessible
- Ensure CORS is enabled on your backend
- Verify the API URL in config.prod.js is correct

**GitHub Pages not deploying?**
- Check repository Settings > Pages
- Ensure GitHub Actions is enabled
- Check the workflow status in Actions tab

**Need help?**
- Check GitHub Actions logs: Actions > Deploy to GitHub Pages > Latest run
- Verify environment variables are set correctly

---

**Your app is now production-ready! 🎉**
