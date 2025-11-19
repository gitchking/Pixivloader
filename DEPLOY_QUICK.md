# Quick Deployment Reference

## ✅ YES - You can deploy!

- **Frontend** → Vercel ✅
- **Backend** → Render ✅
- **Database** → Supabase ✅

---

## 🚀 Quick Steps

### 1. Supabase (5 min)
```sql
-- Run supabase-complete-setup.sql in SQL Editor
-- Get: URL, Anon Key, Service Key
```

### 2. Render (10 min)
```
Root Directory: python-backend
Build: pip install -r requirements.txt
Start: gunicorn app:app

ENV:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- PIXIV_PHPSESSID (from browser cookies)
- FRONTEND_URL (add after Vercel)
```

### 3. Vercel (5 min)
```
Framework: Vite
Build: npm run build
Output: dist

ENV:
- VITE_API_URL (your Render URL)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

### 4. Update CORS
```
Go to Render → Environment
Update FRONTEND_URL to your Vercel URL
```

---

## 📋 Checklist

- [ ] Run SQL script in Supabase
- [ ] Deploy backend to Render
- [ ] Get PIXIV_PHPSESSID cookie
- [ ] Deploy frontend to Vercel
- [ ] Update CORS in Render
- [ ] Test: Visit Vercel URL
- [ ] Test: Sign up & download

---

## 🔑 Required Secrets

1. **PIXIV_PHPSESSID**: Login to Pixiv → F12 → Application → Cookies → Copy PHPSESSID
2. **SUPABASE_SERVICE_KEY**: Supabase → Settings → API → service_role key
3. **SUPABASE_ANON_KEY**: Supabase → Settings → API → anon public key

---

## ⚡ URLs You'll Need

After deployment, you'll have:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: `https://xxx.supabase.co`

---

## 🐛 Quick Fixes

**Backend won't start?**
→ Check PIXIV_PHPSESSID is set

**CORS errors?**
→ Update FRONTEND_URL in Render

**Can't login?**
→ Check Supabase redirect URLs

**Slow backend?**
→ Render free tier has cold starts (upgrade to $7/mo)

---

See `DEPLOYMENT_GUIDE.md` for detailed instructions!
