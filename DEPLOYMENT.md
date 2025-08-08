# Railway Deployment Guide

## Quick Deploy to Railway

### Prerequisites
1. GitHub account
2. Railway account (sign up at railway.app)

### Deployment Steps

#### 1. Backend Deployment
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will detect the Dockerfile in `/backend`
5. Add environment variables:
   - `DATABASE_URL` (Railway will auto-provide PostgreSQL)
   - `ENVIRONMENT=production`
6. Deploy

#### 2. Frontend Deployment
1. Create new service in same project
2. Select `/frontend` folder
3. Railway will auto-detect React app
4. Set build command: `npm run build`
5. Set environment variable: `REACT_APP_API_URL=<your-backend-url>`
6. Deploy

#### 3. Database
- Railway automatically provisions PostgreSQL
- Connection string provided as `DATABASE_URL`
- No manual setup required

### Environment Variables Needed

**Backend:**
```
DATABASE_URL=postgresql://...  (auto-provided by Railway)
ENVIRONMENT=production
```

**Frontend:**
```
REACT_APP_API_URL=https://your-backend.railway.app
```

### Custom Domain (Optional)
- Railway provides: `your-app.railway.app`
- Custom domain: Settings → Domains → Add custom domain

## Alternative: Render Deployment

### Backend on Render
1. Connect GitHub repo
2. Create Web Service
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend on Render
1. Create Static Site
2. Build Command: `npm run build`
3. Publish Directory: `build`

## Alternative: Vercel + Supabase

### Frontend (Vercel)
1. Connect GitHub to Vercel
2. Auto-deploy React app
3. Set environment variables

### Backend + Database (Supabase)
1. Create Supabase project
2. Use Supabase Edge Functions for API
3. Built-in PostgreSQL database
