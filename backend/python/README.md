# Python Pixiv Scraper

Powerful scraper using the official Pixiv API (pixivpy3).

## Setup

### 1. Install Python

Make sure you have Python 3.8+ installed:
```bash
python --version
```

### 2. Install Dependencies

```bash
cd backend/python
pip install -r requirements.txt
```

Or if you have multiple Python versions:
```bash
python3 -m pip install -r requirements.txt
```

### 3. Test the Scraper

```bash
python pixiv_scraper.py 16034374
```

Replace `16034374` with any Pixiv user ID.

## How It Works

1. Uses official Pixiv API (much more reliable than web scraping)
2. Authenticates with your Pixiv credentials
3. Fetches all illustrations from a user
4. Extracts original quality image URLs
5. Returns JSON output

## Advantages Over Puppeteer

- ✅ **Much faster** - Direct API calls instead of browser automation
- ✅ **More reliable** - Official API, no anti-bot detection
- ✅ **Better quality** - Gets original image URLs directly
- ✅ **No browser needed** - Lighter resource usage
- ✅ **Handles pagination** - Automatically fetches all artworks
- ✅ **Rate limiting built-in** - Respects Pixiv's limits

## Troubleshooting

### Python not found
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### pip install fails
- Try: `python -m pip install --upgrade pip`
- Then: `pip install -r requirements.txt`

### Authentication fails
- Check your credentials in `backend/.env`
- Make sure you can login at https://www.pixiv.net/
- Disable 2FA if enabled

### Module not found
- Make sure you're in the `backend/python` directory
- Run: `pip install -r requirements.txt` again
