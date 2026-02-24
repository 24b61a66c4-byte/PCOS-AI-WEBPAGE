# Vercel Deployment Guide

## Quick Deploy Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (Run as Administrator if needed):
   
```
powershell
   npm install -g vercel
   
```

2. **Login to Vercel**:
   
```
powershell
   vercel login
   
```
   - Enter your email and follow the link

3. **Deploy**:
   
```
powershell
   vercel --prod
   
```
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? **Your Vercel account**
     - Link to existing project? **No**
     - Project name: **pcos-smart-assistant**
     - Directory? **.** (current directory)
     - Want to modify settings? **No**

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Other**
   - Build Command: *leave empty*
   - Output Directory: **frontend**
6. Click **Deploy**

## After Deployment

### Update API URL
After deploying, update `frontend/config.prod.js`:
```
javascript
return 'https://your-vercel-app.vercel.app/api';
```

Then redeploy or set environment variable in Vercel dashboard.

## Troubleshooting

### Permission Issues (Windows)
- Run Command Prompt or PowerShell as **Administrator**
- Or use: `npm install --global vercel` with admin privileges

### API Not Working
- Check Vercel function logs in dashboard
- Ensure `api/requirements.txt` has correct dependencies
- Verify Python runtime is set to 3.11

### CORS Issues
- The API already has CORS enabled in `api/index.py`
- If issues persist, check Vercel dashboard for function errors
