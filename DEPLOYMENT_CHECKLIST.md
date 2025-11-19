# 🚀 Full Stack Deployment Checklist

## Backend (Render)

### Files Ready ✅
- [x] `Procfile` - Gunicorn configuration
- [x] `runtime.txt` - Python 3.11.9
- [x] `requirements.txt` - All dependencies
- [x] Dynamic PORT binding
- [x] Production CORS config
- [x] Environment variable support

### Deploy Steps
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Root Directory: `python-backend`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`

3. **Set Environment Variables in Render**
   ```
   PIXIV_PHPSESSID=your_cookie
   FLASK_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_key
   ```

4. **Get Backend URL**
   - Example: `https://pixiv-backend.onrender.com`

## Frontend (Vercel/Netlify)

### Update Configuration
1. **Update `.env`**
   ```
   VITE_API_URL=https://pixiv-backend.onrender.com
   ```

2. **Build locally to test**
   ```bash
   npm run build
   npm run preview
   ```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Or connect GitHub repo in Vercel dashboard.

### Set Environment Variables in Vercel
```
VITE_API_URL=https://pixiv-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

## Database (Supabase)

### Already Set Up ✅
- [x] Tables created (users, download_history)
- [x] Authentication enabled
- [x] RLS policies configured

### Update URLs
Make sure both frontend and backend have correct Supabase URLs in their environment variables.

## Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Python backend is running",
  "pixiv_authenticated": true
}
```

### 2. Test Frontend
- Visit your Vercel URL
- Try to sign up/login
- Enter a Pixiv URL
- Check if images download

### 3. Check CORS
- Open browser console (F12)
- Look for CORS errors
- If errors, update `FRONTEND_URL` in Render

## Common Issues

### Backend won't start
- Check Render logs
- Verify `requirements.txt` is complete
- Ensure `Procfile` is in `python-backend/` folder

### CORS errors
- Update `FRONTEND_URL` in Render environment variables
- Format: `https://your-app.vercel.app` (no trailing slash)
- Redeploy backend after changing

### Pixiv authentication fails
- Cookie expired - get new `PHPSESSID` from browser
- Update in Render environment variables
- See `GET_TOKEN_BROWSER.md` for instructions

### Frontend can't reach backend
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is running (check health endpoint)
- Check Render logs for errors

## Cost Summary

**Free Tier:**
- Render: 750 hours/month (free)
- Vercel: Unlimited (free)
- Supabase: 500MB database (free)

**Total: $0/month** for testing and light usage

**Production:**
- Render Starter: $7/month (always on)
- Vercel Pro: $20/month (optional, for team features)
- Supabase Pro: $25/month (optional, for more storage)

## 🎉 You're Ready!

Your app is fully deployment-ready:
- ✅ Backend configured for Render
- ✅ Frontend ready for Vercel
- ✅ Database on Supabase
- ✅ Environment variables documented
- ✅ CORS properly configured
- ✅ All dependencies listed

Follow the steps above and you'll be live in ~15 minutes!
