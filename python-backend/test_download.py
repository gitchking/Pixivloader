#!/usr/bin/env python3
"""
Test the image downloader service
"""
from services.cookie_scraper import CookieScraper
from services.image_downloader import ImageDownloader

print("🧪 Testing Image Downloader Service")
print("=" * 60)

# Initialize scraper
print("1. Initializing cookie scraper...")
scraper = CookieScraper()
print(f"   Authenticated: {scraper.authenticated}")

# Initialize downloader with scraper's session
print("\n2. Initializing image downloader...")
downloader = ImageDownloader(session=scraper.session)
print("   ✅ Downloader ready")

# Test with a few images
print("\n3. Testing with sample images...")
test_urls = [
    "https://i.pximg.net/img-original/img/2016/04/18/19/50/48/56416595_p0.jpg",
    "https://i.pximg.net/img-original/img/2014/08/20/17/58/10/45476165_p0.jpg"
]

print(f"   Creating ZIP with {len(test_urls)} images...")
try:
    zip_buffer, downloaded, failed = downloader.create_zip(test_urls, "test_user")
    print(f"\n✅ SUCCESS!")
    print(f"   Downloaded: {downloaded}")
    print(f"   Failed: {failed}")
    print(f"   ZIP size: {len(zip_buffer.getvalue())} bytes")
    
    # Save test ZIP
    with open('test_output.zip', 'wb') as f:
        f.write(zip_buffer.getvalue())
    print(f"   Saved to: test_output.zip")
    
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
