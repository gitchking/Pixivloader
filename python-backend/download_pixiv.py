#!/usr/bin/env python3
"""
Download Pixiv images directly to your device
Usage: python download_pixiv.py <pixiv_url>
Example: python download_pixiv.py https://www.pixiv.net/en/users/11
"""
import os
import sys
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
from services.cookie_scraper import CookieScraper

load_dotenv()

def extract_user_id(url):
    """Extract user ID from Pixiv URL"""
    match = re.search(r'users/(\d+)', url)
    if match:
        return match.group(1)
    return None

def download_image(url, save_path, session):
    """Download a single image"""
    try:
        # Pixiv requires referer header
        headers = {
            'Referer': 'https://www.pixiv.net/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = session.get(url, headers=headers, stream=True)
        
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            print(f"   ❌ Failed to download: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("📥 Pixiv Image Downloader")
    print("=" * 60)
    print()
    
    # Check cookie
    cookie = os.getenv('PIXIV_PHPSESSID')
    if not cookie:
        print("❌ No PIXIV_PHPSESSID in .env")
        print("   Add your cookie to python-backend/.env")
        sys.exit(1)
    
    # Get URL from command line
    if len(sys.argv) < 2:
        print("Usage: python download_pixiv.py <pixiv_url>")
        print()
        print("Examples:")
        print("  python download_pixiv.py https://www.pixiv.net/en/users/11")
        print("  python download_pixiv.py https://www.pixiv.net/en/users/16034374")
        print()
        sys.exit(1)
    
    url = sys.argv[1]
    user_id = extract_user_id(url)
    
    if not user_id:
        print(f"❌ Invalid Pixiv URL: {url}")
        print("   URL should be like: https://www.pixiv.net/en/users/12345")
        sys.exit(1)
    
    print(f"🎨 User ID: {user_id}")
    print(f"🔗 URL: {url}")
    print()
    
    # Create download folder
    download_folder = Path(f"downloads/user_{user_id}")
    download_folder.mkdir(parents=True, exist_ok=True)
    print(f"📁 Download folder: {download_folder.absolute()}")
    print()
    
    # Initialize scraper
    print("🔧 Initializing scraper...")
    scraper = CookieScraper()
    
    if not scraper.authenticated:
        print("❌ Failed to authenticate with cookie")
        sys.exit(1)
    
    print("✅ Authenticated!")
    print()
    
    # Get image URLs
    print(f"🚀 Fetching artworks from user {user_id}...")
    result = scraper.scrape_user(user_id, max_artworks=50)
    
    if not result['success']:
        print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)
    
    print(f"✅ Found {result['artworks']} artworks")
    print(f"📸 Total images: {result['images']}")
    print()
    
    if not result['imageUrls']:
        print("⚠️  No images to download")
        sys.exit(0)
    
    # Download images
    print("📥 Starting downloads...")
    print("-" * 60)
    
    downloaded = 0
    failed = 0
    
    for i, image_url in enumerate(result['imageUrls'], 1):
        # Extract filename from URL
        filename = image_url.split('/')[-1]
        save_path = download_folder / filename
        
        # Skip if already downloaded
        if save_path.exists():
            print(f"⏭️  [{i}/{len(result['imageUrls'])}] Skipped (already exists): {filename}")
            continue
        
        print(f"📥 [{i}/{len(result['imageUrls'])}] Downloading: {filename}")
        
        if download_image(image_url, save_path, scraper.session):
            downloaded += 1
            print(f"   ✅ Saved to: {save_path}")
        else:
            failed += 1
    
    print()
    print("=" * 60)
    print("📊 DOWNLOAD COMPLETE")
    print("=" * 60)
    print(f"✅ Downloaded: {downloaded}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Location: {download_folder.absolute()}")
    print()

if __name__ == '__main__':
    main()
