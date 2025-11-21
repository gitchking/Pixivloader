const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store for progress tracking
const downloadProgress = {};

// Session rotation system
const availableSessions = [];
if (process.env.PIXIV_PHPSESSID) {
  availableSessions.push(process.env.PIXIV_PHPSESSID);
}
if (process.env.PIXIV_BACKUP_SESSIONS) {
  const backupSessions = process.env.PIXIV_BACKUP_SESSIONS.split(',').map(s => s.trim());
  availableSessions.push(...backupSessions);
}

// Remove duplicates
const uniqueSessions = [...new Set(availableSessions)];

let currentSessionIndex = 0;
let sessionFailureCount = 0;
const maxFailuresBeforeRotation = 3;

// Content service session management with rotation
let contentSession = {
  cookies: uniqueSessions.length > 0 ? `PHPSESSID=${uniqueSessions[0]}` : '',
  authenticated: uniqueSessions.length > 0,
  lastCheck: Date.now(),
  validationCache: null,
  validationCacheTime: 0,
  currentSession: uniqueSessions[0] || null,
  availableSessions: uniqueSessions,
  rotationEnabled: uniqueSessions.length > 1
};

// Session rotation function
function rotateSession() {
  if (contentSession.availableSessions.length <= 1) {
    console.warn('⚠️  No backup sessions available for rotation');
    return false;
  }
  
  currentSessionIndex = (currentSessionIndex + 1) % contentSession.availableSessions.length;
  const newSession = contentSession.availableSessions[currentSessionIndex];
  
  contentSession.currentSession = newSession;
  contentSession.cookies = `PHPSESSID=${newSession}`;
  contentSession.validationCache = null; // Reset cache
  sessionFailureCount = 0;
  
  console.log(`🔄 Rotated to backup session ${currentSessionIndex + 1}/${contentSession.availableSessions.length}`);
  return true;
}

// Check if we should rotate session due to failures
function checkSessionRotation() {
  sessionFailureCount++;
  if (sessionFailureCount >= maxFailuresBeforeRotation && contentSession.rotationEnabled) {
    console.log(`⚠️  Session failed ${sessionFailureCount} times, rotating...`);
    return rotateSession();
  }
  return false;
}

// Session validation function with rate limiting and caching
async function validatePixivSession() {
  if (!process.env.PIXIV_PHPSESSID) {
    return false;
  }
  
  // Use cached result if less than 5 minutes old
  const now = Date.now();
  if (contentSession.validationCache !== null && 
      (now - contentSession.validationCacheTime) < 5 * 60 * 1000) {
    return contentSession.validationCache;
  }
  
  try {
    // Add delay to prevent rate limiting during validation
    await delay(1000);
    const client = createContentClient();
    const response = await client.get('https://www.pixiv.net/ajax/user/11/profile/all');
    const isValid = response.status === 200 && !response.data.error;
    
    // Cache the result
    contentSession.validationCache = isValid;
    contentSession.validationCacheTime = now;
    
    return isValid;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn('Session validation rate limited - using cached result or assuming valid');
      // If we have a cached result, use it; otherwise assume valid
      const result = contentSession.validationCache !== null ? contentSession.validationCache : true;
      return result;
    }
    console.error('Session validation failed:', error.message);
    
    // Cache the failure
    contentSession.validationCache = false;
    contentSession.validationCacheTime = now;
    
    return false;
  }
}

// Auto-authenticate with session rotation system
if (contentSession.availableSessions.length > 0) {
  console.log(`🔐 Session rotation system initialized with ${contentSession.availableSessions.length} session(s)`);
  console.log(`📋 Primary session: ${contentSession.currentSession.substring(0, 10)}...`);
  
  if (contentSession.rotationEnabled) {
    console.log(`🔄 Session rotation enabled with ${contentSession.availableSessions.length} backup sessions`);
  } else {
    console.log('⚠️  No backup sessions - consider adding PIXIV_BACKUP_SESSIONS for better reliability');
  }
  
  contentSession.authenticated = true;
  console.log('✅ Pixiv session system ready (validation deferred to first use)');
} else {
  console.warn('⚠️  No Pixiv sessions configured. Set PIXIV_PHPSESSID and optionally PIXIV_BACKUP_SESSIONS');
}

// Helper function to create axios instance with content service headers
function createContentClient() {
  return axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.pixiv.net/',
      'Cookie': contentSession.cookies,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 30000
  });
}

