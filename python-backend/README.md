# Pixivloader Python Backend

Flask-based backend service for downloading and processing Pixiv artwork.

## Features

- Pixiv artwork scraping and downloading
- Automatic metadata extraction
- Supabase integration for storage
- Image processing and optimization
- RESTful API endpoints

## Tech Stack

- Flask (Web framework)
- Requests (HTTP client)
- Supabase Python Client
- Pillow (Image processing)

## Setup

### 1. Create Virtual Environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token
FLASK_ENV=development
PORT=5000
```

### 4. Run the Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Scrape User Artwork
```
POST /api/scrape
Content-Type: application/json

{
  "user_id": "123456"
}
```
Downloads all artwork from the specified Pixiv user.

## Project Structure

```
python-backend/
├── services/
│   ├── pixiv_scraper.py      # Pixiv API integration
│   ├── image_downloader.py   # Image download logic
│   ├── supabase_client.py    # Supabase operations
│   └── cookie_scraper.py     # Cookie handling
├── downloads/                 # Downloaded images (gitignored)
├── app.py                    # Flask application
├── download_pixiv.py         # CLI tool for downloading
├── requirements.txt          # Python dependencies
├── Procfile                  # Deployment config
└── runtime.txt              # Python version
```

## Services

### PixivScraper
Handles authentication and API requests to Pixiv.

```python
from services.pixiv_scraper import PixivScraper

scraper = PixivScraper(refresh_token)
artworks = scraper.get_user_artworks(user_id)
```

### ImageDownloader
Downloads and processes images.

```python
from services.image_downloader import ImageDownloader

downloader = ImageDownloader()
downloader.download_image(url, filepath)
```

### SupabaseClient
Manages database and storage operations.

```python
from services.supabase_client import SupabaseClient

client = SupabaseClient()
client.upload_artwork(artwork_data)
```

## CLI Usage

Download artwork from a specific user:

```bash
python download_pixiv.py <user_id>
```

Example:
```bash
python download_pixiv.py 13107138
```

## Getting Pixiv Refresh Token

1. Login to Pixiv in your browser
2. Open DevTools (F12) → Application → Cookies
3. Find `refresh_token` cookie
4. Copy the value to your `.env` file

## Deployment

### Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`
5. Add environment variables

### Railway

1. Create new project
2. Connect repository
3. Add environment variables
4. Deploy automatically

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase service role key | Yes |
| `PIXIV_REFRESH_TOKEN` | Pixiv authentication token | Yes |
| `FLASK_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad request (missing parameters)
- `401` - Unauthorized (invalid Pixiv token)
- `404` - User not found
- `500` - Server error

## Development

### Running Tests

```bash
# Add test files when available
pytest
```

### Code Style

Follow PEP 8 guidelines:

```bash
# Format code
black .

# Check linting
flake8 .
```

## Troubleshooting

### Pixiv Authentication Failed
- Verify your refresh token is valid
- Check if token has expired (tokens expire after ~6 months)
- Try logging out and back into Pixiv to get a new token

### Supabase Connection Error
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check if your Supabase project is active
- Ensure service role key has proper permissions

### Download Failures
- Check internet connection
- Verify Pixiv user ID exists
- Check if artwork is public (private artwork cannot be downloaded)

## License

MIT License - see main project README for details.
