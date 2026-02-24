# 🚀 Complete Setup Guide - PCOS Smart Assistant

This guide will walk you through setting up the PCOS Smart Assistant from scratch on Windows.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Deployment Options](#deployment-options)

---

## ✅ System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: 4GB minimum
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **Internet**: Required for AI features and initial setup

### Required Software
- **Git**: For cloning the repository
- **Python 3.8+**: For backend analysis engine
- **Text Editor**: VS Code (recommended), Notepad++, or any code editor

---

## 📦 Installation Steps

### Step 1: Install Git (if not already installed)

**Option A: Microsoft Store**
```powershell
winget install Git.Git
```

**Option B: Download Installer**
1. Visit https://git-scm.com/download/win
2. Download and run the installer
3. Use default settings during installation

**Verify Installation:**
```powershell
git --version
# Should show: git version 2.x.x
```

---

### Step 2: Install Python

**Option A: Microsoft Store (Recommended)**
```powershell
# This will open Microsoft Store
python
# Click "Get" to install Python
```

**Option B: Winget Package Manager**
```powershell
winget install Python.Python.3.12
```

**Option C: Official Installer**
1. Visit https://www.python.org/downloads/
2. Download Python 3.12.x (latest stable)
3. Run installer
4. ✅ **IMPORTANT**: Check "Add Python to PATH" during installation

**Verify Installation:**
```powershell
python --version
# Should show: Python 3.12.x

pip --version
# Should show: pip 24.x.x
```

---

### Step 3: Clone the Repository

1. **Open PowerShell**
   - Press `Win + X` and select "Windows PowerShell"
   - Or search for "PowerShell" in Start Menu

2. **Navigate to your desired folder**
   ```powershell
   cd C:\Users\YourUsername\Desktop
   # Replace YourUsername with your actual username
   ```

3. **Clone the repository**
   ```powershell
   git clone https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE.git
   cd PCOS-AI-WEBPAGE
   ```

4. **Verify files downloaded**
   ```powershell
   dir
   # You should see: frontend/, backend/, README.md, etc.
   ```

---

### Step 4: Install Python Dependencies

```powershell
# Navigate to backend folder
cd backend

# Install all required packages
pip install -r requirements.txt

# This installs: Flask, Flask-CORS, Supabase, NumPy, Pandas, python-dotenv
```

**Expected Output:**
```
Successfully installed Flask-3.0.0 Flask-Cors-4.0.0 ...
```

---

## ⚙️ Configuration

### Step 5: Set Up API Keys

#### A. Get OpenRouter API Key (Required for AI features)

1. **Visit OpenRouter**
   - Go to https://openrouter.ai/
   - Click "Sign Up" (it's FREE)
   
2. **Create Account**
   - Use Google/GitHub login or email
   - No credit card required for free tier

3. **Generate API Key**
   - Go to https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-or-v1-...`)

#### B. Get Supabase Credentials (Required for backend)

1. **Create Supabase Account**
   - Go to https://supabase.com/
   - Sign up for FREE account
   
2. **Create New Project**
   - Click "New Project"
   - Name: `pcos-assistant` (or any name)
   - Database Password: Create a strong password
   - Region: Choose closest to you
   - Click "Create new project" (takes 2-3 minutes)

3. **Set Up Database**
   - In Supabase Dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy contents from `backend/sql/SUPABASE_DATASET_SETUP.sql`
   - Paste and click "Run"
   - Repeat for `backend/sql/SUPABASE_ASSISTANT_STATS.sql`

4. **Get API Credentials**
   - Go to Settings (⚙️) → API
   - Copy these values:
     - **Project URL** (looks like `https://xxxxx.supabase.co`)
     - **anon public** key (for frontend)
     - **service_role** key (for backend) - Click "Reveal" to see it

---

### Step 6: Configure Frontend

1. **Navigate to frontend folder**
   ```powershell
   cd ..\frontend
   # (if you're in backend folder)
   ```

2. **Create config.js file**
   ```powershell
   # Copy the example
   Copy-Item config.example.js config.js
   ```

3. **Edit config.js**
   - Open `frontend/config.js` in any text editor
   - Replace the placeholder values:
   
   ```javascript
   window.CONFIG = {
     OPENROUTER_API_KEY: 'sk-or-v1-YOUR-ACTUAL-KEY-HERE',
     SUPABASE_URL: 'https://xxxxx.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-public-key-here',
     BACKEND_URL: 'http://localhost:5000'
   };
   ```

4. **Save the file**

---

### Step 7: Configure Backend

1. **Navigate to backend folder**
   ```powershell
   cd ..\backend
   ```

2. **Create .env file**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Edit .env file**
   - Open `backend/.env` in text editor
   - Add your credentials:
   
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   PORT=5000
   ```

   ⚠️ **IMPORTANT**: Use the `service_role` key here, NOT the anon key!

4. **Save the file**

---

## 🏃‍♂️ Running the Application

### Option 1: Using Two PowerShell Windows (Recommended)

**Terminal 1 - Backend Server:**
```powershell
# Navigate to backend folder
cd C:\Users\YourUsername\Desktop\PCOS-AI-WEBPAGE\backend

# Start Flask server
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Running on http://localhost:5000
```

✅ **Keep this terminal running**

---

**Terminal 2 - Frontend Server:**
```powershell
# Navigate to project root
cd C:\Users\YourUsername\Desktop\PCOS-AI-WEBPAGE

# Start PowerShell HTTP server
python -m http.server 8080
```

You should see:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

✅ **Keep this terminal running too**

---

### Option 2: Using the Provided Script

```powershell
# From project root
.\server.ps1
```

This will start a simple HTTP server on port 8080.

---

## 🧪 Verification & Testing

### 1. Test Frontend

1. **Open browser**
   - Go to: http://localhost:8080

2. **Check Landing Page**
   - You should see the PCOS Smart Assistant homepage
   - Click "Dashboard" or "Start Health Journey"

3. **Test Navigation**
   - Click around to verify pages load
   - Try theme toggle (dark/light mode)

---

### 2. Test Backend API

1. **Health Check**
   - Open browser
   - Go to: http://localhost:5000/health
   - Should show: `{"status": "healthy", "message": "PCOS Analysis API is running"}`

2. **Stats Endpoint**
   - Go to: http://localhost:5000/api/stats
   - Should return JSON with dataset statistics

---

### 3. Test Complete Workflow

1. **Fill Out Form**
   - Go to http://localhost:8080/frontend/form.html
   - Complete all 6 steps with sample data:
     - Age: 25
     - Weight: 65 kg
     - Height: 165 cm
     - City: Hyderabad
     - Cycle Length: 35 days
     - Period Length: 6 days
     - Add some symptoms

2. **Submit Form**
   - Click "Submit" on final step
   - Should redirect to Results page

3. **Check Results**
   - Should see:
     - Risk assessment badge (Low/Moderate/High)
     - Health insights and recommendations
     - List of recommended doctors
     - Emergency helplines

4. **Test AI Chat** (in Dashboard)
   - Go to http://localhost:8080/frontend/dashboard.html
   - Open AI assistant
   - Ask: "What is PCOS?"
   - Should get AI response

---

## 🔧 Troubleshooting

### Issue: Python not found

**Solution:**
```powershell
# Check if Python is installed
python --version

# If not found, install via Microsoft Store or winget
winget install Python.Python.3.12

# Restart PowerShell after installation
```

---

### Issue: pip install fails

**Solution 1: Upgrade pip**
```powershell
python -m pip install --upgrade pip
```

**Solution 2: Use Python with -m flag**
```powershell
python -m pip install -r requirements.txt
```

---

### Issue: Backend API returns errors

**Check these:**

1. **Is .env file configured correctly?**
   ```powershell
   cat backend\.env
   # Should show your Supabase URL and service key
   ```

2. **Are you using the service_role key (not anon key)?**
   - The backend needs `service_role` key
   - The frontend uses `anon` key

3. **Is Supabase accessible?**
   - Open https://hrcjgcqzhulmxdyfeymw.supabase.co in browser
   - Should load (even if it shows login page)

---

### Issue: Frontend shows "Backend unavailable"

**Check these:**

1. **Is backend running?**
   - Check Terminal 1 - should show Flask server running
   - Visit http://localhost:5000/health

2. **Is BACKEND_URL correct in config.js?**
   ```javascript
   BACKEND_URL: 'http://localhost:5000'  // No trailing slash
   ```

3. **CORS errors in browser console?**
   - Backend has Flask-CORS enabled
   - Check that Flask-CORS is installed: `pip list | findstr cors`

---

### Issue: AI Chat doesn't respond

**Check these:**

1. **Is OpenRouter API key valid?**
   - Go to https://openrouter.ai/keys
   - Verify your key is active
   - Check for typos in config.js

2. **Check browser console for errors**
   - Press F12 → Console tab
   - Look for API errors

3. **Test API directly**
   ```powershell
   curl -X POST https://openrouter.ai/api/v1/chat/completions `
     -H "Authorization: Bearer YOUR_API_KEY" `
     -H "Content-Type: application/json" `
     -d '{"model":"meta-llama/llama-3.1-8b-instruct:free","messages":[{"role":"user","content":"Hello"}]}'
   ```

---

### Issue: Port already in use

**Solution: Use different port**

For backend:
```powershell
# In backend/.env, change:
PORT=5001
# Then restart backend
```

For frontend:
```powershell
# Use a different port
python -m http.server 8081
```

---

## 🌐 Deployment Options

### Deploy Frontend to GitHub Pages

1. **Enable GitHub Pages**
   - Go to: https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE/settings/pages
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`
   - Click "Save"

2. **Wait 1-2 minutes**
   - GitHub will build your site
   - Visit: https://24b61a66c4-byte.github.io/PCOS-AI-WEBPAGE/

3. **Update config.js for production**
   - Change `BACKEND_URL` to your deployed backend URL
   - Commit and push changes

---

### Deploy Backend to Railway/Render/Heroku

**Railway (Recommended - Free Tier)**

1. Visit https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `PCOS-AI-WEBPAGE` repository
5. Set Root Directory: `backend`
6. Add Environment Variables:
   - `SUPABASE_URL`: your Supabase URL
   - `SUPABASE_SERVICE_KEY`: your service role key
7. Deploy!

**Update frontend config.js:**
```javascript
BACKEND_URL: 'https://your-app.railway.app'
```

---

## 📚 Additional Resources

- **Backend Documentation**: [backend/README.md](backend/README.md)
- **Supabase Setup**: [backend/SUPABASE_SETUP.md](backend/SUPABASE_SETUP.md)
- **Dataset Info**: [data/README.md](data/README.md)
- **Main README**: [README.md](README.md)

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Git installed (`git --version`)
- [ ] Repository cloned
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `frontend/config.js` created with valid API keys
- [ ] `backend/.env` created with Supabase service key
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:8080
- [ ] http://localhost:5000/health returns JSON
- [ ] Browser console shows no errors (F12)

---

## 🆘 Still Need Help?

1. **Check Issues**: https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE/issues
2. **Review Code**: All configuration files have examples
3. **Console Logs**: Check browser console (F12) and terminal output

---

## 🎉 Success!

If everything works:
- ✅ Landing page loads at http://localhost:8080
- ✅ Form submission shows analysis results
- ✅ AI chat responds to questions
- ✅ Dashboard displays your health data
- ✅ Doctor recommendations appear

**You're all set! Start tracking your health journey! 🏥💙**

---

*Last Updated: February 2026*
*For the latest version, visit: https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE*
