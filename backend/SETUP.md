# Backend Setup Instructions

## Step 1: Install Dependencies

Make sure you're in the backend directory:
```bash
cd backend
```

Then install all dependencies:
```bash
npm install
```

This will install:
- express (web server)
- cors (cross-origin requests)
- dotenv (environment variables)
- axios (HTTP client)
- cheerio (HTML parsing)
- @supabase/supabase-js (database)
- puppeteer (web scraping)

**Note:** Puppeteer will download Chromium (~170MB), this is normal and required.

## Step 2: Verify .env File

Make sure `backend/.env` exists with these variables:
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://qkxauxnpwbshsjbbonrt.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

## Step 3: Test the Server

Try running with regular node first:
```bash
npm start
```

If that works, try the dev mode with auto-reload:
```bash
npm run dev
```

## Step 4: Test the API

Once the server is running, test it:

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 0.123
}
```

## Troubleshooting

### Error: Cannot find module
- Make sure you ran `npm install`
- Check that all files exist in `src/routes/` and `src/services/`

### Error: Port already in use
- Change PORT in `.env` to a different number (e.g., 3001)
- Or kill the process using port 3000

### Puppeteer installation fails
- Make sure you have enough disk space (~200MB)
- Try: `npm install puppeteer --legacy-peer-deps`

### Module not found errors
- Make sure all imports end with `.js` extension
- Check that `"type": "module"` is in package.json

## Success!

If you see:
```
🚀 Backend server running on port 3000
📡 Environment: development
```

Your backend is ready! Now start the frontend in a separate terminal.
