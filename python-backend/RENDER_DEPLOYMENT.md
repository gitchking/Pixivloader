# Deploy Python Backend to Render

## ✅ Pre-Deployment Checklist

Your backend is now **Render-ready** with:
- ✅ Procfile for Gunicorn
- ✅ runtime.txt for Python version
- ✅ requirements.txt with all dependencies
- ✅ Environment variable support
- ✅ Dynamic PORT binding
- ✅ Production CORS configuration

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### 2. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `pixiv-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `python-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (auto-detected from Procfile)
   - **Instance Type**: Free or Starter

### 3. Set Environment Variables

In Render dashboard, add these environment variables:

**Required:**
```
PIXIV_PHPSESSID=your_cookie_here
FLASK_ENV=production
```

**Optional (for Supabase):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

**Frontend URL (for CORS):**
```
FRONTEND_URL=https://your-frontend.vercel.app
```

### 4. Deploy

Click **"Create Web Service"** - Render will:
1. Clone your repo
2. Install dependencies
3. Start with Gunicorn
4. Provide a URL like: `https://pixiv-backend.onrender.com`

## 🔧 Post-Deployment

### Update Frontend

Update your frontend `.env`:
```
VITE_API_URL=https://pixiv-backend.onrender.com
```

### Test Endpoints

```bash
# Health check
curl https://pixiv-backend.onrender.com/api/health

# Should return:
{
  "status": "ok",
  "message": "Python backend is running",
  "pixiv_authenticated": true,
  "session_cookies": true
}
```

## ⚠️ Important Notes

### Free Tier Limitations
- **Spins down after 15 min inactivity** - First request will be slow
- **750 hours/month free** - Enough for testing
- Consider **Starter plan ($7/mo)** for production

### Cookie Management
- Your `PIXIV_PHPSESSID` cookie expires periodically
- Update it in Render environment variables when needed
- Monitor the health endpoint to check authentication status

### CORS Configuration
- Backend automatically allows your `FRONTEND_URL`
- Update `FRONTEND_URL` env var if you change frontend domain
- In development, localhost URLs are automatically allowed

## 🐛 Troubleshooting

### "Application failed to respond"
- Check logs in Render dashboard
- Verify `PORT` environment variable is not set (Render provides it)
- Ensure Gunicorn is starting: `gunicorn app:app`

### "CORS error"
- Add your frontend URL to `FRONTEND_URL` environment variable
- Format: `https://your-app.vercel.app` (no trailing slash)

### "Pixiv authentication failed"
- Update `PIXIV_PHPSESSID` in environment variables
- Get fresh cookie from browser (see GET_TOKEN_BROWSER.md)

### "Module not found"
- Check `requirements.txt` has all dependencies
- Trigger manual deploy in Render dashboard

## 📊 Monitoring

Check these in Render dashboard:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Response time
- **Events**: Deployment history

## 🔄 Updates

To deploy updates:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render auto-deploys on push to main branch.

## 💰 Cost Estimate

**Free Tier:**
- 750 hours/month
- Spins down after inactivity
- Perfect for testing

**Starter ($7/mo):**
- Always on
- Better performance
- Recommended for production

## 🎯 Next Steps

1. Deploy backend to Render
2. Get the backend URL
3. Update frontend `VITE_API_URL`
4. Deploy frontend to Vercel/Netlify
5. Test end-to-end
