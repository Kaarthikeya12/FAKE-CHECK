# Quick Fix for "No module named gunicorn" Error

## The Problem
Render can't find or install gunicorn because it's looking in the wrong directory.

## The Solution (Do This Now!)

### In Render Dashboard:

1. **Go to your service** → Click **Settings**

2. **Find "Root Directory"** section (scroll down)

3. **Set Root Directory to**: `Backend`
   - This tells Render where your code is
   - If this is wrong, Render looks for `requirements.txt` in the wrong place!

4. **Verify Build Command** is:
   ```
   pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
   ```

5. **Verify Start Command** is:
   ```
   gunicorn wsgi:app
   ```

6. **Click "Save Changes"**

7. **Click "Manual Deploy"** → **"Deploy latest commit"**

8. **Wait for build to complete** - Check the logs to see if gunicorn installs

## What to Look For in Build Logs

You should see something like:
```
Collecting gunicorn>=21.2.0
  Downloading gunicorn-21.2.0-py3-none-any.whl
Installing collected packages: ... gunicorn ...
Successfully installed gunicorn-21.2.0
```

If you DON'T see gunicorn in the install list, the Root Directory is wrong!

## Still Not Working?

Try this alternative Build Command:
```
cd Backend && pip install --upgrade pip && pip install -r requirements.txt
```

This explicitly changes to the Backend directory first.