// Extract user ID from Pixiv URL
function extractUserId(url) {
  const match = url.match(/users\/(\d+)/);
  return match ? match[1] : null;
}

// Extract artwork ID from Pixiv URL
function extractArtworkId(url) {
  const match = url.match(/artworks\/(\d+)/);
  return match ? match[1] : null;
}

// Get user artworks using Pixiv's AJAX API with session rotation
async function getUserArtworks(userId, limit = 25) {
  try {
    const client = createContentClient();
    
    // Add delay before user profile request
    await delay(1000);
    
    // Use Pixiv's AJAX API to get all user artworks
    const apiUrl = `https://www.pixiv.net/ajax/user/${userId}/profile/all`;
    const response = await client.get(apiUrl);
    
    if (response.status === 429) {
      // Rate limited - try session rotation
      if (checkSessionRotation()) {
        console.log('Rate limited on user profile, trying with rotated session...');
        await delay(3000);
        // Retry with new session
        const newClient = createContentClient();
        const retryResponse = await newClient.get(apiUrl);
        if (retryResponse.status !== 200) {
          throw new Error(`Failed to fetch user data after rotation: ${retryResponse.status}`);
        }
        return processUserArtworksResponse(retryResponse.data, userId, limit);
      } else {
        throw new Error('Rate limited and no backup sessions available');
      }
    }
    
    if (response.status !== 200) {
      checkSessionRotation(); // Mark as failure
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    // Reset failure count on success
    sessionFailureCount = 0;
    
    return processUserArtworksResponse(response.data, userId, limit);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      checkSessionRotation();
      throw new Error('Rate limited - please try again in a few minutes');
    }
    console.error('Error fetching user artworks:', error.message);
    throw error;
  }
}

// Process user artworks response
function processUserArtworksResponse(data, userId, limit) {
  if (data.error) {
    throw new Error(data.message || 'API error');
  }

  // Extract artwork IDs from the response
  const artworkIds = [];
  if (data.body && data.body.illusts) {
    artworkIds.push(...Object.keys(data.body.illusts));
  }
  
  // Sort artwork IDs in descending order (latest first)
  artworkIds.sort((a, b) => parseInt(b) - parseInt(a));
  
  console.log(`Found ${artworkIds.length} artworks for user ${userId}`);
  
  if (artworkIds.length === 0) {
    throw new Error('No artworks found for this user');
  }

  // Conservative limit to prevent rate limiting (default 25, max 50 for mobile)
  const safeLimit = Math.min(limit || 25, 50);
  const limitedIds = artworkIds.slice(0, safeLimit);
  const artworks = limitedIds.map(id => ({
    id: id,
    url: `https://www.pixiv.net/artworks/${id}`,
    title: `Artwork ${id}`
  }));

  console.log(`Returning ${artworks.length} artworks (limited from ${artworkIds.length} total)`);
  return artworks;
}

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get artwork images using Pixiv's AJAX API with rate limiting and session rotation
async function getArtworkImages(artworkId, retryCount = 0) {
  try {
    const client = createContentClient();
    
    // Progressive delay: start with 1s, increase with retries
    const baseDelay = 1000 + (retryCount * 500);
    await delay(baseDelay);
    
    // Use Pixiv's AJAX API to get artwork details
    const apiUrl = `https://www.pixiv.net/ajax/illust/${artworkId}`;
    const response = await client.get(apiUrl);
    
    if (response.status === 429) {
      // Rate limited - try session rotation first
      if (retryCount === 0 && checkSessionRotation()) {
        console.log(`Rate limited for artwork ${artworkId}, trying with rotated session...`);
        await delay(2000); // Wait before retry with new session
        return getArtworkImages(artworkId, retryCount + 1);
      }
      
      // If rotation didn't help or not available, wait longer
      if (retryCount < 2) {
        const waitTime = Math.min((retryCount + 1) * 3000, 10000); // Max 10s wait
        console.log(`Rate limited for artwork ${artworkId}, retrying in ${waitTime/1000} seconds...`);
        await delay(waitTime);
        return getArtworkImages(artworkId, retryCount + 1);
      } else {
        console.error(`Rate limit exceeded for artwork ${artworkId} after ${retryCount} retries, skipping`);
        return [];
      }
    }
    
    if (response.status !== 200) {
      console.error(`Failed to fetch artwork ${artworkId}: ${response.status}`);
      checkSessionRotation(); // Mark as failure
      return [];
    }

    const data = response.data;
    
    if (data.error) {
      console.error(`API error for artwork ${artworkId}:`, data.message);
      return [];
    }

    // Reset failure count on success
    sessionFailureCount = 0;

    const images = [];
    
    if (data.body && data.body.urls && data.body.urls.original) {
      // Single image artwork
      images.push(data.body.urls.original);
    } else if (data.body && data.body.pageCount > 1) {
      // Multi-page artwork - get all pages with rate limiting
      await delay(500); // Additional delay for multi-page requests
      const pagesUrl = `https://www.pixiv.net/ajax/illust/${artworkId}/pages`;
      const pagesResponse = await client.get(pagesUrl);
      
      if (pagesResponse.status === 200 && !pagesResponse.data.error) {
        const pages = pagesResponse.data.body;
        pages.forEach(page => {
          if (page.urls && page.urls.original) {
            images.push(page.urls.original);
          }
        });
      }
    }

    console.log(`Found ${images.length} images for artwork ${artworkId}`);
    return images;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Rate limited - try session rotation and retry
      if (retryCount === 0 && checkSessionRotation()) {
        console.log(`Rate limited for artwork ${artworkId}, trying with rotated session...`);
        await delay(2000);
        return getArtworkImages(artworkId, retryCount + 1);
      }
      
      if (retryCount < 2) {
        const waitTime = Math.min((retryCount + 1) * 3000, 10000);
        console.log(`Rate limited for artwork ${artworkId}, retrying in ${waitTime/1000} seconds...`);
        await delay(waitTime);
        return getArtworkImages(artworkId, retryCount + 1);
      }
    } else {
      checkSessionRotation(); // Mark as failure for other errors too
    }
    
    console.error(`Error fetching artwork ${artworkId}:`, error.message);
    return [];
  }
}

