# Pixivloader Backend

Backend API for scraping Pixiv profiles and managing download history.

## Features

- 🎨 Scrape Pixiv user profiles and extract all artwork URLs
- 🔄 Real-time status updates via Supabase
- 🚀 Easy deployment on Render
- 🔒 Secure with environment variables
- 📊 Track download history

## Setup

### Local Development

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
FRONTEND_URL=http://localhost:5173
```

4. Run the server:
```bash
npm run dev
```

## Deployment on Render

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml`
6. Add environment variables in Render dashboard
7. Deploy!

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: pixivloader-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_KEY` = your Supabase service key
   - `FRONTEND_URL` = your Vercel frontend URL

6. Click "Create Web Service"

## API Endpoints

### Health Check
```
GET /api/health
```

### Start Scraping
```
POST /api/scrape/start
Body: {
  "url": "https://www.pixiv.net/en/users/12345678",
  "userId": "user-uuid",
  "historyId": "history-uuid"
}
```

### Get Status
```
GET /api/scrape/status/:historyId
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3000) |
| NODE_ENV | Environment | No (default: development) |
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_ANON_KEY | Supabase anon key | Yes |
| SUPABASE_SERVICE_KEY | Supabase service key | Yes |
| FRONTEND_URL | Frontend URL for CORS | Yes |

## Notes

- The scraper uses Puppeteer which requires Chrome/Chromium
- Render's free tier includes Chrome, so it works out of the box
- For better performance, consider using a paid Render plan
- Scraping is limited to 50 artworks per request to avoid timeouts
- Images are not downloaded, only URLs are collected

## Troubleshooting

### Puppeteer Issues on Render

If Puppeteer fails to launch, ensure these args are set:
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
]
```

### CORS Issues

Make sure `FRONTEND_URL` in your `.env` matches your Vercel deployment URL.

### Timeout Issues

If scraping times out, reduce the number of artworks processed or increase Render's timeout settings.
