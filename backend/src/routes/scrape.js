import express from 'express';
import { scrapePixivProfile } from '../services/pixivScraper.js';
import { updateDownloadHistory } from '../services/supabase.js';

const router = express.Router();

// Start scraping a Pixiv profile
router.post('/start', async (req, res) => {
  try {
    const { url, userId, historyId } = req.body;

    if (!url || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'URL and userId are required'
      });
    }

    // Validate Pixiv URL
    const pixivUrlPattern = /https?:\/\/(www\.)?pixiv\.net\/(en\/)?users\/\d+/;
    if (!pixivUrlPattern.test(url)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid Pixiv user profile URL'
      });
    }

    // Start scraping in background
    res.json({
      success: true,
      message: 'Scraping started',
      historyId
    });

    // Run scraping asynchronously
    scrapePixivProfile(url, userId, historyId).catch(error => {
      console.error('Scraping error:', error);
    });

  } catch (error) {
    console.error('Error starting scrape:', error);
    res.status(500).json({
      error: 'Failed to start scraping',
      message: error.message
    });
  }
});

// Get scraping status
router.get('/status/:historyId', async (req, res) => {
  try {
    const { historyId } = req.params;
    
    // TODO: Implement status checking from Supabase
    res.json({
      success: true,
      historyId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

export default router;
