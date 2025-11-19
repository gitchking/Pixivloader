"""
Image Downloader Service
Downloads Pixiv images with proper authentication
Based on download_pixiv.py logic
"""
import logging
import io
import zipfile

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
                # Read content in chunks like download_pixiv.py
                content = b''
                for chunk in response.iter_content(chunk_size=8192):
                    content += chunk
                return content
            else:
                raise Exception(f"HTTP {response.status_code}")
            
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            raise
    
    def create_zip(self, image_urls, user_id='pixiv_user'):
        """Download multiple images and create a ZIP file in memory"""
        try:
            logger.info(f"📦 Creating ZIP with {len(image_urls)} images for user {user_id}")
            
            # Create ZIP in memory
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                downloaded = 0
                failed = 0
                
                for idx, img_url in enumerate(image_urls, 1):
                    try:
                        # Extract filename from URL
                        filename = img_url.split('/')[-1]
                        
                        logger.info(f"📥 [{idx}/{len(image_urls)}] Downloading: {filename}")
                        
                        # Download image using same method as download_pixiv.py
                        image_data = self.download_image(img_url)
                        
                        # Add to ZIP
                        zip_file.writestr(filename, image_data)
                        downloaded += 1
                        
                        logger.info(f"   ✅ Added to ZIP: {filename} ({len(image_data)} bytes)")
                        
                    except Exception as e:
                        failed += 1
                        logger.error(f"   ❌ Failed: {img_url} - {e}")
                        continue
                
                logger.info(f"📊 ZIP creation complete: {downloaded} downloaded, {failed} failed")
            
            # Return ZIP buffer
            zip_buffer.seek(0)
            return zip_buffer, downloaded, failed
            
        except Exception as e:
            logger.error(f"❌ Error creating ZIP: {e}")
            raise
