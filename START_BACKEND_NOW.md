# 🚀 Start Backend - Step by Step

## Step 1: Open Terminal

Open a NEW terminal (not the one running frontend)

## Step 2: Navigate to Backend

```bash
cd python-backend
```

## Step 3: Check Python

```bash
python --version
```

Should show: `Python 3.x.x`

If not, try:
```bash
python3 --version
```

## Step 4: Install Dependencies (if not done)

```bash
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
```

Or:
```bash
python -m pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
```

## Step 5: Start Backend

```bash
python app.py
```

Or if python doesn't work:
```bash
python3 app.py
```

Or:
```bash
py app.py
```

## ✅ Success Looks Like:

```
🚀 Starting Python backend on port 3000
📡 Environment: development
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on http://0.0.0.0:3000
Press CTRL+C to quit
```

## ❌ Common Errors:

### "python not found"
**Solution:** Try `python3 app.py` or `py app.py`

### "No module named 'flask'"
**Solution:** 
```bash
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
```

### "Permission denied"
**Solution:** Try with admin/sudo or use:
```bash
python -m pip install --user flask flask-cors python-dotenv supabase requests beautifulsoup4
```

### "Port 3000 already in use"
**Solution:** Kill the process or change PORT in `.env` to 3001

## 🔍 Test Backend

Once running, open browser:
```
http://localhost:3000/api/health
```

Should show:
```json
{"status":"ok","message":"Python backend is running","pixiv_authenticated":true}
```

## 📝 Full Commands (Copy-Paste)

```bash
cd python-backend
pip install flask flask-cors python-dotenv supabase requests beautifulsoup4
python app.py
```

---

**What error are you seeing? Tell me the exact error message!**
