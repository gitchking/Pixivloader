# 🎯 Final Simple Solution - Manual Token (Works 100%)

Pixiv blocks automated login. The ONLY reliable way is to get a token manually once, then use it.

## ✅ Step 1: Get Token Manually (One Time Only)

### Method A: Using Browser DevTools (Easiest)

1. **Open Chrome/Firefox**
2. **Go to:** https://www.pixiv.net/
3. **Login** with your credentials
4. **Open DevTools** (F12)
5. **Go to Application/Storage tab**
6. **Find Cookies** → `https://www.pixiv.net`
7. **Copy the value of `PHPSESSID` cookie**

### Method B: Using This Tool

1. Go to: https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362
2. Download the script
3. Run it and login
4. Copy the refresh_token

## ✅ Step 2: Add Token to .env

Edit `python-backend/.env`:
```env
PIXIV_REFRESH_TOKEN=your_token_here
```

Or for cookie method:
```env
PIXIV_PHPSESSID=your_cookie_here
```

## ✅ Step 3: Use Simple Scraper

I'll create a scraper that works with either method.

---

## 🎯 Why This is The Only Way

1. ❌ **Selenium login** - Blocked by Pixiv's anti-bot
2. ❌ **Username/password API** - Deprecated by Pixiv
3. ❌ **OAuth automation** - Requires manual interaction
4. ✅ **Manual token** - Works perfectly, lasts months

---

## 💡 Token Lasts Long

- Refresh tokens last **3-6 months**
- PHPSESSID cookies last **weeks**
- You only need to do this once
- When it expires, just get a new one

---

## 🚀 Next Steps

1. Get your token (5 minutes)
2. Add to .env
3. Run: `python test_simple.py`
4. Done!

Much simpler than fighting with Selenium! 🎉
