"""
Pixiv Scraper using PHPSESSID cookie (works with browser cookies!)
"""
import os
import logging
import requests
import re
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class CookieScraper:
    def __init__(self):
        self.phpsessid = os.getenv('PIXIV_PHPSESSID', '')
        self.session = requests.Session()
        self.authenticated = False
        
        if self.phpsessid:
            self._setup_session()
    
    def _setup_session(self):
        """Setup session with cookie"""
        try:
            self.session.cookies.set('PHPSESSID', self.phpsessid, domain='.pixiv.net')
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.pixiv.net/'
            })
            self.authenticated = True
            logger.info("✅ Session configured with PHPSESSID cookie")
        except Exception as e:
            logger.error(f"❌ Failed to setup session: {e}")
    
    def scrape_user(self, user_id, max_artworks=100):
        """Scrape user artworks using cookie authentication"""
        try:
            if not self.authenticated:
                return {
                    'success': False,
                    'error': 'No PHPSESSID cookie provided',
                    'images': 0,
                    'imageUrls': []
                }
            
            logger.info(f"🚀 Scraping user {user_id} with cookie auth...")
            
            # Get user's artworks page
            url = f'https://www.pixiv.net/ajax/user/{user_id}/profile/all'
            response = self.session.get(url)
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'error': f'Failed to fetch user data: {response.status_code}',
                    'images': 0,
                    'imageUrls': []
                }
            
            data = response.json()
            
            if 'error' in data and data['error']:
                return {
                    'success': False,
                    'error': data.get('message', 'API error'),
                    'images': 0,
                    'imageUrls': []
                }
            
            # Extract artwork IDs
            artwork_ids = []
            if 'body' in data and 'illusts' in data['body']:
                artwork_ids = list(data['body']['illusts'].keys())
            
            logger.info(f"✅ Found {len(artwork_ids)} artworks")
            
            if not artwork_ids:
                return {
                    'success': False,
                    'error': 'No artworks found',
                    'images': 0,
                    'imageUrls': []
                }
            
            # Get image URLs from each artwork
            image_urls = []
            for i, artwork_id in enumerate(artwork_ids[:max_artworks], 1):
                logger.info(f"📸 Processing artwork {i}/{min(len(artwork_ids), max_artworks)}: {artwork_id}")
                
                urls = self._get_artwork_images(artwork_id)
                image_urls.extend(urls)
            
            logger.info(f"🎉 Extracted {len(image_urls)} image URLs")
            
            return {
                'success': True,
                'authenticated': True,
                'artworks': len(artwork_ids),
                'images': len(image_urls),
                'imageUrls': image_urls
            }
            
        except Exception as e:
            logger.error(f"❌ Scraping error: {e}")
            return {
                'success': False,
                'error': str(e),
                'images': 0,
                'imageUrls': []
            }
    
    def _get_artwork_images(self, artwork_id):
        """Get image URLs from an artwork"""
        try:
            url = f'https://www.pixiv.net/ajax/illust/{artwork_id}'
            response = self.session.get(url)
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            
            if 'error' in data and data['error']:
                return []
            
            image_urls = []
            body = data.get('body', {})
            
            # Single image
            if 'urls' in body and 'original' in body['urls']:
                image_urls.append(body['urls']['original'])
            
            # Multiple images
            if 'pageCount' in body and body['pageCount'] > 1:
                # Get pages
                pages_url = f'https://www.pixiv.net/ajax/illust/{artwork_id}/pages'
                pages_response = self.session.get(pages_url)
                
                if pages_response.status_code == 200:
                    pages_data = pages_response.json()
                    if 'body' in pages_data:
                        for page in pages_data['body']:
                            if 'urls' in page and 'original' in page['urls']:
                                image_urls.append(page['urls']['original'])
            
            return image_urls
            
        except Exception as e:
            logger.warning(f"Error getting images for artwork {artwork_id}: {e}")
            return []
