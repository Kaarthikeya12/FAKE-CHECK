# Project Structure for Deployment

## Final Folder Structure

```
FAKE-CHECK/
│
├── Backend/                          # Deploy to Render
│   ├── app/
│   │   ├── __init__.py
│   │   ├── init.py                   # Flask app factory
│   │   ├── app.py                    # Local development entry
│   │   ├── routes.py                 # API routes
│   │   ├── list.py
│   │   ├── services/
│   │   │   ├── factcheck_service.py
│   │   │   ├── image_verification_service.py
│   │   │   └── realtime_verification_service.py
│   │   └── utils/
│   │       └── config.py
│   ├── uploads/                      # Upload directory
│   ├── wsgi.py                       # ⭐ Render entry point
│   ├── render.yaml                   # ⭐ Render configuration
│   ├── Procfile                      # ⭐ Process file for Render
│   ├── requirements.txt              # Python dependencies (includes gunicorn)
│   └── README.md                     # Backend deployment guide
│
├── frontend/                         # Deploy to Vercel
│   ├── src/
│   │   ├── app/                      # Next.js app directory
│   │   ├── components/
│   │   ├── firebase/
│   │   └── lib/
│   │       └── api.ts                # API client (uses NEXT_PUBLIC_API_URL)
│   ├── public/
│   ├── vercel.json                    # ⭐ Vercel configuration
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── README.md                     # Frontend deployment guide
│
├── DEPLOYMENT.md                     # Complete deployment guide
└── README.md                         # Main project README
```

## Key Files for Deployment

### Backend (Render)
- **`Backend/wsgi.py`**: WSGI entry point for production server
- **`Backend/render.yaml`**: Render service configuration
- **`Backend/Procfile`**: Process definition for Render
- **`Backend/requirements.txt`**: Includes `gunicorn` for production

### Frontend (Vercel)
- **`frontend/vercel.json`**: Vercel deployment configuration
- **`frontend/src/lib/api.ts`**: Uses `NEXT_PUBLIC_API_URL` environment variable

## Environment Variables

### Backend (Render Dashboard)
```
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
SERPER_API_KEY=your-serper-api-key
PORT=10000 (auto-set by Render)
```

### Frontend (Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com
```

## Deployment URLs

After deployment:
- **Backend**: `https://your-backend-app.onrender.com`
- **Frontend**: `https://your-frontend-app.vercel.app`

Make sure to update `NEXT_PUBLIC_API_URL` in Vercel to point to your Render backend URL!

