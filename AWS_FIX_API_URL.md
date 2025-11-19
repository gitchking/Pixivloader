# 🔧 Fix API Connection Error - Detailed Guide

## Problem
Frontend is trying to connect to `localhost:5000` instead of your EC2 server's API.

## Solution
Update the frontend environment variable and rebuild.

---

## Step 1: Check Current Status

**On your EC2 server (in SSH), check if backend is running:**
```bash
sudo systemctl status pixivloader
```

You should see: `active (running)` in green.

**Check if it responds:**
```bash
curl http://localhost:5000/api/health
```

You should see: `{"status":"healthy"}`

If backend is NOT running, start it:
```bash
sudo systemctl start pixivloader
```

---

## Step 2: Update Frontend Environment Variable

**On your EC2 server, edit the .env file:**
```bash
cd /opt/Pixivloader
nano .env
```

**Find this line:**
```env
VITE_API_URL=http://localhost:5000
```

**Change it to use relative path (this works with Nginx proxy):**
```env
VITE_API_URL=/api
```

Or use the full EC2 URL:
```env
VITE_API_URL=http://13.238.218.206/api
```

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## Step 3: Rebuild Frontend

**Still on EC2 server, rebuild the frontend:**
```bash
cd /opt/Pixivloader
npm run build
```

This takes 2-3 minutes. You'll see:
```
vite v5.x.x building for production...
✓ built in 2.5s
```

---

## Step 4: Deploy Updated Frontend

**Copy the new build to Nginx:**
```bash
sudo cp -r dist/* /var/www/html/
```

---

## Step 5: Clear Browser Cache and Test

**On your Windows computer:**

1. Open your browser
2. Press `Ctrl + Shift + Delete`
3. Select "Cached images and files"
4. Click "Clear data"

**Or do a hard refresh:**
- Press `Ctrl + F5` on the page

**Then visit:**
```
http://13.238.218.206
```

---

## Step 6: Verify It Works

**Test the API directly in browser:**
```
http://13.238.218.206/api/health
```

Should show: `{"status":"healthy"}`

**Test the frontend:**
1. Go to `http://13.238.218.206`
2. Try to download something
3. Check browser console (F12) - should see no errors

---

## Alternative: Use Nginx Proxy (Recommended)

The best approach is to use `/api` as a relative path. This way:
- Frontend calls `/api/download/start`
- Nginx proxies it to `localhost:5000/api/download/start`
- No CORS issues!

**This is already configured in Nginx**, so just use:
```env
VITE_API_URL=
```

Leave it empty! The frontend will use relative paths automatically.

---

## Troubleshooting

### Backend not running?
```bash
sudo journalctl -u pixivloader -n 50
```

Check for errors. Common issues:
- Missing .env file
- Wrong Python dependencies
- Port 5000 already in use

**Restart backend:**
```bash
sudo systemctl restart pixivloader
```

### Frontend still shows localhost?
- Clear browser cache completely
- Make sure you rebuilt with `npm run build`
- Make sure you copied to `/var/www/html/`

### CORS errors?
Make sure backend `.env` has:
```env
FRONTEND_URL=http://13.238.218.206
```

Then restart backend:
```bash
sudo systemctl restart pixivloader
```

---

## Quick Command Summary

**On EC2 server, run all these:**
```bash
# Update .env
cd /opt/Pixivloader
nano .env
# Change VITE_API_URL to empty or /api

# Rebuild frontend
npm run build

# Deploy
sudo cp -r dist/* /var/www/html/

# Restart backend (if needed)
sudo systemctl restart pixivloader

# Check status
sudo systemctl status pixivloader
sudo systemctl status nginx
```

**On your browser:**
- Hard refresh: `Ctrl + F5`
- Visit: `http://13.238.218.206`

Done! 🎉
