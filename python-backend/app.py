"""
Pixivloader Python Backend
Fast and reliable Pixiv scraper using official API
"""
from flask import Flask, request, jsonify, send_file, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import requests
import io
import zipfile
from urllib.parse import urlparse
import json
import uuid
from threading import Thread
import time

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

# Store for progress tracking
download_progress = {}

@app.after_request
def after_request(response):
    """Add CORS headers to every response"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

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

@app.route('/api/download/progress/<task_id>', methods=['GET'])
def download_progress_stream(task_id):
    """Stream download progress updates via Server-Sent Events"""
    def generate():
        while True:
            if task_id in download_progress:
                progress_data = download_progress[task_id]
                yield f"data: {json.dumps(progress_data)}\n\n"
                
                # If download is complete or failed, stop streaming
                if progress_data.get('status') in ['completed', 'failed']:
                    break
            time.sleep(0.5)  # Update every 500ms
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/api/download/start', methods=['POST'])
def start_download():
    """Download all images and create a zip file with progress tracking"""
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
        task_id = str(uuid.uuid4())
        
        logger.info(f"Starting download for user {user_id}, task_id: {task_id}")
        
        # Initialize progress
        download_progress[task_id] = {
            'status': 'fetching',
            'progress': 0,
            'total': 0,
            'downloaded': 0,
            'message': 'Fetching image list...'
        }
        
        # Get image URLs
        result = pixiv_scraper.scrape_user(user_id, max_illusts=50)
        
        if not result['success']:
            download_progress[task_id] = {
                'status': 'failed',
                'message': result.get('error', 'Failed to fetch images')
            }
            return jsonify(result), 400
        
        total_images = len(result['imageUrls'])
        download_progress[task_id].update({
            'status': 'downloading',
            'total': total_images,
            'message': f'Downloading {total_images} images...'
        })
        
        # Use optimized concurrent downloader
        try:
            # Determine optimal worker count based on image count
            max_workers = min(8, max(2, total_images // 10))  # 2-8 workers
            
            logger.info(f"Using {max_workers} concurrent workers for {total_images} images")
            
            # Update progress tracking for concurrent downloads
            def update_progress_callback(completed_count, total_count):
                progress_percent = int((completed_count / total_count) * 100)
                download_progress[task_id].update({
                    'progress': progress_percent,
                    'downloaded': completed_count,
                    'message': f'Processing {completed_count}/{total_count} images'
                })
            
            # Use the optimized ImageDownloader
            memory_file, downloaded, failed = image_downloader.create_zip(
                result['imageUrls'], 
                user_id=user_id,
                max_workers=max_workers,
                progress_callback=update_progress_callback
            )
        
        # Update to creating zip status
        download_progress[task_id].update({
            'status': 'creating_zip',
            'progress': 95,
            'message': 'Creating zip file...'
        })
        
        # Seek to beginning of file
        memory_file.seek(0)
        
        # Mark as completed
        download_progress[task_id].update({
            'status': 'completed',
            'progress': 100,
            'downloaded': downloaded,
            'failed': failed,
            'message': f'Complete! {downloaded} images downloaded'
        })
        
        logger.info(f"✅ Zip created: {downloaded} images, {failed} failed")
        
        # Return zip file with task_id in headers
        response = send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'pixiv_user_{user_id}.zip'
        )
        response.headers['X-Task-ID'] = task_id
        return response
        
    except Exception as e:
        logger.error(f"Error in start_download: {str(e)}")
        if 'task_id' in locals():
            download_progress[task_id] = {
                'status': 'failed',
                'message': str(e)
            }
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/download/progress/<task_id>', methods=['GET'])
def get_download_progress(task_id):
    """Get download progress (for future implementation)"""
    # This will be used for real-time progress tracking
    return jsonify({
        'task_id': task_id,
        'status': 'processing',
        'progress': 0,
        'total': 0
    })

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
