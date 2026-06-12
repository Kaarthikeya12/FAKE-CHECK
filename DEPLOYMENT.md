# Deployment Guide

This guide will help you deploy the Fake Check application to Render (Backend) and Vercel (Frontend).

## Project Structure

```
FAKE-CHECK/
├── Backend/          # Python Flask API (Deploy to Render)
│   ├── app/
│   ├── wsgi.py       # Entry point for Render
│   ├── render.yaml   # Render configuration
│   ├── Procfile      # Process file for Render
│   └── requirements.txt
└── frontend/         # Next.js App (Deploy to Vercel)
    ├── src/
    ├── vercel.json   # Vercel configuration
    └── package.json
```

## Backend Deployment (Render)

### Step 1: Prepare Repository
1. Make sure all your code is committed and pushed to GitHub
2. Ensure `Backend/wsgi.py`, `Backend/render.yaml`, and `Backend/Procfile` exist

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `fake-check-backend` (or your preferred name)
   - **Environment**: `Python 3`
   - **Root Directory**: `Backend` ⚠️ **CRITICAL - Must be set!** (This is the #1 cause of gunicorn errors!)
   - **Build Command**: `pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Plan**: Choose Free or Paid plan
   
   **IMPORTANT**: If Root Directory is not set to `Backend`, Render will look for requirements.txt in the wrong place and gunicorn won't install!

### Step 3: Environment Variables
Add these in Render Dashboard → Environment:
- `SECRET_KEY`: Your Flask secret key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SERPER_API_KEY`: Your Serper API key
- `PORT`: Will be set automatically by Render (usually 10000)

### Step 4: Deploy
Click "Create Web Service" and wait for deployment to complete.

Your backend will be available at: `https://your-app-name.onrender.com`

**Note**: Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
1. Make sure all your code is committed and pushed to GitHub
2. Ensure `frontend/vercel.json` exists

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables
Add this in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL`: `https://your-backend-app.onrender.com` (your Render backend URL)

**Important**: Replace `your-backend-app.onrender.com` with your actual Render backend URL!

### Step 4: Deploy
Click "Deploy" and wait for deployment to complete.

Your frontend will be available at: `https://your-project.vercel.app`

---

## Post-Deployment Checklist

### Backend (Render)
- [ ] Backend is accessible at Render URL
- [ ] Health check endpoint works: `https://your-backend.onrender.com/health`
- [ ] CORS is configured to allow your Vercel domain
- [ ] All API keys are set in environment variables

### Frontend (Vercel)
- [ ] Frontend is accessible at Vercel URL
- [ ] `NEXT_PUBLIC_API_URL` points to your Render backend
- [ ] Frontend can successfully connect to backend API
- [ ] All features are working correctly

---

## Troubleshooting

### Backend Issues
- **"No module named gunicorn"** or **"gunicorn: command not found"**: 
  - ⚠️ **MOST COMMON FIX**: Go to Settings → Set **Root Directory** to `Backend` (this is usually the problem!)
  - Verify Build Command: `pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt`
  - Check build logs to see if gunicorn is being installed
  - Verify `gunicorn>=21.2.0` is in `Backend/requirements.txt`
  - Try alternative Build Command: `cd Backend && pip install --upgrade pip && pip install -r requirements.txt`
- **502 Bad Gateway**: Check if service is running in Render dashboard
- **CORS Errors**: Ensure CORS is enabled in `Backend/app/init.py`
- **Import Errors**: Verify all dependencies are in `requirements.txt`

### Frontend Issues
- **API Connection Failed**: Check `NEXT_PUBLIC_API_URL` environment variable
- **Build Errors**: Check Vercel build logs for missing dependencies
- **404 Errors**: Verify `vercel.json` configuration

### Common Solutions
1. **Backend takes time to respond**: Free Render tier spins down after inactivity. First request may be slow.
2. **CORS errors**: Update CORS origins in `Backend/app/init.py` to include your Vercel domain
3. **Environment variables not working**: Restart the service after adding new environment variables

---

## Updating Deployments

### Backend Updates
1. Push changes to GitHub
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger deployment in Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Or manually trigger deployment in Vercel dashboard

---

## Support

For issues:
- Render: [Render Documentation](https://render.com/docs)
- Vercel: [Vercel Documentation](https://vercel.com/docs)

