# 🚂 Railway Deployment Guide

This guide will help you deploy the PCOS AI Assistant backend to Railway.

## Prerequisites

- A [Railway](https://railway.app/) account (sign up for free)
- A [Supabase](https://supabase.com/) account for the database
- This repository forked or cloned to your GitHub account

## Deployment Steps

### 1. Connect to Railway

1. Go to [Railway](https://railway.app/) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose the `PCOS-AI-WEBPAGE` repository
5. Railway will automatically detect the configuration files

### 2. Configure Environment Variables

Railway will use the configuration from `railway.toml`, but you need to set up environment variables:

1. In your Railway project, go to the **Variables** tab
2. Add the following environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
FLASK_ENV=production
```

**How to get Supabase credentials:**
- `SUPABASE_URL`: Found in your Supabase project settings under "API"
- `SUPABASE_SERVICE_KEY`: Found in your Supabase project settings under "API" → "service_role key" (keep this secret!)

**Note:** Railway automatically provides the `PORT` variable, so you don't need to set it manually.

### 3. Deploy

1. Railway will automatically deploy your application
2. The deployment process will:
   - Install Python dependencies from `backend/requirements.txt`
   - Start the Flask application
   - Configure health checks at `/health` endpoint

### 4. Access Your Application

1. Once deployed, Railway will provide a public URL (e.g., `https://your-app.railway.app`)
2. Test the health endpoint: `https://your-app.railway.app/health`
3. Your API will be available at: `https://your-app.railway.app/api/analyze`

## Configuration Files

This deployment uses three configuration files:

### `railway.toml`
- Defines build and deployment settings
- Configures health checks and restart policies
- Specifies the service name

### `Procfile`
- Alternative configuration for web process
- Backup for Railway deployment

### `runtime.txt`
- Specifies Python version (3.11.0)
- Ensures consistent Python environment

## API Endpoints

Once deployed, your backend will expose the following endpoints:

- `GET /health` - Health check endpoint
- `POST /api/analyze` - Analyze PCOS health data
- `GET /api/stats` - Get anonymized statistics

## Updating Your Frontend

After deploying the backend, update your frontend configuration:

1. Open `frontend/config.js`
2. Update the `BACKEND_URL`:

```javascript
const config = {
  BACKEND_URL: 'https://your-app.railway.app'  // Replace with your Railway URL
};
```

## Environment Configuration

The Flask app uses the `FLASK_ENV` variable to control debug mode:
- `FLASK_ENV=production` → Debug mode OFF (recommended for Railway)
- `FLASK_ENV=development` → Debug mode ON (for local development)

## Health Checks

Railway performs health checks at `/health` endpoint:
- Timeout: 100 seconds
- Restart policy: ON_FAILURE
- Max retries: 10

If the health check fails, Railway will automatically restart the service.

## Troubleshooting

### Deployment fails
- Check the Railway logs for error messages
- Verify all environment variables are set correctly
- Ensure `backend/requirements.txt` lists all dependencies

### Health check fails
- Verify the `/health` endpoint responds with 200 status
- Check if the Flask app is starting correctly
- Review Railway logs for startup errors

### Database connection issues
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project status
- Ensure the database tables are created (see `backend/SUPABASE_SETUP.md`)

## Monitoring

Railway provides built-in monitoring:
- View logs in real-time
- Monitor CPU and memory usage
- Track request metrics
- Set up custom alerts

## Costs

Railway offers a free tier to get started:
- Free trial credits available for new users
- Resource-based pricing after free tier
- Pay only for what you use

For current pricing details, visit the [Railway Pricing Page](https://railway.app/pricing).

For production deployments, consider upgrading to a paid plan for better reliability and resources.

## Support

For issues related to:
- **Railway deployment**: Check [Railway documentation](https://docs.railway.app/)
- **This application**: Open an issue in the GitHub repository
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
