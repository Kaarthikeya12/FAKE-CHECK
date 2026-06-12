# Fake Check Backend

## Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
SERPER_API_KEY=your-serper-api-key
PORT=5000
```

## Local Development

```bash
cd Backend
pip install -r requirements.txt
python app/app.py
```

## Render Deployment

### Important Settings in Render Dashboard:

1. **Root Directory**: Must be set to `Backend` ⚠️
2. **Build Command**: `pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt`
3. **Start Command**: 
   - If Root Directory is set to `Backend`: `gunicorn wsgi:app`
   - If Root Directory is empty: `cd Backend && gunicorn wsgi:app`
4. **Environment**: Python 3
5. **Python Version**: 3.11.0 (or latest)

### Step-by-Step:

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. **IMPORTANT**: In the service configuration:
   - **Root Directory**: Set to `Backend` (scroll down to find this setting!)
   - **Build Command**: `pip install --upgrade pip && pip install gunicorn && pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app` (if Root Directory is set to Backend)
4. Add environment variables in Render dashboard:
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `SERPER_API_KEY`
5. Deploy!

### If Root Directory Setting Doesn't Work:

If you can't find or set Root Directory, use this Build Command instead:
```bash
cd Backend && pip install --upgrade pip && pip install -r requirements.txt
```

And make sure Start Command is:
```bash
cd Backend && gunicorn wsgi:app
```

### Troubleshooting "No module named gunicorn":

**If you get this error, check:**

1. ✅ **Root Directory is set to `Backend`** (most common issue!)
   - Go to Settings → Scroll to "Root Directory"
   - Set it to: `Backend`
   - Save and redeploy

2. ✅ **Build Command is correct**
   - Should be: `pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt`
   - Check the build logs to see if requirements.txt is being found

3. ✅ **requirements.txt contains gunicorn**
   - Verify line 15 has: `gunicorn>=21.2.0`

4. ✅ **Check build logs**
   - Look for "Installing gunicorn" in the build output
   - If you see errors during pip install, fix those first

5. ✅ **Try manual build command in Render shell** (if available):
   ```bash
   cd Backend
   pip install -r requirements.txt
   python -c "import gunicorn; print(gunicorn.__version__)"
   ```

The service will be available at: `https://your-app-name.onrender.com`
