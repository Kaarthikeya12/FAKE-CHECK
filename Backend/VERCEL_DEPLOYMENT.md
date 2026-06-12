# Deploy Backend to Vercel

Yes! You can deploy your Flask backend directly to Vercel. Here's how:

## ✅ Vercel Setup for Flask Backend

### Step 1: File Structure

I've created:
- `Backend/vercel.json` - Vercel configuration
- `Backend/api/index.py` - Serverless function entry point

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Root Directory**: `Backend` (IMPORTANT!)
   - **Framework Preset**: Other (or leave blank)
   - **Build Command**: Leave empty (Vercel auto-detects Python)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

### Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `SERPER_API_KEY`

### Step 4: Deploy!

Click "Deploy" and wait for it to complete.

Your backend will be available at: `https://your-project.vercel.app`

---

## 📁 How It Works

Vercel converts your Flask app into serverless functions:
- All routes work the same way
- File uploads work (using `/tmp` directory)
- API endpoints are accessible at: `https://your-project.vercel.app/verify/text`, etc.

---

## ⚠️ Important Notes

1. **File Uploads**: Vercel uses `/tmp` for temporary files (already handled in your code)
2. **Cold Starts**: First request after inactivity may take 1-2 seconds
3. **Timeout**: Vercel free tier has 10-second timeout for serverless functions
4. **Root Directory**: Must be set to `Backend` in Vercel settings

---

## 🔄 Update Frontend API URL

After deploying, update your frontend's `NEXT_PUBLIC_API_URL`:
```
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
```

---

## ✅ Advantages of Vercel

- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy deployment from GitHub
- ✅ Both frontend and backend in one place

---

## 🆚 Vercel vs Render

**Vercel:**
- ✅ Better for serverless/API
- ✅ Faster cold starts
- ✅ Global CDN
- ⚠️ 10-second timeout (free tier)
- ⚠️ Serverless functions (not traditional server)

**Render:**
- ✅ Traditional server (better for long-running tasks)
- ✅ No timeout limits
- ⚠️ Slower cold starts (free tier)
- ⚠️ Spins down after 15 min inactivity

---

## 🚀 Quick Deploy

1. Commit and push `Backend/vercel.json` and `Backend/api/index.py` to GitHub
2. Connect to Vercel
3. Set Root Directory to `Backend`
4. Add environment variables
5. Deploy!

That's it! Your Flask backend will work on Vercel! 🎉

