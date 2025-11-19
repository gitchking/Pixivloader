"""
Simple Pixiv Scraper using PHPSESSID cookie
"""
import os
import logging
from services.cookie_scraper import CookieScraper

logger = logging.getLogger(__name__)

class PixivScraper:
    def __init__(self):
        self.scraper = CookieScraper()
        self.authenticated = self.scraper.authenticated
    
    def is_authenticated(self):
        """Check if authenticated"""
        return self.authenticated
    
    def scrape_user(self, user_id, max_illusts=100):
        """Scrape user artworks using cookie"""
        return self.scraper.scrape_user(user_id, max_illusts)
