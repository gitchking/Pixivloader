# 🔑 Get Pixiv Token Using Browser (5 Minutes)

## Method 1: Browser DevTools (Easiest!)

### Step 1: Login to Pixiv
1. Open Chrome/Firefox
2. Go to: https://www.pixiv.net/
3. Login with:
   - Email: `celica175x@gmail.com`
   - Password: `Daman@2005`

### Step 2: Get Token from DevTools
1. Press `F12` to open DevTools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → `https://www.pixiv.net`
4. Find and copy the value of `PHPSESSID` cookie

### Step 3: Add to .env
Edit `python-backend/.env`:
```env
PIXIV_REFRESH_TOKEN=your_PHPSESSID_value_here
```

---

## Method 2: Using Python Script

### Step 1: Install tool
```bash
pip install gppt
```

### Step 2: Login
```bash
gppt pixiv login
```

Enter your credentials when prompted.

### Step 3: Copy Token
You'll see:
```
refresh_token: aBcDeFgHiJkLmNoPqRsTuVwXyZ...
```

Copy the entire refresh_token value.

### Step 4: Add to .env
```env
PIXIV_REFRESH_TOKEN=aBcDeFgHiJkLmNoPqRsTuVwXyZ...
```

---

## Method 3: Using Online Tool

1. Go to: https://github.com/eggplants/get-pixivpy-token
2. Follow the instructions
3. Copy the refresh_token
4. Add to .env

---

## ✅ Test It

After adding token:
```bash
cd python-backend
pip install pixivpy3 python-dotenv flask flask-cors supabase requests
python test_scraper.py
```

You should see:
```
✅ Successfully authenticated!
🚀 Scraping user...
✅ Found 25 artworks
🎉 Extracted 15 image URLs
```

---

## 💡 Tips

- Token lasts **3-6 months**
- When it expires, just get a new one
- Keep it secret - don't share it
- Much easier than fighting with Selenium!

---

## 🚀 Quick Commands

```bash
# Install dependencies
cd python-backend
pip install pixivpy3 python-dotenv flask flask-cors supabase requests

# Test scraper
python test_scraper.py

# Start backend
python app.py
```

Done! 🎉
