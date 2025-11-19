# 🚀 Start Full App - Frontend + Backend

Your scraper is working! Now let's connect it to the web interface.

## Step 1: Start Python Backend

**Terminal 1:**
```bash
cd python-backend
python app.py
```

You should see:
```
🚀 Starting Python backend on port 3000
📡 Environment: development
 * Running on http://0.0.0.0:3000
```

**Keep this terminal open!**

---

## Step 2: Start Frontend

**Terminal 2 (new terminal):**
```bash
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**Keep this terminal open too!**

---

## Step 3: Use the Web Interface

1. **Open browser:** http://localhost:5173

2. **Login/Signup** with any email

3. **Enter Pixiv URL** in the input box:
   ```
   https://www.pixiv.net/en/users/11
   ```

4. **Click "Start Archive"**

5. **Go to History page** to see:
   - Status: Processing → Completed
   - Images count: 65 images (or however many)

---

## 🎯 What Happens Behind the Scenes:

1. **Frontend** sends URL to backend
2. **Backend** extracts user ID
3. **Cookie scraper** fetches artworks
4. **Supabase** updates status in real-time
5. **History page** shows results

---

## ✅ Success Indicators:

### Backend Terminal:
```
Starting scrape for user 11
🚀 Scraping user 11 with cookie auth...
✅ Found 47 artworks
📸 Processing artwork 1/100
🎉 Extracted 65 image URLs
✅ Scraping completed: 65 images
```

### Frontend:
- Toast: "Download Started"
- History page shows: "Completed - 65 items"

---

## 🆘 Troubleshooting:

**Backend won't start:**
```bash
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
```

**Frontend can't connect:**
- Check backend is running on port 3000
- Check `.env` has `VITE_API_URL=http://localhost:3000`

**Scraping fails:**
- Cookie might be expired
- Get new PHPSESSID from browser
- Update `python-backend/.env`

---

## 🎉 Ready to Test!

**Terminal 1:**
```bash
cd python-backend
python app.py
```

**Terminal 2:**
```bash
npm run dev
```

**Browser:**
```
http://localhost:5173
```

Everything is connected and ready! 🚀
