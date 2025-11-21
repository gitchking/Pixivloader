#!/bin/bash

# EC2 Setup Script for Pixiv Backend
# Copy and paste this entire script into your EC2 terminal

echo "🚀 Starting Pixiv Backend setup on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Install other tools
echo "📦 Installing additional tools..."
sudo apt install git htop ufw -y

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/pixiv-backend
cd ~/pixiv-backend

# Create package.json
echo "📋 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "pixiv-backend-ec2",
  "version": "1.0.0",
  "description": "Pixiv backend for EC2 deployment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "axios": "^1.13.2",
    "archiver": "^6.0.2",
    "uuid": "^9.0.1",
    "dotenv": "^16.6.1"
  }
}
EOF

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment file template
echo "🔧 Creating environment file..."
cat > .env << 'EOF'
PORT=3001
NODE_ENV=production

# IMPORTANT: Replace these with your actual Pixiv sessions
PIXIV_PHPSESSID=107895576_X65zlVqQO2on3ahy8QFNdJ3HV81S7Myw
PIXIV_BACKUP_SESSIONS=121620980_QvZapQeJyWCeS9HyiOHhnKccoQp9hrGE

# Add more backup sessions separated by commas:
# PIXIV_BACKUP_SESSIONS=session1,session2,session3
EOF

# Create server.js with full backend code
echo "💻 Creating server.js..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Session rotation system
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
  
  console.log(`🔄 Rotated to session ${currentSessionIndex + 1}/${contentSession.availableSessions.length}`);
  return true;
}

function checkSessionRotation() {
  sessionFailureCount++;
  if (sessionFailureCount >= 3 && contentSession.rotationEnabled) {
    return rotateSession();
  }
  return false;
}

// Extract IDs from URLs
function extractUserId(url) {
  const match = url.match(/users\/(\d+)/);
  return match ? match[1] : null;
}

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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EC2 backend running',
    pixiv_authenticated: contentSession.authenticated,
    session_system: {
      total_sessions: contentSession.availableSessions.length,
      current_session_index: currentSessionIndex + 1,
      rotation_enabled: contentSession.rotationEnabled,
      failure_count: sessionFailureCount,
      current_session_preview: contentSession.currentSession ? contentSession.currentSession.substring(0, 10) + '...' : 'none'
    },
    environment: 'AWS EC2',
    server_time: new Date().toISOString(),
    uptime: process.uptime()
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
      message: `Found ${artworkDetails.length} artworks`,
      server: 'AWS EC2'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Server error',
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pixiv backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Sessions configured: ${contentSession.availableSessions.length}`);
  console.log(`🔄 Session rotation: ${contentSession.rotationEnabled ? 'enabled' : 'disabled'}`);
  console.log(`🌐 Server accessible at: http://YOUR_EC2_PUBLIC_IP:${PORT}`);
});
EOF

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 3001
sudo ufw allow ssh
sudo ufw --force enable

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit your Pixiv sessions: nano .env"
echo "2. Start the server: pm2 start server.js --name pixiv-backend"
echo "3. Save PM2 config: pm2 startup && pm2 save"
echo "4. Configure AWS Security Group to allow port 3001"
echo "5. Test: http://YOUR_EC2_PUBLIC_IP:3001/api/health"
echo ""
echo "🔧 Management commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs pixiv-backend"
echo "- Restart: pm2 restart pixiv-backend"
echo ""
echo "🎉 Your Pixiv backend is ready to deploy!"
EOF

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 3001
sudo ufw allow ssh
sudo ufw --force enable

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit your Pixiv sessions: nano .env"
echo "2. Start the server: pm2 start server.js --name pixiv-backend"
echo "3. Save PM2 config: pm2 startup && pm2 save"
echo "4. Configure AWS Security Group to allow port 3001"
echo "5. Test: http://YOUR_EC2_PUBLIC_IP:3001/api/health"
echo ""
echo "🔧 Management commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs pixiv-backend"
echo "- Restart: pm2 restart pixiv-backend"
echo ""
echo "🎉 Your Pixiv backend is ready to deploy!"