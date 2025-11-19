# 🐍 Python Backend for Pixivloader

Clean, simple, and working Pixiv scraper using cookie authentication.

## ✨ Features

- ✅ **Cookie-based auth** - No tokens, no OAuth hassle
- ✅ **Fast & Reliable** - Direct API access
- ✅ **Original Quality** - Full resolution images
- ✅ **Real-time Updates** - Supabase integration
- ✅ **Easy to Deploy** - Works on Render

## 🚀 Quick Start

### 1. Get PHPSESSID Cookie (One Time)

1. Go to https://www.pixiv.net/ and login
2. Press `F12` → **Application** → **Cookies**
3. Copy `PHPSESSID` cookie value
4. Add to `.env`:
   ```env
   PIXIV_PHPSESSID=your_cookie_value_here
   ```

### 2. Install Dependencies

```bash
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
```

### 3. Start Backend

```bash
python app.py
```

Server runs on: http://localhost:3000

## 📁 Project Structure

```
python-backend/
├── app.py                    # Main Flask server
├── requirements.txt          # Dependencies
├── .env                     # Configuration (your cookie here!)
├── services/
│   ├── cookie_scraper.py    # Cookie-based scraper (WORKING!)
│   ├── pixiv_scraper.py     # Main scraper interface
│   └── supabase_client.py   # Database client
├── download_pixiv.py        # Standalone download script
├── test_scraper.py          # Test script
└── README.md               # This file
```

## 🧪 Testing

### Test the scraper:
```bash
python test_scraper.py
```

### Download images directly:
```bash
python download_pixiv.py https://www.pixiv.net/en/users/11
```

## 🌐 API Endpoints

- `GET /api/health` - Health check
- `POST /api/scrape/start` - Start scraping
- `GET /api/scrape/status/:id` - Get status

## ⚙️ Environment Variables

Required in `.env`:
```env
PORT=3000
FLASK_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FRONTEND_URL=http://localhost:5173
PIXIV_PHPSESSID=your_cookie_here  # REQUIRED!
```

## 🚀 Deployment on Render

1. Push to GitHub
2. Create Web Service on Render
3. Settings:
   - Root Directory: `python-backend`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
4. Add environment variables
5. Deploy!

## 🆘 Troubleshooting

**Cookie expired:**
- Get new PHPSESSID from browser
- Update `.env`

**Module not found:**
```bash
pip install -r requirements.txt
```

**Port already in use:**
- Change PORT in `.env`

## 💡 Why Cookie Method?

- ✅ No token setup hassle
- ✅ Works immediately
- ✅ More reliable than Selenium
- ✅ Lasts weeks before expiring
- ✅ Simple to refresh

## 📝 Notes

- Cookie lasts ~2-4 weeks
- When expired, just get a new one
- Much simpler than OAuth/tokens
- Production-ready and stable
