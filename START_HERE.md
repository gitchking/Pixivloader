# 🚀 START HERE - Complete Setup Guide

Follow these steps in order to get everything running.

## Step 1: Setup Python (Required for Scraping)

Open a terminal and run:
```bash
setup-python.bat
```

**What this does:**
- Checks if Python is installed
- Installs required Python packages (pixivpy3, etc.)
- Sets up the powerful Pixiv API scraper

**If you see an error:**
- Install Python from: https://www.python.org/downloads/
- ✅ Check "Add Python to PATH" during installation
- Restart terminal and try again

---

## Step 2: Start Backend Server

Open a **NEW terminal** and run:
```bash
start-backend.bat
```

**You should see:**
```
🚀 Backend server running on port 3000
📡 Environment: development
```

**Keep this terminal open!**

---

## Step 3: Start Frontend

Open **ANOTHER NEW terminal** and run:
```bash
start-frontend.bat
```

**You should see:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**Keep this terminal open too!**

---

## Step 4: Test Everything

1. **Open browser:** http://localhost:5173
2. **Login/Signup** with any email
3. **Enter a Pixiv URL:**
   ```
   https://www.pixiv.net/en/users/16034374
   ```
4. **Click "Start Archive"**
5. **Check History page** for results

---

## ✅ Success Indicators

### Backend Terminal Should Show:
```
🚀 Starting scrape for: https://www.pixiv.net/en/users/...
🐍 Calling Python scraper for user ...
🔐 Logging into Pixiv API...
✅ Successfully authenticated with Pixiv API
📸 Fetching illustrations for user ...
✅ Total illustrations found: XX
🎉 Extracted XX image URLs
```

### Frontend Should Show:
- Toast notification: "Download Started"
- History page updates with status
- Eventually shows "Completed" with image count

---

## 🔧 Troubleshooting

### "Python is not recognized"
**Solution:**
1. Install Python: https://www.python.org/downloads/
2. ✅ Check "Add Python to PATH"
3. Restart terminal
4. Run `setup-python.bat` again

### "Port 3000 already in use"
**Solution:**
1. Close any other programs using port 3000
2. Or edit `backend/.env` and change `PORT=3000` to `PORT=3001`
3. Also update `.env` to `VITE_API_URL=http://localhost:3001`

### "Cannot find module"
**Solution:**
```bash
cd backend
npm install
```

### "Authentication failed"
**Solution:**
1. Check `backend/.env` has correct Pixiv credentials
2. Try logging in at https://www.pixiv.net/ manually
3. Make sure 2FA is disabled

### Backend shows 404 errors
**Solution:**
- Make sure backend is actually running (check terminal)
- Verify you see "Backend server running on port 3000"
- Check `VITE_API_URL` in `.env` matches backend port

---

## 📁 Quick Reference

**Backend runs on:** http://localhost:3000
**Frontend runs on:** http://localhost:5173
**Health check:** http://localhost:3000/api/health

**Environment files:**
- `backend/.env` - Backend config (Supabase, Pixiv credentials)
- `.env` - Frontend config (API URL)

---

## 🎯 Summary

1. ✅ Run `setup-python.bat` (one time only)
2. ✅ Run `start-backend.bat` (keep open)
3. ✅ Run `start-frontend.bat` (keep open)
4. ✅ Open http://localhost:5173
5. ✅ Start scraping!

---

## 💡 Tips

- Keep both terminals open while using the app
- Backend logs show detailed scraping progress
- Check History page for real-time status updates
- Python scraper is much faster than browser automation
- Can scrape up to 100 artworks per profile

---

## 🆘 Still Having Issues?

Check the logs in both terminals for error messages and refer to:
- `backend/SETUP.md` - Backend setup details
- `backend/python/README.md` - Python scraper details
- `backend/PIXIV_AUTH.md` - Authentication help
