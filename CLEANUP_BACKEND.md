# 🧹 Backend Cleanup Plan

## ✅ KEEP - Essential Files

### Python Backend (python-backend/)
```
python-backend/
├── app.py                          ✅ Main Flask server
├── requirements.txt                ✅ Dependencies
├── .env                           ✅ Configuration
├── .env.example                   ✅ Template
├── services/
│   ├── cookie_scraper.py          ✅ Cookie-based scraper (WORKING!)
│   ├── pixiv_scraper.py           ✅ Main scraper interface
│   └── supabase_client.py         ✅ Database client
├── download_pixiv.py              ✅ Standalone download script
├── test_scraper.py                ✅ Test script
└── README.md                      ✅ Documentation
```

## ❌ DELETE - Unnecessary Files

### Old Node.js Backend (backend/)
```
backend/                           ❌ DELETE ENTIRE FOLDER
├── src/
├── node_modules/
├── package.json
└── ...
```

### Unused Python Scripts
```
python-backend/
├── test_selenium.py               ❌ DELETE (Selenium doesn't work)
├── get_token_oauth.py             ❌ DELETE (Not needed with cookies)
├── get_token_auto.py              ❌ DELETE (Not needed)
├── setup_token_direct.py          ❌ DELETE (Not needed)
├── test_simple.py                 ❌ DELETE (Use test_scraper.py)
└── services/
    ├── selenium_scraper.py        ❌ DELETE (Doesn't work)
    └── pixiv_utils_scraper.py     ❌ DELETE (Not used)
```

### Unused Documentation
```
Root directory:
├── setup-python.bat               ❌ DELETE
├── setup-token-auto.bat           ❌ DELETE
├── setup-token-oauth.bat          ❌ DELETE
├── setup-token-quick.bat          ❌ DELETE
├── test-selenium.bat              ❌ DELETE
├── GET_TOKEN_QUICK.bat            ❌ DELETE
├── start-backend.bat              ❌ DELETE
├── start-frontend.bat             ❌ DELETE
├── start-all.bat                  ❌ DELETE
├── SELENIUM_SETUP.md              ❌ DELETE
├── TEST_GUIDE.md                  ❌ DELETE
├── SETUP_PYTHON_BACKEND.md        ❌ DELETE
├── python-backend/TOKEN_SETUP_FIXED.md  ❌ DELETE
├── python-backend/GET_REFRESH_TOKEN.md  ❌ DELETE
└── python-backend/PIXIV_AUTH.md   ❌ DELETE
```

## 📁 Final Clean Structure

```
pixivloader/
├── python-backend/              ✅ Python backend (KEEP)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── services/
│   │   ├── cookie_scraper.py
│   │   ├── pixiv_scraper.py
│   │   └── supabase_client.py
│   ├── download_pixiv.py
│   ├── test_scraper.py
│   └── README.md
├── src/                         ✅ Frontend (KEEP)
├── public/                      ✅ Frontend assets (KEEP)
├── supabase-schema.sql          ✅ Database schema (KEEP)
├── START_FULL_APP.md            ✅ Quick start guide (KEEP)
├── GET_TOKEN_BROWSER.md         ✅ Token guide (KEEP)
├── package.json                 ✅ Frontend deps (KEEP)
└── README.md                    ✅ Main docs (KEEP)
```

## 🗑️ Files to Delete

Total: ~50+ unnecessary files
Keep: ~20 essential files

This will make the project much cleaner and easier to understand!