// Download image with retry logic
async function downloadImage(imageUrl, retries = 3) {
  const client = createContentClient();
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await client.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://www.pixiv.net/'
        }
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Download attempt ${i + 1} failed for ${imageUrl}:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mobile backend is running',
    pixiv_authenticated: contentSession.authenticated,
    session_system: {
      total_sessions: contentSession.availableSessions.length,
      current_session_index: currentSessionIndex + 1,
      rotation_enabled: contentSession.rotationEnabled,
      failure_count: sessionFailureCount,
      current_session_preview: contentSession.currentSession ? contentSession.currentSession.substring(0, 10) + '...' : 'none'
    },
    rate_limiting: {
      enabled: true,
      base_delay: '1000ms',
      progressive_delay: 'enabled',
      max_retries: 2,
      session_rotation: contentSession.rotationEnabled
    },
    limits: {
      max_artworks: 50,
      max_retries_per_artwork: 2
    },
    last_check: new Date(contentSession.lastCheck).toISOString(),
    help: contentSession.authenticated ? 'Session system ready' : 'Please configure PIXIV_PHPSESSID'
  });
});

// Manual session rotation endpoint
app.post('/api/session/rotate', (req, res) => {
  if (!contentSession.rotationEnabled) {
    return res.status(400).json({
      error: 'Session rotation not available',
      message: 'No backup sessions configured. Add PIXIV_BACKUP_SESSIONS to enable rotation.'
    });
  }
  
  const oldSession = contentSession.currentSession;
  const rotated = rotateSession();
  
  if (rotated) {
    res.json({
      success: true,
      message: 'Session rotated successfully',
      old_session: oldSession ? oldSession.substring(0, 10) + '...' : 'none',
      new_session: contentSession.currentSession.substring(0, 10) + '...',
      session_index: currentSessionIndex + 1,
      total_sessions: contentSession.availableSessions.length
    });
  } else {
    res.status(500).json({
      error: 'Rotation failed',
      message: 'Could not rotate to backup session'
    });
  }
});

