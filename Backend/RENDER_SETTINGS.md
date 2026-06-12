# Render Settings - Copy These Exactly

## If Root Directory is Set to `Backend`:

**Build Command:**
```
pip install --upgrade pip && pip install -r requirements.txt
```

**Start Command:**
```
gunicorn wsgi:app
```

---

## If Root Directory is EMPTY or NOT SET:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

---

## Recommended: Use Root Directory = `Backend`

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to "Root Directory" 
3. Enter: `Backend`
4. Save
5. Use the first set of commands above
6. Redeploy

---

## Still Not Working? Try This Nuclear Option:

**Build Command:**
```
pip install --upgrade pip && pip install gunicorn==21.2.0 && pip install -r Backend/requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

This explicitly installs gunicorn first, then installs other requirements.

