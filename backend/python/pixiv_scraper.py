#!/usr/bin/env python3
"""
Powerful Pixiv Scraper using official Pixiv API
"""
import os
import sys
import json
import time
from pixivpy3 import AppPixivAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PixivScraper:
    def __init__(self):
        self.api = AppPixivAPI()
        self.username = os.getenv('PIXIV_USERNAME')
        self.password = os.getenv('PIXIV_PASSWORD')
        self.authenticated = False
        
    def login(self):
        """Login to Pixiv using official API"""
        try:
            print("🔐 Logging into Pixiv API...", file=sys.stderr)
            self.api.login(self.username, self.password)
            self.authenticated = True
            print("✅ Successfully authenticated with Pixiv API", file=sys.stderr)
            return True
        except Exception as e:
            print(f"❌ Login failed: {str(e)}", file=sys.stderr)
            return False
    
    def get_user_illusts(self, user_id, max_illusts=100):
        """Get all illustrations from a user"""
        try:
            print(f"📸 Fetching illustrations for user {user_id}...", file=sys.stderr)
            
            illusts = []
            offset = 0
            
            while len(illusts) < max_illusts:
                # Get user illustrations
                result = self.api.user_illusts(user_id, offset=offset)
                
                if not result or 'illusts' not in result:
                    break
                
                batch = result['illusts']
                if not batch:
                    break
                
                illusts.extend(batch)
                print(f"  📊 Fetched {len(illusts)} illustrations so far...", file=sys.stderr)
                
                # Check if there are more
                if 'next_url' not in result or not result['next_url']:
                    break
                
                offset += len(batch)
                time.sleep(0.5)  # Rate limiting
            
            print(f"✅ Total illustrations found: {len(illusts)}", file=sys.stderr)
            return illusts[:max_illusts]
            
        except Exception as e:
            print(f"❌ Error fetching illustrations: {str(e)}", file=sys.stderr)
            return []
    
    def extract_image_urls(self, illusts):
        """Extract all image URLs from illustrations"""
        image_urls = []
        
        for illust in illusts:
            try:
                # Get the highest quality image
                if 'meta_single_page' in illust and illust['meta_single_page']:
                    # Single image
                    if 'original_image_url' in illust['meta_single_page']:
                        image_urls.append(illust['meta_single_page']['original_image_url'])
                    elif 'large_image_url' in illust['image_urls']:
                        image_urls.append(illust['image_urls']['large_image_url'])
                
                # Multiple images
                if 'meta_pages' in illust and illust['meta_pages']:
                    for page in illust['meta_pages']:
                        if 'image_urls' in page and 'original' in page['image_urls']:
                            image_urls.append(page['image_urls']['original'])
                        elif 'image_urls' in page and 'large' in page['image_urls']:
                            image_urls.append(page['image_urls']['large'])
                
            except Exception as e:
                print(f"⚠️  Error extracting URL from illust {illust.get('id', 'unknown')}: {str(e)}", file=sys.stderr)
                continue
        
        print(f"🎉 Extracted {len(image_urls)} image URLs", file=sys.stderr)
        return image_urls
    
    def scrape_user(self, user_id, max_illusts=100):
        """Main scraping function"""
        try:
            # Login if not authenticated
            if not self.authenticated:
                if not self.login():
                    return {
                        'success': False,
                        'error': 'Authentication failed',
                        'images': []
                    }
            
            # Get illustrations
            illusts = self.get_user_illusts(user_id, max_illusts)
            
            if not illusts:
                return {
                    'success': False,
                    'error': 'No illustrations found',
                    'images': []
                }
            
            # Extract image URLs
            image_urls = self.extract_image_urls(illusts)
            
            return {
                'success': True,
                'authenticated': self.authenticated,
                'artworks': len(illusts),
                'images': len(image_urls),
                'imageUrls': image_urls
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'images': []
            }

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'User ID required'}))
        sys.exit(1)
    
    user_id = sys.argv[1]
    max_illusts = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    scraper = PixivScraper()
    result = scraper.scrape_user(user_id, max_illusts)
    
    # Output JSON result
    print(json.dumps(result))

if __name__ == '__main__':
    main()