// Test endpoint for small downloads
app.post('/api/test/small', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Pixiv URL is required'
      });
    }

    const pixivUserId = extractUserId(url);
    const artworkId = extractArtworkId(url);

    if (!pixivUserId && !artworkId) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid Pixiv user or artwork URL'
      });
    }

    let artworks = [];
    
    if (pixivUserId) {
      // Get only first 5 artworks for testing
      artworks = await getUserArtworks(pixivUserId, 5);
    } else if (artworkId) {
      // Single artwork
      artworks = [{
        id: artworkId,
        url: `https://www.pixiv.net/artworks/${artworkId}`,
        title: `Artwork ${artworkId}`
      }];
    }

    res.json({
      success: true,
      artworks: artworks.map(a => ({ id: a.id, title: a.title })),
      totalArtworks: artworks.length,
      message: `Found ${artworks.length} artworks (test mode - limited to 5)`
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

// Set content service session
app.post('/api/auth/session', (req, res) => {
  try {
    const { cookies } = req.body;
    
    if (!cookies) {
      return res.status(400).json({
        error: 'Missing cookies',
        message: 'Content service session cookies are required'
      });
    }

    contentSession.cookies = cookies;
    contentSession.authenticated = true;
    contentSession.lastCheck = Date.now();

    res.json({
      success: true,
      message: 'Content service session updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set session',
      message: error.message
    });
  }
});

// Get artwork list (no download, just return list)
app.post('/api/download/start', async (req, res) => {
  try {
    const { url, userId, downloadLocation } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Pixiv URL is required'
      });
    }

    if (!contentSession.authenticated) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Pixiv session expired or not configured. Please update PIXIV_PHPSESSID environment variable with a fresh session.',
        help: 'Get a fresh session by: 1) Login to pixiv.net 2) Open DevTools 3) Copy PHPSESSID cookie value',
        current_session: process.env.PIXIV_PHPSESSID ? 'configured_but_expired' : 'not_configured'
      });
    }

    const pixivUserId = extractUserId(url);
    const artworkId = extractArtworkId(url);

    if (!pixivUserId && !artworkId) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid Pixiv user or artwork URL'
      });
    }

    let artworks = [];
    
    if (pixivUserId) {
      // Get user artworks (all of them, sorted latest first)
      artworks = await getUserArtworks(pixivUserId);
    } else if (artworkId) {
      // Single artwork
      artworks = [{
        id: artworkId,
        url: `https://www.pixiv.net/artworks/${artworkId}`,
        title: `Artwork ${artworkId}`
      }];
    }

    if (artworks.length === 0) {
      return res.status(404).json({
        error: 'No artworks found',
        message: 'No artworks found for this user'
      });
    }

    // Get image URLs for all artworks with rate limiting
    const artworkDetails = [];
    console.log(`Processing ${artworks.length} artworks with rate limiting...`);
    
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i];
      try {
        console.log(`Processing artwork ${i + 1}/${artworks.length}: ${artwork.id}`);
        const images = await getArtworkImages(artwork.id);
        if (images.length > 0) {
          artworkDetails.push({
            id: artwork.id,
            title: artwork.title,
            images: images,
            imageCount: images.length
          });
        }
        
        // Progress update every 5 artworks
        if ((i + 1) % 5 === 0) {
          console.log(`Processed ${i + 1}/${artworks.length} artworks, found ${artworkDetails.length} with images`);
        }
        
      } catch (error) {
        console.error(`Failed to get images for artwork ${artwork.id}:`, error.message);
      }
    }

    res.json({
      success: true,
      artworks: artworkDetails,
      totalArtworks: artworkDetails.length,
      totalImages: artworkDetails.reduce((sum, artwork) => sum + artwork.imageCount, 0),
      message: `Found ${artworkDetails.length} artworks`
    });

  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: error.message
    });
  }
});

// Get download progress
// Download individual image
app.get('/api/download/image', async (req, res) => {
  try {
    const { url, filename } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Image URL is required'
      });
    }

    if (!contentSession.authenticated) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Pixiv session expired or not configured. Please update PIXIV_PHPSESSID environment variable with a fresh session.',
        help: 'Get a fresh session by: 1) Login to pixiv.net 2) Open DevTools 3) Copy PHPSESSID cookie value',
        current_session: process.env.PIXIV_PHPSESSID ? 'configured_but_expired' : 'not_configured'
      });
    }

    console.log(`Downloading image: ${url}`);
    
    // Download the image
    const imageBuffer = await downloadImage(url);
    
    // Set appropriate headers
    const imageName = filename || `pixiv_image_${Date.now()}.jpg`;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${imageName}"`);
    res.setHeader('Content-Length', imageBuffer.length);
    
    // Send the image
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({
      error: 'Failed to download image',
      message: error.message
    });
  }
});

