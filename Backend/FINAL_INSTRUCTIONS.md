# FINAL INSTRUCTIONS - Root Directory = Backend

## ✅ What You Need to Do in Render Dashboard

Since **Root Directory is set to `Backend`**, use these EXACT commands:

### Build Command:
```
pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

### Start Command:
```
gunicorn wsgi:app
```

**DO NOT** include `cd Backend &&` - Render is already in that directory!

---

## 🔧 If It Still Doesn't Work

The error shows it's running from the wrong directory. Try these alternatives:

### Option 1: Force Directory Change in Start Command
```
cd /opt/render/project/src/Backend && gunicorn wsgi:app
```

### Option 2: Use Python Path
```
PYTHONPATH=/opt/render/project/src/Backend:$PYTHONPATH gunicorn wsgi:app
```

### Option 3: Verify Root Directory
1. Go to Settings
2. Check Root Directory - it should say exactly: `Backend`
3. If it's different, change it to `Backend`
4. **Save Changes**
5. **Manually trigger a new deploy** (click "Manual Deploy")

---

## 📝 Updated wsgi.py

I've updated `wsgi.py` to be more robust - it now:
- Gets the absolute path of its own directory
- Changes the working directory to where wsgi.py is located
- Adds the directory to Python path

This should work even if Render runs from the wrong directory initially.

---

## ✅ After Updating

1. **Commit and push** the updated `wsgi.py` to GitHub
2. **In Render Dashboard**, update the Start Command to: `gunicorn wsgi:app`
3. **Save and Redeploy**
4. **Check logs** - you should see gunicorn starting successfully

---

## 🚨 Last Resort

If nothing works, the Root Directory setting might not be working. Try this:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

And **remove** the Root Directory setting (set it to empty).

