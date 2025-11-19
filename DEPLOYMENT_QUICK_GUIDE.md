# ⚡ Quick Deployment Guide

## 🎯 The Connection in 3 Steps

### Step 1: Deploy Backend to Render
```
1. Push code to GitHub
2. Create Web Service on Render
3. Root Directory: python-backend
4. Get URL: https://YOUR-BACKEND.onrender.com
```

**Set these environment variables in Render:**
```
PIXIV_PHPSESSID=your_cookie
FLASK_ENV=production
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app  ← Will set in Step 2
```

### Step 2: Deploy Frontend to Vercel
```
1. Connect GitHub repo to Vercel
2. Deploy
3. Get URL: https://YOUR-FRONTEND.vercel.app
```

**Set these environment variables in Vercel:**
```
VITE_API_URL=https://YOUR-BACKEND.onrender.com  ← From Step 1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

### Step 3: Update Backend with Frontend URL
```
Go back to Render → Environment Variables
Update: FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
Redeploy backend
```

## 🔗 How They Connect

```
User → Vercel Frontend → Render Backend → Pixiv
```

**Frontend makes requests like:**
```javascript
fetch('https://YOUR-BACKEND.onrender.com/api/download/start')
```

**Backend allows requests from:**
```python
FRONTEND_URL = 'https://YOUR-FRONTEND.vercel.app'
```

## ✅ Test Connection

### 1. Test Backend
```bash
curl https://YOUR-BACKEND.onrender.com/api/health
```

### 2. Test Frontend
Visit: `https://YOUR-FRONTEND.vercel.app`
- Sign up/Login
- Enter Pixiv URL
- Click "Start Archive"
- Images should download!

## 🐛 Troubleshooting

### CORS Error?
```
Backend FRONTEND_URL must match Vercel URL exactly
No trailing slash!
```

### Can't connect?
```
Check VITE_API_URL in Vercel matches Render URL
Verify backend is running (health endpoint)
```

### Backend slow?
```
Free tier spins down after 15 min
First request takes ~30 seconds
Upgrade to Starter ($7/mo) for always-on
```

## 📋 Environment Variables Cheat Sheet

### Render (Backend)
| Variable | Example | Required |
|----------|---------|----------|
| PIXIV_PHPSESSID | 123456_abc... | ✅ Yes |
| FLASK_ENV | production | ✅ Yes |
| FRONTEND_URL | https://app.vercel.app | ✅ Yes |
| SUPABASE_URL | https://xxx.supabase.co | ⚠️ Optional |
| SUPABASE_KEY | eyJ... | ⚠️ Optional |

### Vercel (Frontend)
| Variable | Example | Required |
|----------|---------|----------|
| VITE_API_URL | https://backend.onrender.com | ✅ Yes |
| VITE_SUPABASE_URL | https://xxx.supabase.co | ✅ Yes |
| VITE_SUPABASE_ANON_KEY | eyJ... | ✅ Yes |

## 💡 Pro Tips

1. **Deploy backend first** - Get URL before deploying frontend
2. **No trailing slashes** - URLs should be `https://app.com` not `https://app.com/`
3. **Redeploy after env changes** - Both platforms need rebuild
4. **Check logs** - Render and Vercel dashboards show errors
5. **Test health endpoint** - Always verify backend is running

## 🎉 That's It!

Your app is now live:
- Frontend: `https://YOUR-APP.vercel.app`
- Backend: `https://YOUR-BACKEND.onrender.com`
- Database: Supabase (already configured)

Users can now archive Pixiv profiles from anywhere! 🚀
