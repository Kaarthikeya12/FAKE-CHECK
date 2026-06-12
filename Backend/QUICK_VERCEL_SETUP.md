# Quick Vercel Deployment Guide

## ✅ Files Created

1. `Backend/vercel.json` - Vercel configuration
2. `Backend/api/index.py` - Serverless function entry point

## 🚀 Deploy Steps

### 1. Commit Files
```bash
git add Backend/vercel.json Backend/api/index.py
git commit -m "Add Vercel deployment configuration"
git push
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Root Directory**: `Backend` ⚠️ IMPORTANT!
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. **Add Environment Variables:**
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `SERPER_API_KEY`
6. **Click "Deploy"**

### 3. Update Frontend

After deployment, update frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
```

## ✅ That's It!

Your Flask backend is now on Vercel! All your routes will work:
- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/verify/text`
- `https://your-project.vercel.app/verify/image`
- etc.

## 📝 Notes

- File uploads use `/tmp` (already configured in your code)
- Free tier has 10-second timeout
- Cold starts: 1-2 seconds after inactivity
- Both frontend and backend can be on Vercel!

