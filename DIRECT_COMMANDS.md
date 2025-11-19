# 🚀 Direct Python Commands (No Batch Files)

## Step 1: Install Dependencies

```bash
cd python-backend
pip install flask flask-cors python-dotenv selenium webdriver-manager supabase requests beautifulsoup4
```

## Step 2: Test the Scraper

```bash
python test_selenium.py
```

## Step 3: Start the Backend

```bash
python app.py
```

## Step 4: Start Frontend (New Terminal)

```bash
cd ..
npm run dev
```

---

## 🎯 Quick Copy-Paste Commands

### For Backend:
```bash
cd python-backend && pip install flask flask-cors python-dotenv selenium webdriver-manager supabase requests beautifulsoup4 && python test_selenium.py
```

### For Full App:
**Terminal 1 (Backend):**
```bash
cd python-backend && python app.py
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 📊 What You Should See

### After `python test_selenium.py`:
```
🧪 Testing Selenium Pixiv Scraper
✨ No tokens needed - just username/password!
🔧 Initializing Selenium scraper...
🌐 Initializing Chrome driver...
✅ Chrome driver initialized
🔐 Logging into Pixiv...
✅ Successfully logged in!
🚀 Scraping user 16034374...
✅ Found 25 artworks
🎉 Total images extracted: 15
```

### After `python app.py`:
```
🚀 Starting Python backend on port 3000
📡 Environment: development
 * Running on http://0.0.0.0:3000
```

---

## 🆘 If Commands Fail

### "pip not found":
```bash
python -m pip install flask flask-cors python-dotenv selenium webdriver-manager supabase requests beautifulsoup4
```

### "python not found":
```bash
python3 test_selenium.py
```

### "Module not found":
Make sure you're in `python-backend` directory:
```bash
cd python-backend
```

---

## ✅ Success Checklist

- [ ] Installed dependencies
- [ ] Tested scraper: `python test_selenium.py`
- [ ] Started backend: `python app.py`
- [ ] Started frontend: `npm run dev`
- [ ] Opened http://localhost:5173

---

That's it! No batch files needed! 🎉
