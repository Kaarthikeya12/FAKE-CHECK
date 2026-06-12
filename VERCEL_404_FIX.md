# Fix for Vercel 404 Error

## The Problem

Getting 404 NOT_FOUND means Vercel can't find the routes. This is usually because:

1. **Routing configuration** - Routes don't match
2. **Build configuration** - Backend not being built correctly
3. **Function export** - Flask app not exported correctly

## ✅ Solution

I've updated:
1. `Backend/api/index.py` - Simplified to just export the Flask app
2. `vercel.json` - Fixed routing paths

## 🔧 Alternative: Use API Routes Structure

If the current setup still doesn't work, try this structure:

### Option 1: Move to `api/` folder at root

Create `api/index.py` at project root (not in Backend):

```python
import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent / "Backend"
sys.path.insert(0, str(backend_path))
os.chdir(str(backend_path))

from app.init import create_app
app = create_app()
```

Then update `vercel.json`:
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/verify/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/health",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### Option 2: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Check **Build Logs** for errors
4. Look for Python build errors or import errors

### Option 3: Verify File Structure

Make sure these files exist:
- ✅ `Backend/api/index.py`
- ✅ `Backend/app/init.py`
- ✅ `Backend/requirements.txt`
- ✅ `vercel.json` (at root)

## 🚀 Quick Fix Steps

1. **Commit the updated files:**
   ```bash
   git add Backend/api/index.py vercel.json
   git commit -m "Fix Vercel 404 routing"
   git push
   ```

2. **Redeploy in Vercel:**
   - Go to Vercel Dashboard
   - Click "Redeploy" on your project
   - Or push to trigger auto-deploy

3. **Test the routes:**
   - `https://your-project.vercel.app/health`
   - `https://your-project.vercel.app/verify/text` (POST)

## 📝 Check These

1. **Root Directory in Vercel**: Should be **EMPTY** (deploy from root)
2. **Environment Variables**: Make sure they're set
3. **Build Logs**: Check for Python import errors
4. **Function Logs**: Check runtime logs for errors

## 🔍 Debug

If still getting 404:

1. Check Vercel Function Logs
2. Try accessing `/health` endpoint directly
3. Verify the Flask app is being created correctly
4. Check if routes are registered properly

Let me know what you see in the build/runtime logs!

