# URGENT FIX - Root Directory Not Working

The error shows gunicorn is running from `/opt/render/project/src/` instead of `/opt/render/project/src/Backend/`. This means **Root Directory setting is NOT being applied**.

## ✅ SOLUTION: Use Commands with `cd Backend &&`

Since Root Directory isn't working, we need to explicitly change directory in the commands.

### In Render Dashboard - Use These EXACT Commands:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

**Root Directory:** 
- Set it to **EMPTY** (or remove it)
- OR leave it as `Backend` - the `cd Backend &&` will work either way

---

## 🔧 Alternative: Use Absolute Path

If `cd Backend &&` doesn't work, try absolute path:

**Start Command:**
```
cd /opt/render/project/src/Backend && gunicorn wsgi:app
```

---

## 📝 What I've Updated

1. ✅ Updated `render.yaml` to use `cd Backend &&` in both commands
2. ✅ Updated `Procfile` to use `cd Backend &&`
3. ✅ Updated `wsgi.py` to handle path issues

---

## 🚀 Steps to Fix

1. **Go to Render Dashboard** → Your Service → Settings
2. **Update Build Command** to:
   ```
   cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
   ```
3. **Update Start Command** to:
   ```
   cd Backend && gunicorn wsgi:app
   ```
4. **Save Changes**
5. **Redeploy**

---

## ✅ Verification

After redeploying, check logs. You should see:
```
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:10000
```

If you still see "No module named 'wsgi'", try the absolute path version above.

