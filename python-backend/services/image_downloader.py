"""
Image Downloader Service
Downloads Pixiv images with proper authentication
Based on download_pixiv.py logic
"""
import logging
import io
import zipfile
import concurrent.futures
import threading
from functools import partial

logger = logging.getLogger(__name__)

class ImageDownloader:
    def __init__(self, session):
        """Initialize with authenticated session from CookieScraper"""
        self.session = session
    
    def download_image(self, url):
        """Download a single image and return bytes (from download_pixiv.py)"""
        try:
            # Pixiv requires referer header
            headers = {
                'Referer': 'https://www.pixiv.net/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = self.session.get(url, headers=headers, stream=True, timeout=30)
            
            if response.status_code == 200:
                # Read content in larger chunks for better performance
                content = b''
                for chunk in response.iter_content(chunk_size=65536):  # 64KB chunks
                    content += chunk
                return content
            else:
                raise Exception(f"HTTP {response.status_code}")
            
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            raise
    
    def download_single_image(self, img_url, idx, total):
        """Download a single image with error handling"""
        try:
            filename = img_url.split('/')[-1]
            logger.info(f"📥 [{idx}/{total}] Downloading: {filename}")
            
            image_data = self.download_image(img_url)
            logger.info(f"   ✅ Downloaded: {filename} ({len(image_data)} bytes)")
            
            return {
                'success': True,
                'filename': filename,
                'data': image_data,
                'url': img_url
            }
        except Exception as e:
            logger.error(f"   ❌ Failed: {img_url} - {e}")
            return {
                'success': False,
                'filename': img_url.split('/')[-1],
                'error': str(e),
                'url': img_url
            }

    def create_zip(self, image_urls, user_id='pixiv_user', max_workers=4, progress_callback=None):
        """Download multiple images concurrently and create a ZIP file in memory"""
        try:
            logger.info(f"📦 Creating ZIP with {len(image_urls)} images for user {user_id} (using {max_workers} workers)")
            
            # Create ZIP in memory
            zip_buffer = io.BytesIO()
            zip_lock = threading.Lock()
            
            downloaded = 0
            failed = 0
            
            # Use ThreadPoolExecutor for concurrent downloads
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all download tasks
                future_to_url = {
                    executor.submit(self.download_single_image, url, idx, len(image_urls)): url 
                    for idx, url in enumerate(image_urls, 1)
                }
                
                # Create ZIP file
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=1) as zip_file:
                    # Process completed downloads
                    for future in concurrent.futures.as_completed(future_to_url):
                        result = future.result()
                        
                        if result['success']:
                            # Thread-safe ZIP writing
                            with zip_lock:
                                zip_file.writestr(result['filename'], result['data'])
                            downloaded += 1
                        else:
                            failed += 1
                        
                        # Call progress callback if provided
                        if progress_callback:
                            progress_callback(downloaded + failed, len(image_urls))
                
                logger.info(f"📊 ZIP creation complete: {downloaded} downloaded, {failed} failed")
            
            # Return ZIP buffer
            zip_buffer.seek(0)
            return zip_buffer, downloaded, failed
            
        except Exception as e:
            logger.error(f"❌ Error creating ZIP: {e}")
            raise
