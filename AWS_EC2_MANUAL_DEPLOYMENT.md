# AWS EC2 Manual Deployment Guide - Pixiv Backend

## 🖥️ **Overview**

Deploy your Pixiv backend to AWS EC2 using only the web browser - no command line tools required! This guide uses the **t2.micro** instance which is **FREE for 12 months**.

## 💰 **Cost Breakdown**

### **Free Tier (12 months)**
- ✅ **t2.micro instance**: 750 hours/month (FREE)
- ✅ **30GB EBS storage**: (FREE)
- ✅ **15GB data transfer**: (FREE)

### **After Free Tier**
- **t2.micro**: ~$8.50/month
- **Storage**: ~$3/month for 30GB
- **Data transfer**: ~$0.09/GB

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create AWS Account**
1. Go to **https://aws.amazon.com/**
2. Click **"Create an AWS Account"**
3. Fill in your details (credit card required but won't be charged for free tier)
4. Verify your phone number and email
5. Choose **"Basic Support - Free"**

### **Step 2: Launch EC2 Instance**

#### **2.1 Access EC2 Console**
1. Sign in to **AWS Console**: https://console.aws.amazon.com/
2. Search for **"EC2"** in the top search bar
3. Click **"EC2"** to open the EC2 Dashboard
4. Make sure you're in **"US East (N. Virginia)"** region (top right)

#### **2.2 Launch Instance**
1. Click **"Launch Instance"** (orange button)
2. **Name**: Enter `pixiv-backend-server`

#### **2.3 Choose AMI (Operating System)**
1. Select **"Ubuntu Server 22.04 LTS"**
2. Make sure it says **"Free tier eligible"**
3. Keep **"64-bit (x86)"** selected

#### **2.4 Choose Instance Type**
1. Select **"t2.micro"** (should be pre-selected)
2. Verify it shows **"Free tier eligible"**

#### **2.5 Create Key Pair**
1. Click **"Create new key pair"**
2. **Name**: `pixiv-backend-key`
3. **Type**: RSA
4. **Format**: `.pem` (for SSH clients)
5. Click **"Create key pair"**
6. **IMPORTANT**: Save the downloaded `.pem` file safely!

#### **2.6 Network Settings**
1. Click **"Edit"** next to Network settings
2. **Allow SSH traffic from**: Anywhere (0.0.0.0/0)
3. **Allow HTTPS traffic from the internet**: ✅ Check
4. **Allow HTTP traffic from the internet**: ✅ Check

#### **2.7 Configure Storage**
1. Keep default **30 GB gp3** (Free tier eligible)
2. Leave other settings as default

#### **2.8 Launch Instance**
1. Review your settings
2. Click **"Launch Instance"**
3. Wait for instance to start (2-3 minutes)

### **Step 3: Connect to Your Server**

#### **3.1 Get Connection Info**
1. Go to **EC2 Dashboard** → **Instances**
2. Select your `pixiv-backend-server` instance
3. Click **"Connect"** button
4. Choose **"EC2 Instance Connect"** tab
5. Click **"Connect"** (opens browser terminal)

#### **3.2 Alternative: SSH Client**
If browser terminal doesn't work:
1. Note your instance's **Public IPv4 address**
2. Use SSH client like PuTTY (Windows) or Terminal (Mac/Linux)
3. Connect using: `ssh -i pixiv-backend-key.pem ubuntu@YOUR_PUBLIC_IP`

### **Step 4: Install Required Software**

Copy and paste these commands one by one in your terminal:

#### **4.1 Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

#### **4.2 Install Node.js**
```bash
# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### **4.3 Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

#### **4.4 Install Git**
```bash
sudo apt install git -y
```

### **Step 5: Deploy Your Backend**

#### **5.1 Create Project Directory**
```bash
mkdir ~/pixiv-backend
cd ~/pixiv-backend
```

#### **5.2 Create Package.json**
```bash
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
```

#### **5.3 Install Dependencies**
```bash
npm install
```

#### **5.4 Create Environment File**
```bash
cat > .env << 'EOF'
PORT=3001
NODE_ENV=production

# Replace with your actual Pixiv sessions
PIXIV_PHPSESSID=107895576_X65zlVqQO2on3ahy8QFNdJ3HV81S7Myw
PIXIV_BACKUP_SESSIONS=121620980_QvZapQeJyWCeS9HyiOHhnKccoQp9hrGE,another_session_here
EOF
```

**IMPORTANT**: Edit the `.env` file with your actual Pixiv sessions:
```bash
nano .env
# Use arrow keys to navigate, edit the session IDs
# Press Ctrl+X, then Y, then Enter to save
```

#### **5.5 Create Server File**
```bash
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

// Extract IDs from URLs
function extractUserId(url) {
  const match = url.match(/users\/(\d+)/);
  return match ? match[1] : null;
}

function extractArtworkId(url) {
  const match = url.match(/artworks\/(\d+)/);
  return match ? match[1] : null;
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
      failure_count: sessionFailureCount
    },
    environment: 'AWS EC2',
    server_time: new Date().toISOString()
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

    // Simple response for now - you can expand this
    res.json({
      success: true,
      message: 'Backend is working! Full implementation can be added.',
      url: url,
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pixiv backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Sessions configured: ${contentSession.availableSessions.length}`);
  console.log(`🔄 Session rotation: ${contentSession.rotationEnabled ? 'enabled' : 'disabled'}`);
});
EOF
```

### **Step 6: Configure Firewall**

#### **6.1 Open Port 3001**
```bash
sudo ufw allow 3001
sudo ufw allow ssh
sudo ufw --force enable
```

#### **6.2 Update AWS Security Group**
1. Go to **EC2 Console** → **Security Groups**
2. Find your instance's security group (usually `launch-wizard-X`)
3. Click on it, then **"Inbound rules"** tab
4. Click **"Edit inbound rules"**
5. Click **"Add rule"**:
   - **Type**: Custom TCP
   - **Port range**: 3001
   - **Source**: Anywhere-IPv4 (0.0.0.0/0)
6. Click **"Save rules"**

### **Step 7: Start Your Backend**

#### **7.1 Test Run**
```bash
cd ~/pixiv-backend
npm start
```

You should see:
```
🚀 Pixiv backend running on port 3001
📱 Health check: http://localhost:3001/api/health
```

Press `Ctrl+C` to stop.

#### **7.2 Start with PM2 (Production)**
```bash
pm2 start server.js --name "pixiv-backend"
pm2 startup
pm2 save
```

### **Step 8: Test Your Deployment**

#### **8.1 Get Your Server URL**
1. Go to **EC2 Console** → **Instances**
2. Select your instance
3. Copy the **Public IPv4 address** (e.g., `3.85.123.45`)

#### **8.2 Test Health Endpoint**
Open in browser: `http://YOUR_PUBLIC_IP:3001/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "EC2 backend running",
  "environment": "AWS EC2"
}
```

## 📱 **Update Mobile App**

### **Configure API URL**
Create `.env.production`:
```bash
VITE_API_BASE_URL=http://YOUR_PUBLIC_IP:3001
```

Replace `YOUR_PUBLIC_IP` with your actual EC2 public IP.

## 🔧 **Management Commands**

### **Server Management**
```bash
# Check status
pm2 status

# View logs
pm2 logs pixiv-backend

# Restart server
pm2 restart pixiv-backend

# Stop server
pm2 stop pixiv-backend

# Update code and restart
cd ~/pixiv-backend
nano server.js  # make changes
pm2 restart pixiv-backend
```

### **System Management**
```bash
# Check system resources
htop

# Check disk space
df -h

# Update system
sudo apt update && sudo apt upgrade -y
```

## 🔒 **Security Best Practices**

### **1. Update Pixiv Sessions**
```bash
cd ~/pixiv-backend
nano .env  # update sessions
pm2 restart pixiv-backend
```

### **2. Enable HTTPS (Optional)**
```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate (requires domain name)
sudo certbot certonly --standalone -d yourdomain.com
```

### **3. Set Up Monitoring**
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Set up log rotation
pm2 install pm2-logrotate
```

## 📊 **Monitoring**

### **AWS CloudWatch**
1. Go to **CloudWatch** in AWS Console
2. Set up billing alerts
3. Monitor EC2 metrics

### **Server Monitoring**
```bash
# Check server status
pm2 monit

# View system resources
htop

# Check logs
pm2 logs pixiv-backend --lines 100
```

## 🆘 **Troubleshooting**

### **Common Issues**

#### **"Connection refused"**
```bash
# Check if server is running
pm2 status

# Check firewall
sudo ufw status

# Restart server
pm2 restart pixiv-backend
```

#### **"Port already in use"**
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 PROCESS_ID
```

#### **"Out of memory"**
```bash
# Check memory usage
free -h

# Restart server
pm2 restart pixiv-backend
```

### **Update Sessions**
```bash
cd ~/pixiv-backend
nano .env
# Update PIXIV_PHPSESSID and PIXIV_BACKUP_SESSIONS
pm2 restart pixiv-backend
```

## 🎯 **Benefits of EC2 Deployment**

### **Advantages**
- ✅ **Full control** over server environment
- ✅ **Always-on** server (no cold starts)
- ✅ **SSH access** for debugging
- ✅ **Free for 12 months** (t2.micro)
- ✅ **Easy to scale** up when needed

### **For Your Users**
- ✅ **No local setup** required
- ✅ **Reliable access** to backend
- ✅ **Fast response times**
- ✅ **Global availability**

Your Pixiv backend is now running on AWS EC2 and accessible worldwide! 🎉