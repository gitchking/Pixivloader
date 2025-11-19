# 🔗 How Frontend (Vercel) & Backend (Render) Connect

## Simple Answer

They connect through **HTTP requests** using URLs. The frontend makes API calls to the backend's public URL.

## Visual Flow

```
User Browser
    ↓
Frontend (Vercel)
https://your-app.vercel.app
    ↓
    | Makes HTTP requests to:
    | https://your-backend.onrender.com/api/...
    ↓
Backend (Render)
https://your-backend.onrender.com
    ↓
Pixiv API
```

## Step-by-Step Connection

### 1. **Deploy Backend to Render**

After deployment, Render gives you a URL:
```
https://pixiv-backend-abc123.onrender.com
```

### 2. **Configure Frontend Environment Variable**

In Vercel, set this environment variable:
```
VITE_API_URL=https://pixiv-backend-abc123.onrender.com
```

### 3. **Frontend Makes Requests**

Your frontend code (Index.tsx) does this:
```typescript
const API_URL = import.meta.env.VITE_API_URL; // Gets Render URL
const response = await fetch(`${API_URL}/api/download/start`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: pixivUrl })
});
```

### 4. **Backend Allows Frontend (CORS)**

Backend checks if request is from allowed origin:
```python
# In app.py
FRONTEND_URL = os.getenv('FRONTEND_URL')  # Your Vercel URL
CORS(app, origins=[FRONTEND_URL])
```

## Configuration Checklist

### Backend (Render) Environment Variables:
```bash
PIXIV_PHPSESSID=your_cookie_here
FLASK_ENV=production
FRONTEND_URL=https://your-app.vercel.app  # ← Your Vercel URL
```

### Frontend (Vercel) Environment Variables:
```bash
VITE_API_URL=https://your-backend.onrender.com  # ← Your Render URL
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

## Real Example

Let's say you deploy:

**Backend on Render:**
- URL: `https://pixiv-backend-xyz.onrender.com`

**Frontend on Vercel:**
- URL: `https://pixiv-app.vercel.app`

### Configuration:

**In Render (Backend):**
```
FRONTEND_URL=https://pixiv-app.vercel.app
```

**In Vercel (Frontend):**
```
VITE_API_URL=https://pixiv-backend-xyz.onrender.com
```

### What Happens:

1. User visits: `https://pixiv-app.vercel.app`
2. User enters Pixiv URL and clicks "Start Archive"
3. Frontend makes request to: `https://pixiv-backend-xyz.onrender.com/api/download/start`
4. Backend checks: "Is request from `https://pixiv-app.vercel.app`?" ✅ Yes (CORS allows it)
5. Backend processes request and returns image URLs
6. Frontend downloads images through: `https://pixiv-backend-xyz.onrender.com/api/download/image`

## Testing the Connection

### 1. Test Backend Directly
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

### 2. Test from Frontend
Open browser console (F12) on your Vercel site and run:
```javascript
fetch('https://your-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should show the same response.

### 3. Check CORS
If you see this error:
```
Access to fetch at 'https://backend.onrender.com/api/...' 
from origin 'https://app.vercel.app' has been blocked by CORS policy
```

**Fix:** Update `FRONTEND_URL` in Render to match your Vercel URL exactly.

## Common Issues & Solutions

### ❌ "Failed to fetch"
**Problem:** Frontend can't reach backend
**Solution:** 
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is running (visit health endpoint)
- Check Render logs for errors

### ❌ "CORS policy blocked"
**Problem:** Backend doesn't allow frontend's origin
**Solution:**
- Set `FRONTEND_URL` in Render to your Vercel URL
- Format: `https://your-app.vercel.app` (no trailing slash)
- Redeploy backend after changing

### ❌ "Backend not responding"
**Problem:** Render free tier spun down (after 15 min inactivity)
**Solution:**
- First request wakes it up (~30 seconds)
- Upgrade to Starter plan ($7/mo) for always-on
- Or accept the cold start delay

### ❌ "Environment variable not found"
**Problem:** Vercel didn't rebuild with new env vars
**Solution:**
- After adding env vars in Vercel, trigger a new deployment
- Or: Settings → Deployments → Redeploy

## Security Notes

### ✅ What's Secure:
- HTTPS on both Vercel and Render (encrypted)
- CORS prevents unauthorized domains
- Environment variables hidden from client
- Supabase handles authentication

### ⚠️ What to Protect:
- Never commit `.env` files to Git
- Keep `PIXIV_PHPSESSID` secret
- Rotate cookie when it expires
- Use Supabase RLS policies

## Quick Deploy Commands

### Deploy Backend:
```bash
# Already configured - just push
git add .
git commit -m "Deploy backend"
git push origin main

# Render auto-deploys from GitHub
# Get URL: https://dashboard.render.com
```

### Deploy Frontend:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard
```

### Update Environment Variables:
```bash
# Vercel CLI
vercel env add VITE_API_URL

# Or use dashboard:
# https://vercel.com/your-project/settings/environment-variables
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Frontend (Vercel)                           │
│         https://your-app.vercel.app                      │
│                                                           │
│  - React UI                                              │
│  - Makes API calls using VITE_API_URL                   │
│  - Handles user authentication (Supabase)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP POST/GET
                     │ to: VITE_API_URL/api/...
                     ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Render)                              │
│      https://your-backend.onrender.com                   │
│                                                           │
│  - Flask API                                             │
│  - Checks CORS (FRONTEND_URL)                           │
│  - Authenticates with Pixiv (PHPSESSID)                │
│  - Proxies image downloads                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP requests with cookie
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Pixiv API                               │
│            https://www.pixiv.net                         │
└─────────────────────────────────────────────────────────┘
```

## TL;DR

1. **Backend URL** → Set in Vercel as `VITE_API_URL`
2. **Frontend URL** → Set in Render as `FRONTEND_URL`
3. Frontend makes HTTP requests to backend
4. Backend checks CORS and processes requests
5. Both communicate over HTTPS (secure)

**That's it!** They're just two web servers talking to each other via HTTP. 🚀
