# Render Deployment Troubleshooting

## Error: "No module named gunicorn"

This error means gunicorn wasn't installed during the build process. Follow these steps:

### Step 1: Verify Root Directory ⚠️ MOST IMPORTANT

1. Go to your Render service dashboard
2. Click on **Settings**
3. Scroll down to **"Root Directory"**
4. **MUST be set to**: `Backend` (exactly, case-sensitive)
5. If it's empty or set to something else, change it to `Backend`
6. **Save** and **Redeploy**

### Step 2: Verify Build Command

In Render Settings → Build & Deploy, the Build Command should be:
```
pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
```

### Step 3: Check Build Logs

1. Go to your service → **Logs** tab
2. Look for the build section
3. You should see:
   ```
   Installing collected packages: ... gunicorn ...
   ```
4. If you don't see gunicorn being installed, the build failed silently

### Step 4: Verify requirements.txt Location

The `requirements.txt` file MUST be in the `Backend/` directory:
```
Backend/
  ├── requirements.txt  ← Must be here
  ├── wsgi.py
  ├── Procfile
  └── app/
```

### Step 5: Manual Verification

If you have SSH access to Render (paid plans), you can verify:
```bash
cd Backend
ls -la requirements.txt  # Should exist
pip list | grep gunicorn  # Should show gunicorn
```

### Step 6: Alternative Build Command

If the above doesn't work, try this build command:
```bash
cd Backend && pip install --upgrade pip && pip install -r requirements.txt
```

Or use absolute path:
```bash
pip install --upgrade pip && pip install -r /opt/render/project/src/Backend/requirements.txt
```

### Step 7: Check Python Version

Make sure Python version is set correctly:
- In Render Settings → Environment Variables
- Add: `PYTHON_VERSION` = `3.11.0`
- Or use `runtime.txt` file (already created)

## Still Not Working?

1. **Delete and recreate the service** - Sometimes Render caches old settings
2. **Check GitHub repository** - Make sure all files are committed and pushed
3. **Verify file encoding** - requirements.txt should be UTF-8, not Windows-1252
4. **Contact Render Support** - They can check server-side logs

## Quick Fix Checklist

- [ ] Root Directory = `Backend`
- [ ] Build Command includes `pip install -r requirements.txt`
- [ ] requirements.txt exists in Backend/ folder
- [ ] requirements.txt contains `gunicorn>=21.2.0`
- [ ] All files committed to GitHub
- [ ] Service redeployed after changes

