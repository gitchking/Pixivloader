# Pixivloader - Quick Start Guide

## Project Structure

```
pixivloader/
├── backend/              # Backend API (Deploy on Render)
│   ├── src/
│   │   ├── index.js     # Main server file
│   │   ├── routes/      # API routes
│   │   └── services/    # Scraper & Supabase services
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── src/                  # Frontend (Deploy on Vercel)
│   ├── components/
│   ├── pages/
│   └── lib/
├── package.json
└── README.md
```

## Local Development

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
SUPABASE_URL=https://qkxauxnpwbshsjbbonrt.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

Backend runs on: http://localhost:3000

### 2. Setup Frontend

In project root:
```bash
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:3000
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

### 3. Setup Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the `download_history` table.

## Production Deployment

### Backend → Render

1. Push code to GitHub
2. Go to https://dashboard.render.com/
3. New Web Service → Connect repo
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`
7. Add environment variables
8. Deploy!

### Frontend → Vercel

1. Go to https://vercel.com/
2. Import GitHub repo
3. Framework: Vite
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy!

## Features

✅ User authentication (Supabase Auth)
✅ Pixiv profile scraping
✅ Download history tracking
✅ Real-time status updates
✅ Responsive design
✅ Dark mode support

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Supabase Client

**Backend:**
- Node.js + Express
- Puppeteer (web scraping)
- Supabase (database)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/scrape/start` - Start scraping
- `GET /api/scrape/status/:id` - Get status

## Notes

- Backend uses Puppeteer for scraping (works on Render out of the box)
- Scraping limited to 50 artworks per request
- Free tier on Render may have cold starts
- Images URLs are collected, not downloaded

## Support

Check `backend/DEPLOYMENT.md` for detailed deployment instructions and troubleshooting.
