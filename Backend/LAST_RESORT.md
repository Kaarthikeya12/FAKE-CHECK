# LAST RESORT Solutions

Since `--chdir Backend` can't find the directory, try these:

## Solution 1: Absolute Path with bash -c

**Start Command:**
```
bash -c "cd /opt/render/project/src/Backend && gunicorn wsgi:app"
```

This explicitly changes to the absolute path before running gunicorn.

## Solution 2: Use the Startup Script

**Start Command:**
```
bash Backend/start.sh
```

The script handles path detection automatically.

## Solution 3: Remove Root Directory Setting

1. **In Render Dashboard**, set Root Directory to **EMPTY** (remove it)
2. **Start Command:**
   ```
   cd Backend && gunicorn wsgi:app
   ```

## Solution 4: Move wsgi.py to Root (Nuclear Option)

If nothing works, restructure:

1. **Copy** `Backend/wsgi.py` to project root (same level as Backend folder)
2. **Update** the root wsgi.py:
   ```python
   import sys
   from pathlib import Path
   
   # Add Backend to path
   backend_path = Path(__file__).parent / "Backend"
   sys.path.insert(0, str(backend_path))
   
   # Change to Backend directory
   import os
   os.chdir(str(backend_path))
   
   from app.init import create_app
   app = create_app()
   ```
3. **Start Command:**
   ```
   gunicorn wsgi:app
   ```
4. **Root Directory:** Leave empty or set to project root

## Current render.yaml

I've updated it to use: `bash -c "cd /opt/render/project/src/Backend && gunicorn wsgi:app"`

This should work because it uses the absolute path that Render uses.