app.get('/api/download/progress/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  if (!downloadProgress[taskId]) {
    return res.status(404).json({
      error: 'Task not found',
      message: 'Invalid task ID'
    });
  }

  res.json(downloadProgress[taskId]);
});

// Download progress stream (Server-Sent Events)
app.get('/api/download/stream/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendProgress = () => {
    if (downloadProgress[taskId]) {
      res.write(`data: ${JSON.stringify(downloadProgress[taskId])}\n\n`);
      
      if (downloadProgress[taskId].status === 'completed' || 
          downloadProgress[taskId].status === 'failed') {
        res.end();
        return;
      }
    }
    setTimeout(sendProgress, 1000);
  };

  sendProgress();
});

// Download ZIP file
app.get('/api/download/zip/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  if (!downloadProgress[taskId] || downloadProgress[taskId].status !== 'completed') {
    return res.status(404).json({
      error: 'Download not ready',
      message: 'Download is not completed yet'
    });
  }

  const zipPath = path.join(__dirname, 'downloads', `${taskId}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({
      error: 'File not found',
      message: 'ZIP file not found'
    });
  }

  res.download(zipPath, `pixiv_download_${taskId}.zip`, (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    // Clean up file after download
    setTimeout(() => {
      try {
        fs.unlinkSync(zipPath);
        delete downloadProgress[taskId];
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }, 5000);
  });
});

// Process download function
async function processDownload(taskId, userId, artworkId, originalUrl, downloadLocation = 'Downloads') {
  try {
    let artworks = [];
    
    if (userId) {
      // Download user profile
      downloadProgress[taskId].message = 'Fetching user artworks...';
      artworks = await getUserArtworks(userId, 50);
    } else if (artworkId) {
      // Download single artwork
      artworks = [{
        id: artworkId,
        url: originalUrl,
        title: `Artwork ${artworkId}`
      }];
    }

    if (artworks.length === 0) {
      downloadProgress[taskId] = {
        status: 'failed',
        message: 'No artworks found'
      };
      return;
    }

    downloadProgress[taskId] = {
      status: 'downloading',
      progress: 10,
      total: artworks.length,
      downloaded: 0,
      failed: 0,
      message: `Found ${artworks.length} artworks. Starting download...`,
      downloadLocation
    };

    // Create downloads directory based on user preference
    const baseDir = process.env.DOWNLOADS_BASE_PATH || path.join(__dirname, 'downloads');
    const downloadsDir = path.join(baseDir, downloadLocation);
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Create ZIP file in the specified location
    const zipPath = path.join(downloadsDir, `pixiv_${taskId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    let downloaded = 0;
    let failed = 0;

    // Download each artwork
    for (const artwork of artworks) {
      try {
        downloadProgress[taskId].message = `Downloading ${artwork.title}...`;
        
        const images = await getArtworkImages(artwork.id);
        
        for (let i = 0; i < images.length; i++) {
          try {
            const imageBuffer = await downloadImage(images[i]);
            const filename = `${artwork.id}_${i + 1}.jpg`;
            archive.append(imageBuffer, { name: filename });
            downloaded++;
          } catch (error) {
            console.error(`Failed to download image ${i + 1} from artwork ${artwork.id}:`, error.message);
            failed++;
          }
        }

        // Update progress
        const progress = Math.round(((downloaded + failed) / (artworks.length * 2)) * 80) + 10;
        downloadProgress[taskId] = {
          status: 'downloading',
          progress: Math.min(progress, 90),
          total: artworks.length,
          downloaded,
          failed,
          message: `Downloaded ${downloaded} images, ${failed} failed`
        };

      } catch (error) {
        console.error(`Failed to process artwork ${artwork.id}:`, error.message);
        failed++;
      }
    }

    // Finalize ZIP
    downloadProgress[taskId] = {
      status: 'creating_zip',
      progress: 95,
      total: artworks.length,
      downloaded,
      failed,
      message: 'Creating ZIP file...'
    };

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      archive.finalize();
    });

    // Complete
    downloadProgress[taskId] = {
      status: 'completed',
      progress: 100,
      total: artworks.length,
      downloaded,
      failed,
      message: `Download complete! ${downloaded} images downloaded, ${failed} failed`
    };

  } catch (error) {
    console.error('Download process error:', error);
    downloadProgress[taskId] = {
      status: 'failed',
      message: error.message
    };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Pixivloader mobile backend running on port ${PORT}`);
  console.log(`📱 Ready to serve mobile app requests`);
});

module.exports = app;