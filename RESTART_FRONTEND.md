# Restart Frontend with Fresh Environment

The frontend is still using the old API URL (port 3000 instead of 5000).

## Quick Fix:

1. **Stop the frontend** (Ctrl+C in the terminal running `npm run dev`)

2. **Delete Vite cache:**
```bash
rmdir /s /q node_modules\.vite
```

3. **Restart frontend:**
```bash
npm run dev
```

## What's happening:
- Frontend is on port 3002
- Frontend is trying to reach backend on port 3000 (old cached value)
- Backend is actually on port 5000
- `.env` file is correct but Vite hasn't reloaded it

## Alternative - Force reload:
```bash
npm run dev -- --force
```

This will clear the cache and use the new `VITE_API_URL=http://localhost:5000` from `.env`
