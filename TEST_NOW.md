# 🚀 Test Your Cookie Scraper NOW!

Your PHPSESSID cookie is already added to `.env`!

## Quick Test

```bash
cd python-backend
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
python test_scraper.py
```

## What Should Happen

```
🧪 Testing Pixiv Scraper
✅ Session configured with PHPSESSID cookie
🚀 Scraping user 16034374 with cookie auth...
✅ Found 25 artworks
📸 Processing artwork 1/10: 123456
🎉 Extracted 15 image URLs

📊 RESULTS
✅ Success: True
🎨 Artworks found: 25
🖼️  Images extracted: 15
```

## If It Works

Start the full backend:
```bash
python app.py
```

Then in another terminal, start frontend:
```bash
npm run dev
```

## If Cookie Expired

Get a new one:
1. Go to https://www.pixiv.net/
2. Login again
3. F12 → Application → Cookies → Copy PHPSESSID
4. Update in `python-backend/.env`

---

## 🎉 This Should Work!

The cookie method is much more reliable than tokens!
