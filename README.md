# Pixivloader

A full-stack web application for archiving and managing Pixiv artwork portfolios. Download artwork from Pixiv artists, store metadata in Supabase, and browse your collection through a modern React interface.

## Features

- 🎨 Download artwork from Pixiv user profiles
- 📦 Automatic metadata extraction and storage
- 🖼️ Modern gallery interface with search and filtering
- 🌙 Dark/Light theme support
- 🔐 Secure authentication with Supabase
- ☁️ Cloud storage integration
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Supabase Client

### Backend
- Python Flask
- Pixiv API integration
- Supabase for database and storage
- Image processing and downloading

## Project Structure

```
pixivloader/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API clients
│   └── hooks/             # Custom React hooks
├── python-backend/        # Python Flask backend
│   ├── services/          # Core services (scraper, downloader)
│   └── app.py            # Flask application
├── backend/               # Legacy Node.js backend (optional)
└── public/               # Static assets
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Supabase account
- Pixiv account

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pixivloader.git
cd pixivloader
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Python Backend

```bash
cd python-backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env and add your credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_service_key
# PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token
```

### 4. Setup Supabase Database

Run the SQL schema in your Supabase project:

```bash
# Execute supabase-schema.sql in your Supabase SQL editor
```

### 5. Run the Application

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Python Backend:**
```bash
cd python-backend
.venv\Scripts\activate
python app.py
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Add Pixiv User**: Enter a Pixiv user ID to start downloading their artwork
3. **Browse Gallery**: View downloaded artwork in the dashboard
4. **Search & Filter**: Use the search and filter features to find specific artwork
5. **Settings**: Configure your preferences and manage your account

## Getting Pixiv Refresh Token

To use the Pixiv scraper, you need a refresh token:

1. Login to Pixiv in your browser
2. Open browser DevTools (F12)
3. Go to Application/Storage → Cookies
4. Find and copy the `refresh_token` cookie value
5. Add it to `python-backend/.env`

## Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway)

The Python backend includes a `Procfile` and `runtime.txt` for easy deployment to platforms like Render or Railway.

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (python-backend/.env)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token
FLASK_ENV=development
PORT=5000
```

## Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `python app.py` - Start Flask server
- `python download_pixiv.py <user_id>` - Download artwork from specific user

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Pixiv](https://www.pixiv.net/) for the artwork platform
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Support

For issues and questions, please open an issue on GitHub.
