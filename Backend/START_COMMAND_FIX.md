# Fix for "No module named 'wsgi'" Error

This error means gunicorn can't find wsgi.py because it's running from the wrong directory.

## Solution: Choose ONE of these options

### Option 1: Set Root Directory to `Backend` (RECOMMENDED)

1. Go to Render Dashboard → Your Service → Settings
2. Set **Root Directory** to: `Backend`
3. **Start Command** should be:
   ```
   gunicorn wsgi:app
   ```
   (NO `cd Backend` needed if Root Directory is set!)

4. Save and redeploy

### Option 2: Don't Set Root Directory

If Root Directory is **empty** or **not set**:

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

This explicitly changes to the Backend directory first.

---

## Current Settings in render.yaml

The `render.yaml` file now uses:
```
startCommand: cd Backend && gunicorn wsgi:app
```

This works whether Root Directory is set or not.

## In Render Dashboard

**If Root Directory = `Backend`:**
- Start Command: `gunicorn wsgi:app`

**If Root Directory = empty:**
- Start Command: `cd Backend && gunicorn wsgi:app`

---

## Quick Test

After updating, check the logs. You should see:
```
[INFO] Starting gunicorn ...
[INFO] Listening at: http://0.0.0.0:10000
```

If you still see "No module named 'wsgi'", the working directory is still wrong.

