#!/usr/bin/env python3
"""
Test Pixiv Scraper directly from terminal
"""
import sys
import os
from dotenv import load_dotenv
from services.pixiv_scraper import PixivScraper

# Load environment variables
load_dotenv()

def main():
    print("=" * 60)
    print("🧪 Testing Pixiv Scraper")
    print("=" * 60)
    print()
    
    # Check if PHPSESSID cookie is set
    phpsessid = os.getenv('PIXIV_PHPSESSID')
    if not phpsessid or phpsessid == 'YOUR_COOKIE_HERE':
        print("❌ ERROR: PIXIV_PHPSESSID not set in .env")
        print()
        print("To fix this:")
        print("1. Go to https://www.pixiv.net/ and login")
        print("2. Press F12 → Application → Cookies")
        print("3. Copy PHPSESSID cookie value")
        print("4. Add to python-backend/.env:")
        print("   PIXIV_PHPSESSID=your_cookie_value")
        print()
        sys.exit(1)
    
    print(f"✅ PHPSESSID cookie found: {phpsessid[:20]}...")
    print()
    
    # Get user ID from command line or use default
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
    else:
        user_id = "16034374"  # Default test user
        print(f"ℹ️  No user ID provided, using default: {user_id}")
        print(f"   Usage: python test_scraper.py <user_id>")
        print()
    
    # Initialize scraper
    print("🔧 Initializing scraper...")
    scraper = PixivScraper()
    
    if not scraper.is_authenticated():
        print("❌ Failed to setup session with cookie")
        print("   Check your PIXIV_PHPSESSID in .env")
        print("   Cookie might be expired - get a new one from browser")
        sys.exit(1)
    
    print("✅ Session configured with cookie!")
    print()
    
    # Start scraping
    print(f"🚀 Starting scrape for user: {user_id}")
    print("-" * 60)
    
    try:
        result = scraper.scrape_user(user_id, max_illusts=10)
        
        print()
        print("=" * 60)
        print("📊 RESULTS")
        print("=" * 60)
        
        if result['success']:
            print(f"✅ Success: {result['success']}")
            print(f"🎨 Artworks found: {result['artworks']}")
            print(f"🖼️  Images extracted: {result['images']}")
            print()
            
            if result['imageUrls']:
                print("📸 Sample Image URLs (first 5):")
                for i, url in enumerate(result['imageUrls'][:5], 1):
                    print(f"   {i}. {url}")
                
                if len(result['imageUrls']) > 5:
                    print(f"   ... and {len(result['imageUrls']) - 5} more")
            
            print()
            print("🎉 Test completed successfully!")
            
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            sys.exit(1)
            
    except Exception as e:
        print()
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
