# Pixivloader Node.js Backend (Legacy)

> **Note**: This is a legacy Node.js backend. The primary backend is now Python-based (see `python-backend/`). This backend is kept for reference and optional use.

## Overview

Express.js backend service for Pixiv artwork scraping (legacy implementation).

## Tech Stack

- Node.js + Express
- Pixiv API integration
- Supabase Client

## Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment

Copy `.env.example` to `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token
PORT=3000
```

### Run Server

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Scrape User
```
POST /api/scrape
{
  "userId": "123456"
}
```

## Project Structure

```
backend/
├── src/
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── index.js         # Express app
├── python/              # Python utilities
└── package.json
```

## Migration Note

This backend is being phased out in favor of the Python backend which offers:
- Better Pixiv API integration
- More reliable image downloading
- Improved error handling
- Easier deployment

For new features, please use the Python backend in `python-backend/`.

## License

MIT License
