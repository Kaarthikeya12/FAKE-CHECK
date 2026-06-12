# CRITICAL FIX - "No module named 'wsgi'" Error

## The Problem
The error shows gunicorn is running from `/opt/render/project/src/` (project root) instead of `/opt/render/project/src/Backend/`. This means **Root Directory is NOT set correctly** in Render.

## The Solution

You have TWO options:

### Option 1: Set Root Directory (RECOMMENDED)

1. Go to Render Dashboard → Your Service → **Settings**
2. Find **"Root Directory"** (scroll down)
3. Set it to: `Backend`
4. **Build Command:**
   ```
   pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
   ```
5. **Start Command:**
   ```
   gunicorn wsgi:app
   ```
6. **Save and Redeploy**

### Option 2: Don't Set Root Directory (Use These Commands)

If you CAN'T set Root Directory, use these commands:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

---

## Current render.yaml Settings

The `render.yaml` file now uses Option 2 (with `cd Backend &&`). This works whether Root Directory is set or not.

**BUT** - If you set Root Directory to `Backend` in Render dashboard, you should REMOVE `cd Backend &&` from the commands in the dashboard, because Render will already be in that directory.

---

## How to Check What's Happening

Look at the error path:
- ❌ `/opt/render/project/src/` = Root Directory NOT set (or set incorrectly)
- ✅ `/opt/render/project/src/Backend/` = Root Directory set correctly

---

## Quick Fix Steps

1. **Check Root Directory setting** in Render Dashboard
2. **If it's empty or wrong:**
   - Set it to `Backend`
   - Use commands WITHOUT `cd Backend &&`
3. **If you can't set it:**
   - Use commands WITH `cd Backend &&` (like in render.yaml)
4. **Redeploy**

---

## Verify It Works

After redeploying, check logs. You should see:
```
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:10000
```

If you still see "No module named 'wsgi'", the working directory is still wrong.

