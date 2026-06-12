# Complete Vercel Deployment - Frontend + Backend

Deploy your entire website (frontend + backend) to Vercel in one deployment! 🚀

## ✅ What's Set Up

1. **Root `vercel.json`** - Handles both frontend and backend routing
2. **Backend API** - Flask backend as serverless functions
3. **Frontend** - Next.js app
4. **API Configuration** - Frontend uses relative URLs (same domain)

## 🚀 Deploy Steps

### Step 1: Commit All Files
```bash
git add vercel.json Backend/api/index.py frontend/src/lib/api.ts
git commit -m "Setup complete Vercel deployment"
git push
```

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Root Directory**: Leave **EMPTY** (deploy from root)
   - **Framework Preset**: Other (Vercel will auto-detect Next.js)
   - **Build Command**: (leave empty - auto-detected)
   - **Output Directory**: (leave empty - auto-detected)
5. **Add Environment Variables:**
   - `SECRET_KEY` - Your Flask secret key
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SERPER_API_KEY` - Your Serper API key
   - `NEXT_PUBLIC_API_URL` - Leave empty or set to `/api` (uses same domain)
6. **Click "Deploy"**

### Step 3: That's It! 🎉

Your entire website is now live on Vercel!

---

## 📁 How It Works

### Routing Structure

- **Frontend Routes**: `/`, `/login`, `/dashboard`, etc. → Next.js app
- **API Routes**: `/api/*`, `/verify/*`, `/health`, `/test` → Flask backend
- **Same Domain**: Everything runs on `https://your-project.vercel.app`

### API Calls

The frontend now uses relative URLs:
- Development: `http://localhost:5000` (fallback)
- Production: Same domain (no CORS issues!)

---

## 🔧 File Structure

```
FAKE-CHECK/
├── vercel.json              ← Root config (handles both)
├── frontend/
│   ├── src/
│   │   └── lib/
│   │       └── api.ts       ← Updated to use relative URLs
│   └── package.json
└── Backend/
    ├── api/
    │   └── index.py         ← Serverless function entry
    ├── app/
    │   └── ...
    └── requirements.txt
```

---

## ✅ Benefits

- ✅ **Single Deployment** - Frontend + Backend together
- ✅ **Same Domain** - No CORS issues
- ✅ **Free Tier** - Both on Vercel free plan
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Global CDN** - Fast worldwide
- ✅ **Easy Updates** - Push to GitHub, auto-deploys

---

## 🧪 Test Your Deployment

After deployment, test these URLs:

- Frontend: `https://your-project.vercel.app`
- Health Check: `https://your-project.vercel.app/health`
- API Test: `https://your-project.vercel.app/api/verify/text`

---

## 📝 Environment Variables

Make sure to add these in Vercel Dashboard → Settings → Environment Variables:

- `SECRET_KEY` - Flask secret key
- `GEMINI_API_KEY` - Google Gemini API key
- `SERPER_API_KEY` - Serper API key
- `NEXT_PUBLIC_API_URL` - (Optional, leave empty for same domain)

---

## 🎯 That's It!

Your complete website (frontend + backend) is now on Vercel! 🚀

No need for separate deployments - everything works together on one domain!

