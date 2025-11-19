#!/usr/bin/env python3
"""
Simple test to debug scraping issues
"""
import os
from dotenv import load_dotenv
from services.cookie_scraper import CookieScraper

load_dotenv()

def main():
    print("=" * 60)
    print("🧪 Simple Scraper Test")
    print("=" * 60)
    print()
    
    # Check cookie
    cookie = os.getenv('PIXIV_PHPSESSID')
    if not cookie:
        print("❌ No PIXIV_PHPSESSID in .env")
        return
    
    print(f"✅ Cookie: {cookie[:20]}...")
    print()
    
    # Test scraper
    scraper = CookieScraper()
    
    # Test with user 11 (Pixiv official)
    user_id = "11"
    print(f"🚀 Testing with user {user_id}...")
    print()
    
    result = scraper.scrape_user(user_id, max_artworks=5)
    
    print()
    print("=" * 60)
    print("📊 RESULT")
    print("=" * 60)
    print()
    
    if result['success']:
        print(f"✅ SUCCESS!")
        print(f"   Artworks: {result['artworks']}")
        print(f"   Images: {result['images']}")
        print()
        
        if result['imageUrls']:
            print("📸 Image URLs:")
            for i, url in enumerate(result['imageUrls'][:3], 1):
                print(f"   {i}. {url}")
        else:
            print("⚠️  No image URLs extracted")
    else:
        print(f"❌ FAILED")
        print(f"   Error: {result.get('error', 'Unknown')}")
        print()
        print("🔍 Debug Info:")
        print(f"   - Cookie set: {bool(cookie)}")
        print(f"   - Cookie length: {len(cookie) if cookie else 0}")
        print(f"   - User ID: {user_id}")

if __name__ == '__main__':
    main()
