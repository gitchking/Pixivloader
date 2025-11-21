# Backend Setup Guide

## Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. **Pixiv account** with valid session cookies

## Setup Steps

### 1. Install Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file in `python-backend/` directory:

```env
# Flask Configuration
FLASK_ENV=development
PORT=5000

# Supabase Configuration (Optional)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Pixiv Configuration
PIXIV_REFRESH_TOKEN=your_refresh_token
```

### 3. Pixiv Authentication

You need to provide Pixiv session cookies. The backend will check for authentication on startup.

**Option A: Manual Cookie Setup**
- Login to Pixiv in your browser
- Copy session cookies to the backend

**Option B: Use Refresh Token**
- Get your Pixiv refresh token
- Add it to the `.env` file

### 4. Run Backend

```bash
cd python-backend
python app.py
```

The backend will start on `http://localhost:5000`

### 5. Test Backend

Open `http://localhost:5000/api/health` in your browser. You should see:

```json
{
  "status": "ok",
  "message": "Python backend is running",
  "pixiv_authenticated": true,
  "session_cookies": 5
}
```

## Frontend Integration

The mobile app is already configured to connect to your local backend:

1. **Development**: Uses `http://localhost:5000`
2. **Production**: Set `VITE_API_URL` in `.env.local`

## API Endpoints

- `GET /api/health` - Check backend status
- `POST /api/download/start` - Start download with progress tracking
- `GET /api/download/progress/{taskId}` - Get download progress (SSE)

## Features Supported

✅ **Profile Downloads**: Full user profile with all artworks
✅ **Progress Tracking**: Real-time download progress
✅ **Concurrent Downloads**: Optimized for speed
✅ **ZIP Creation**: Automatic ZIP file generation
✅ **Error Handling**: Proper error messages and recovery

## Mobile App Features

✅ **Real-time Progress**: Live progress updates via Server-Sent Events
✅ **Error Handling**: User-friendly error messages
✅ **Authentication Check**: Verifies backend is ready
✅ **Automatic Downloads**: Files download directly to device

## Troubleshooting

**Backend not starting?**
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port availability: `netstat -an | grep 5000`

**Authentication failed?**
- Verify Pixiv cookies are valid
- Check refresh token in `.env`
- Login to Pixiv manually and retry

**Downloads failing?**
- Check internet connection
- Verify Pixiv URLs are valid
- Check backend logs for errors

**Mobile app not connecting?**
- Ensure backend is running on `localhost:5000`
- Check `.env.local` has correct `VITE_API_URL`
- Verify CORS is enabled (already configured)