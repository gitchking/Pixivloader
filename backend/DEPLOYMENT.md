# Deployment Guide

## Backend Deployment on Render

### Step 1: Prepare Your Repository

1. Push the `backend` folder to your GitHub repository
2. Make sure all files are committed

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- Name: `pixivloader-backend`
- Root Directory: `backend`
- Environment: `Node`
- Region: Choose closest to your users
- Branch: `main` (or your default branch)

**Build & Deploy:**
- Build Command: `npm install`
- Start Command: `npm start`

**Instance Type:**
- Free (for testing)
- Starter or higher (for production - includes more resources)

### Step 3: Add Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://qkxauxnpwbshsjbbonrt.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

Your backend will be available at: `https://pixivloader-backend.onrender.com`

---

## Frontend Deployment on Vercel

### Step 1: Prepare Environment Variables

Create a `.env.production` file or set in Vercel dashboard:

```
VITE_API_URL=https://pixivloader-backend.onrender.com
```

### Step 2: Deploy on Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./` (project root, not backend)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variable:
   - `VITE_API_URL` = `https://pixivloader-backend.onrender.com`

6. Click "Deploy"

Your frontend will be available at: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

After deploying frontend, update the backend's `FRONTEND_URL` environment variable in Render:

```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Testing the Connection

1. Visit your Vercel frontend URL
2. Login/Signup
3. Try to archive a Pixiv profile
4. Check the History page for status updates

---

## Troubleshooting

### Backend Issues

**Puppeteer not working:**
- Render's free tier includes Chrome
- Make sure you're using the correct Puppeteer args (already configured)

**Timeout errors:**
- Increase Render plan for better performance
- Or reduce the number of artworks scraped (currently limited to 50)

**Environment variables not working:**
- Double-check all variables are set in Render dashboard
- Restart the service after adding variables

### Frontend Issues

**CORS errors:**
- Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include protocol (https://)

**API connection failed:**
- Check `VITE_API_URL` is set correctly
- Make sure backend is running (check Render logs)

**Build errors:**
- Run `npm run build` locally first to catch errors
- Check Vercel build logs

### Database Issues

**History not updating:**
- Check Supabase credentials in backend
- Verify RLS policies are set correctly
- Check backend logs in Render

---

## Monitoring

### Backend Logs (Render)
- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor for errors

### Frontend Logs (Vercel)
- Go to your project in Vercel dashboard
- Click "Deployments" → Select deployment → "Functions" tab
- Check for runtime errors

### Database (Supabase)
- Go to Supabase dashboard
- Check "Table Editor" for download_history
- Monitor "Logs" for database queries

---

## Scaling

### Backend
- Upgrade Render plan for:
  - More CPU/RAM
  - Faster scraping
  - No cold starts
  - Better reliability

### Frontend
- Vercel automatically scales
- Consider Pro plan for:
  - Better analytics
  - More bandwidth
  - Priority support

### Database
- Supabase free tier: 500MB, 2GB bandwidth
- Upgrade for more storage and connections
