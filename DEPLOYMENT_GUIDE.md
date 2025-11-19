# Pixivloader Deployment Guide

## ✅ Deployment Readiness Analysis

Your project is **READY** to deploy to Vercel (frontend) and Render (backend)!

---

## 📋 Pre-Deployment Checklist

### ✅ Frontend (Vercel)
- [x] Build script configured (`npm run build`)
- [x] Vite configuration ready
- [x] Environment variables identified
- [x] React Router configured
- [x] API URL uses environment variable
- [x] All dependencies in package.json

### ✅ Backend (Render)
- [x] Procfile configured (`gunicorn app:app`)
- [x] requirements.txt complete
- [x] runtime.txt specifies Python 3.11.9
- [x] Flask app properly structured
- [x] CORS configured for production
- [x] Environment variables identified

### ✅ Database (Supabase)
- [x] Complete SQL setup script
- [x] RLS policies configured
- [x] Storage bucket setup
- [x] Triggers and functions ready

---

## 🚀 Deployment Steps

### 1. Deploy Database (Supabase)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run `supabase-complete-setup.sql`
5. Verify with the verification queries in the script
6. Note your:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: Found in Settings → API
   - Service Role Key: Found in Settings → API (keep secret!)

---

### 2. Deploy Backend (Render)

#### A. Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository: `Pixivloader`

#### B. Configure Service

**Basic Settings:**
- **Name**: `pixivloader-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `python-backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

#### C. Environment Variables

Add these in Render dashboard:

```env
# Server
PORT=10000
FLASK_ENV=production

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# CORS - Add your Vercel URL after frontend deployment
FRONTEND_URL=https://your-app.vercel.app

# Pixiv Authentication (REQUIRED)
PIXIV_PHPSESSID=your_phpsessid_cookie
```

**How to get PIXIV_PHPSESSID:**
1. Login to Pixiv in your browser
2. Open DevTools (F12) → Application → Cookies
3. Find `PHPSESSID` cookie
4. Copy the value

#### D. Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://pixivloader-backend.onrender.com`

---

### 3. Deploy Frontend (Vercel)

#### A. Create New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select `Pixivloader`

#### B. Configure Project

**Framework Preset:** Vite
**Root Directory:** `./` (leave as root)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

#### C. Environment Variables

Add these in Vercel dashboard:

```env
# Backend API URL (use your Render URL)
VITE_API_URL=https://pixivloader-backend.onrender.com

# Supabase (same as backend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### D. Deploy

1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

---

### 4. Update Backend CORS

After frontend is deployed:

1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment**
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Save and redeploy

---

## 🔧 Post-Deployment Configuration

### Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 🧪 Testing Your Deployment

### 1. Test Backend
```bash
curl https://pixivloader-backend.onrender.com/api/health
```
Should return: `{"status": "ok", ...}`

### 2. Test Frontend
1. Visit your Vercel URL
2. Sign up for an account
3. Try downloading a Pixiv profile
4. Check download history
5. Test profile settings

---

## 📝 Environment Variables Summary

### Frontend (.env on Vercel)
```env
VITE_API_URL=https://pixivloader-backend.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env on Render)
```env
PORT=10000
FLASK_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
FRONTEND_URL=https://your-app.vercel.app
PIXIV_PHPSESSID=your_phpsessid_cookie
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `PIXIV_PHPSESSID` is valid

**Problem**: CORS errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Check Render logs for CORS configuration

**Problem**: Pixiv authentication failed
- Get a fresh `PHPSESSID` cookie from Pixiv
- Update environment variable in Render
- Redeploy

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` is correct
- Check if backend is running (visit /api/health)
- Check browser console for errors

**Problem**: Supabase errors
- Verify Supabase URL and keys are correct
- Check if SQL script was run successfully
- Verify RLS policies are active

**Problem**: Authentication not working
- Check Supabase redirect URLs
- Verify email confirmation is disabled (or check email)
- Check browser console for errors

---

## 🔄 Updating Your Deployment

### Frontend Updates
1. Push changes to GitHub
2. Vercel auto-deploys from `main` branch
3. Check deployment status in Vercel dashboard

### Backend Updates
1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Check deployment logs in Render dashboard

---

## 💰 Cost Estimate

### Free Tier Limits

**Vercel (Free)**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

**Render (Free)**
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts (10-30 seconds)
- ✅ Automatic HTTPS

**Supabase (Free)**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

### Upgrade Recommendations

For production use:
- **Render**: $7/month (no cold starts, always on)
- **Supabase**: $25/month (more storage, better performance)
- **Vercel**: Free tier is usually sufficient

---

## 🎉 Success!

Your Pixivloader app is now live! Share your deployment URL and start archiving Pixiv portfolios.

### Next Steps

1. Set up custom domain (optional)
2. Configure email templates in Supabase
3. Monitor usage in dashboards
4. Set up error tracking (Sentry, etc.)
5. Add analytics (Google Analytics, Plausible, etc.)

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Render/Vercel logs
3. Check Supabase logs
4. Verify all environment variables
5. Test backend health endpoint

## 🔐 Security Notes

- Never commit `.env` files
- Keep `SUPABASE_SERVICE_KEY` secret
- Rotate `PIXIV_PHPSESSID` regularly
- Use strong passwords for Supabase
- Enable 2FA on all services
