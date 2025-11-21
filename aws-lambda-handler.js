// AWS Lambda handler for Pixiv backend
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables for Lambda
const availableSessions = [];
if (process.env.PIXIV_PHPSESSID) {
  availableSessions.push(process.env.PIXIV_PHPSESSID);
}
if (process.env.PIXIV_BACKUP_SESSIONS) {
  const backupSessions = process.env.PIXIV_BACKUP_SESSIONS.split(',').map(s => s.trim());
  availableSessions.push(...backupSessions);
}

const uniqueSessions = [...new Set(availableSessions)];
let currentSessionIndex = 0;
let sessionFailureCount = 0;

// Session management
let contentSession = {
  cookies: uniqueSessions.length > 0 ? `PHPSESSID=${uniqueSessions[0]}` : '',
  authenticated: uniqueSessions.length > 0,
  currentSession: uniqueSessions[0] || null,
  availableSessions: uniqueSessions,
  rotationEnabled: uniqueSessions.length > 1
};

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function createContentClient() {
  return axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.pixiv.net/',
      'Cookie': contentSession.cookies,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 30000
  });
}

function rotateSession() {
  if (contentSession.availableSessions.length <= 1) return false;
  
  currentSessionIndex = (currentSessionIndex + 1) % contentSession.availableSessions.length;
  const newSession = contentSession.availableSessions[currentSessionIndex];
  
  contentSession.currentSession = newSession;
  contentSession.cookies = `PHPSESSID=${newSession}`;
  sessionFailureCount = 0;
  
  console.log(`Rotated to session ${currentSessionIndex + 1}/${contentSession.availableSessions.length}`);
  return true;
}

function checkSessionRotation() {
  sessionFailureCount++;
  if (sessionFailureCount >= 3 && contentSession.rotationEnabled) {
    return rotateSession();
  }
  return false;
}

// Extract user ID from URL
function extractUserId(url) {
  const match = url.match(/users\/(\d+)/);
  return match ? match[1] : null;
}

// Extract artwork ID from URL
function extractArtworkId(url) {
  const match = url.match(/artworks\/(\d+)/);
  return match ? match[1] : null;
}

// Get user artworks
async function getUserArtworks(userId, limit = 25) {
  const client = createContentClient();
  await delay(1000);
  
  const apiUrl = `https://www.pixiv.net/ajax/user/${userId}/profile/all`;
  
  try {
    const response = await client.get(apiUrl);
    
    if (response.status === 429 && checkSessionRotation()) {
      await delay(3000);
      const newClient = createContentClient();
      const retryResponse = await newClient.get(apiUrl);
      return processUserArtworksResponse(retryResponse.data, userId, limit);
    }
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    sessionFailureCount = 0;
    return processUserArtworksResponse(response.data, userId, limit);
  } catch (error) {
    if (error.response?.status === 429) {
      checkSessionRotation();
      throw new Error('Rate limited - please try again later');
    }
    throw error;
  }
}

function processUserArtworksResponse(data, userId, limit) {
  if (data.error) {
    throw new Error(data.message || 'API error');
  }

  const artworkIds = [];
  if (data.body?.illusts) {
    artworkIds.push(...Object.keys(data.body.illusts));
  }
  
  artworkIds.sort((a, b) => parseInt(b) - parseInt(a));
  
  if (artworkIds.length === 0) {
    throw new Error('No artworks found for this user');
  }

  const safeLimit = Math.min(limit || 25, 50);
  const limitedIds = artworkIds.slice(0, safeLimit);
  
  return limitedIds.map(id => ({
    id: id,
    url: `https://www.pixiv.net/artworks/${id}`,
    title: `Artwork ${id}`
  }));
}

// Get artwork images
async function getArtworkImages(artworkId, retryCount = 0) {
  const client = createContentClient();
  await delay(1000 + (retryCount * 500));
  
  try {
    const apiUrl = `https://www.pixiv.net/ajax/illust/${artworkId}`;
    const response = await client.get(apiUrl);
    
    if (response.status === 429) {
      if (retryCount === 0 && checkSessionRotation()) {
        await delay(2000);
        return getArtworkImages(artworkId, retryCount + 1);
      }
      
      if (retryCount < 2) {
        const waitTime = Math.min((retryCount + 1) * 3000, 10000);
        await delay(waitTime);
        return getArtworkImages(artworkId, retryCount + 1);
      }
      
      return [];
    }
    
    if (response.status !== 200) {
      checkSessionRotation();
      return [];
    }

    const data = response.data;
    if (data.error) return [];

    sessionFailureCount = 0;
    const images = [];
    
    if (data.body?.urls?.original) {
      images.push(data.body.urls.original);
    } else if (data.body?.pageCount > 1) {
      await delay(500);
      const pagesUrl = `https://www.pixiv.net/ajax/illust/${artworkId}/pages`;
      const pagesResponse = await client.get(pagesUrl);
      
      if (pagesResponse.status === 200 && !pagesResponse.data.error) {
        pagesResponse.data.body.forEach(page => {
          if (page.urls?.original) {
            images.push(page.urls.original);
          }
        });
      }
    }
    
    return images;
  } catch (error) {
    if (error.response?.status === 429) {
      if (retryCount === 0 && checkSessionRotation()) {
        await delay(2000);
        return getArtworkImages(artworkId, retryCount + 1);
      }
    } else {
      checkSessionRotation();
    }
    return [];
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lambda backend running',
    pixiv_authenticated: contentSession.authenticated,
    session_system: {
      total_sessions: contentSession.availableSessions.length,
      current_session_index: currentSessionIndex + 1,
      rotation_enabled: contentSession.rotationEnabled,
      failure_count: sessionFailureCount
    },
    environment: 'AWS Lambda'
  });
});

app.post('/api/download/start', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Pixiv URL is required'
      });
    }

    if (!contentSession.authenticated) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No Pixiv sessions configured'
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
      artworks = await getUserArtworks(pixivUserId);
    } else if (artworkId) {
      artworks = [{
        id: artworkId,
        url: `https://www.pixiv.net/artworks/${artworkId}`,
        title: `Artwork ${artworkId}`
      }];
    }

    const artworkDetails = [];
    for (let i = 0; i < Math.min(artworks.length, 25); i++) {
      const artwork = artworks[i];
      try {
        const images = await getArtworkImages(artwork.id);
        if (images.length > 0) {
          artworkDetails.push({
            id: artwork.id,
            title: artwork.title,
            images: images,
            imageCount: images.length
          });
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
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: error.message
    });
  }
});

app.get('/api/download/image', async (req, res) => {
  try {
    const { url, filename } = req.query;
    
    if (!url || !contentSession.authenticated) {
      return res.status(400).json({ error: 'Missing URL or not authenticated' });
    }

    const client = createContentClient();
    const response = await client.get(url, {
      responseType: 'arraybuffer',
      headers: { 'Referer': 'https://www.pixiv.net/' }
    });
    
    const imageName = filename || `pixiv_image_${Date.now()}.jpg`;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${imageName}"`);
    res.send(Buffer.from(response.data));
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to download image',
      message: error.message
    });
  }
});

app.post('/api/session/rotate', (req, res) => {
  if (!contentSession.rotationEnabled) {
    return res.status(400).json({
      error: 'Session rotation not available',
      message: 'No backup sessions configured'
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

// Export Lambda handler
module.exports.handler = serverless(app);