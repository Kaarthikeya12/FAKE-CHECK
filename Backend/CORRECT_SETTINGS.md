# CORRECT Settings for Render (Root Directory = Backend)

Since **Root Directory is set to `Backend`**, Render automatically runs all commands from the Backend directory.

## ✅ CORRECT Commands

### Build Command:
```
pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**NO `cd Backend &&` needed** - Render is already in the Backend directory!

### Start Command:
```
gunicorn wsgi:app
```

**NO `cd Backend &&` needed** - Render is already in the Backend directory!

---

## 📁 File Structure

Your files should be in:
```
Backend/
  ├── requirements.txt  ✅ (Correct location)
  ├── wsgi.py          ✅ (Correct location)
  ├── app/
  │   └── init.py
  └── ...
```

---

## 🔧 If Root Directory is NOT Set

If Root Directory is empty, then use:

**Build Command:**
```
cd Backend && pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt
```

**Start Command:**
```
cd Backend && gunicorn wsgi:app
```

---

## ✅ Current render.yaml

I've updated it to remove `cd Backend &&` from the build command since Root Directory is set to Backend.

**In Render Dashboard, use:**
- **Build Command**: `pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt`
- **Start Command**: `gunicorn wsgi:app` (or the absolute path version if needed)

