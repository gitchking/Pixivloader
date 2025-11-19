"""
Pixivloader Python Backend
Fast and reliable Pixiv scraper using official API
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import requests
import io
import zipfile
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import services
from services.pixiv_scraper import PixivScraper
from services.image_downloader import ImageDownloader

# Try to import Supabase (optional)
try:
    from services.supabase_client import SupabaseClient
    SUPABASE_AVAILABLE = True
    logger.info("✅ Supabase client loaded")
except Exception as e:
    logger.warning(f"⚠️  Supabase not available: {e}")
    logger.warning("⚠️  Scraper will work but history tracking disabled")
    SUPABASE_AVAILABLE = False
    SupabaseClient = None

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - Allow all origins with proper headers
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=False)

logger.info("🔒 CORS enabled for all origins")

# Initialize services
pixiv_scraper = PixivScraper()
image_downloader = ImageDownloader(session=pixiv_scraper.scraper.session)
supabase_client = SupabaseClient() if SUPABASE_AVAILABLE else None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Python backend is running',
        'pixiv_authenticated': pixiv_scraper.is_authenticated(),
        'session_cookies': len(pixiv_scraper.scraper.session.cookies) > 0
    })

@app.route('/api/scrape/start', methods=['POST'])
def start_scrape():
    """Start scraping a Pixiv profile"""
    try:
        data = request.get_json()
        
        url = data.get('url')
        user_id = data.get('userId')
        history_id = data.get('historyId')
        
        if not url or not user_id or not history_id:
            return jsonify({
                'error': 'Missing required fields',
                'message': 'url, userId, and historyId are required'
            }), 400
        
        # Extract Pixiv user ID from URL
        import re
        match = re.search(r'users/(\d+)', url)
        if not match:
            return jsonify({
                'error': 'Invalid URL',
                'message': 'Please provide a valid Pixiv user profile URL'
            }), 400
        
        pixiv_user_id = match.group(1)
        
        logger.info(f"Starting scrape for user {pixiv_user_id}")
        
        # Update status to processing
        if supabase_client:
            supabase_client.update_history(history_id, {
                'status': 'processing'
            })
        
        # Start scraping in background (for now, synchronous)
        try:
            result = pixiv_scraper.scrape_user(pixiv_user_id, max_illusts=100)
            
            if result['success']:
                # Update with success
                if supabase_client:
                    supabase_client.update_history(history_id, {
                        'status': 'completed',
                        'items_count': result['images']
                    })
                
                logger.info(f"✅ Scraping completed: {result['images']} images")
            else:
                # Update with failure
                if supabase_client:
                    supabase_client.update_history(history_id, {
                        'status': 'failed'
                    })
                
                logger.error(f"❌ Scraping failed: {result.get('error')}")
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Scraping error: {str(e)}")
            if supabase_client:
                supabase_client.update_history(history_id, {
                    'status': 'failed'
                })
            raise
        
    except Exception as e:
        logger.error(f"Error in start_scrape: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/scrape/status/<history_id>', methods=['GET'])
def get_status(history_id):
    """Get scraping status"""
    try:
        if not supabase_client:
            return jsonify({
                'error': 'Supabase not available',
                'message': 'Database connection not configured'
            }), 503
        
        status = supabase_client.get_history(history_id)
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        return jsonify({
            'error': 'Failed to get status',
            'message': str(e)
        }), 500

@app.route('/api/download/start', methods=['POST'])
def start_download():
    """Download all images and create a zip file"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({
                'error': 'Missing URL',
                'message': 'URL is required'
            }), 400
        
        # Extract user ID
        import re
        match = re.search(r'users/(\d+)', url)
        if not match:
            return jsonify({
                'error': 'Invalid URL',
                'message': 'Please provide a valid Pixiv user profile URL'
            }), 400
        
        user_id = match.group(1)
        logger.info(f"Starting download for user {user_id}")
        
        # Get image URLs
        result = pixiv_scraper.scrape_user(user_id, max_illusts=50)
        
        if not result['success']:
            return jsonify(result), 400
        
        # Create zip file in memory
        memory_file = io.BytesIO()
        
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            downloaded = 0
            failed = 0
            
            for idx, image_url in enumerate(result['imageUrls']):
                try:
                    # Download image
                    headers = {
                        'Referer': 'https://www.pixiv.net/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                    
                    response = requests.get(image_url, headers=headers, timeout=30)
                    
                    if response.status_code == 200:
                        # Get filename from URL
                        filename = image_url.split('/')[-1]
                        
                        # Add to zip
                        zf.writestr(filename, response.content)
                        downloaded += 1
                        logger.info(f"Downloaded {downloaded}/{len(result['imageUrls'])}: {filename}")
                    else:
                        failed += 1
                        logger.warning(f"Failed to download: {image_url} (HTTP {response.status_code})")
                        
                except Exception as e:
                    failed += 1
                    logger.error(f"Error downloading image {idx}: {str(e)}")
        
        # Seek to beginning of file
        memory_file.seek(0)
        
        logger.info(f"✅ Zip created: {downloaded} images, {failed} failed")
        
        # Return zip file
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'pixiv_user_{user_id}.zip'
        )
        
    except Exception as e:
        logger.error(f"Error in start_download: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Render provides PORT, default to 5000 for local dev
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"🚀 Starting Python backend on port {port}")
    logger.info(f"📡 Environment: {os.getenv('FLASK_ENV', 'production')}")
    logger.info(f"🔐 Pixiv authenticated: {pixiv_scraper.is_authenticated()}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
