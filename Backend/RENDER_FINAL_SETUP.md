# Final Render Setup - Copy These Settings

## ✅ CORRECT Settings for Render Dashboard

### Step 1: Set Root Directory
1. Go to Render Dashboard → Your Service → **Settings**
2. Scroll to **"Root Directory"** section
3. Enter: `Backend`
4. **Save Changes**

### Step 2: Build Command
```
pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

### Step 3: Start Command
```
gunicorn wsgi:app
```

**Important**: If Root Directory is set to `Backend`, you do NOT need `cd Backend` in the start command!

---

## ❌ If Root Directory is NOT Set

If you can't set Root Directory (or it's empty), use these instead:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

---

## 🔍 How to Verify

After deploying, check the logs. You should see:

✅ **Success looks like:**
```
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:10000
[INFO] Application startup complete.
```

❌ **Error looks like:**
```
ModuleNotFoundError: No module named 'wsgi'
```
→ This means Root Directory is wrong or start command needs `cd Backend`

---

## 📋 Checklist

- [ ] Root Directory = `Backend` (in Settings)
- [ ] Build Command includes `pip install gunicorn`
- [ ] Start Command = `gunicorn wsgi:app` (if Root Directory is set)
- [ ] All environment variables are set
- [ ] Service redeployed after changes

---

## 🚀 Quick Fix

If you're still getting errors:

1. **Delete the service** in Render
2. **Create a new Web Service**
3. **Set Root Directory to `Backend`** during creation
4. Use the commands from Step 2 and 3 above
5. Deploy

This ensures a clean start with correct settings.

