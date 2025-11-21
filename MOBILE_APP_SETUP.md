# 📱 Self-Contained Mobile App Setup

This guide shows how to create a **completely self-contained mobile app** that doesn't require external hosting. Each user runs their own local backend on their device.

## 🎯 Architecture

```
Mobile App (Frontend)
    ↓
Local Node.js Backend (Port 3001)
    ↓
Pixiv (with user's session cookies)
```

## 📋 Prerequisites

1. **Node.js 16+** installed
2. **Android Studio** (for Android builds)
3. **Capacitor CLI**: `npm install -g @capacitor/cli`

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Install mobile backend dependencies
cd mobile-backend
npm install
cd ..
```

### 2. Add Capacitor Platforms

```bash
# Initialize Capacitor
npx cap init

# Add Android platform
npx cap add android

# Add iOS platform (optional)
npx cap add ios
```

### 3. Build the App

```bash
# Build frontend
npm run build

# Copy to Capacitor
npx cap copy

# Open in Android Studio
npx cap open android
```

## 🔧 How It Works

### **Local Backend Integration**

The app includes a **Node.js backend** that runs locally on the user's device:

1. **Port 3001**: Local backend serves API endpoints
2. **No External Dependencies**: Everything runs offline
3. **User's Cookies**: Users provide their own Pixiv session
4. **Local Storage**: Downloads saved to device storage

### **User Experience**

1. **Install APK**: Users install the self-contained app
2. **Set Cookies**: Users paste their Pixiv session cookies once
3. **Download**: App works completely offline
4. **No Hosting Costs**: Each user runs their own backend

## 📱 Mobile Backend Features

### **API Endpoints**
- `GET /api/health` - Check backend status
- `POST /api/auth/session` - Set Pixiv cookies
- `POST /api/download/start` - Start download
- `GET /api/download/progress/:taskId` - Get progress
- `GET /api/download/zip/:taskId` - Download ZIP

### **Supported Downloads**
- ✅ **User Profiles**: Full profile downloads
- ✅ **Single Artworks**: Individual artwork downloads
- ✅ **Progress Tracking**: Real-time progress updates
- ✅ **ZIP Creation**: Automatic ZIP file generation
- ✅ **Error Handling**: Robust error recovery

## 🔐 Authentication Setup

Users need to provide their Pixiv session cookies:

### **Method 1: Browser Developer Tools**
1. Login to Pixiv in browser
2. Open Developer Tools (F12)
3. Go to Application → Cookies → pixiv.net
4. Copy all cookie values
5. Paste into app settings

### **Method 2: Browser Extension**
Create a simple browser extension to extract cookies automatically.

## 📦 Distribution

### **Option 1: APK Distribution**
- Build APK file
- Distribute via GitHub releases
- Users install directly (enable "Unknown Sources")

### **Option 2: Google Play Store**
- Submit to Play Store (requires developer account)
- Users install normally
- Automatic updates

### **Option 3: F-Droid**
- Submit to F-Droid (open source store)
- Free distribution
- Privacy-focused users

## 🛠 Development Workflow

### **Local Development**
```bash
# Start frontend dev server
npm run dev

# Start mobile backend
cd mobile-backend
npm run dev

# Test in browser
open http://localhost:5173
```

### **Mobile Testing**
```bash
# Build and test on device
npm run build
npx cap copy
npx cap run android
```

### **Production Build**
```bash
# Build optimized version
npm run build
npx cap copy
npx cap open android
# Build APK in Android Studio
```

## 🔒 Security Considerations

### **User Privacy**
- ✅ **No External Servers**: Everything runs locally
- ✅ **User's Cookies**: Users control their own authentication
- ✅ **Local Storage**: Downloads stay on user's device
- ✅ **No Tracking**: No analytics or tracking

### **Cookie Security**
- Store cookies securely in app
- Encrypt sensitive data
- Clear cookies on app uninstall

## 📊 Performance

### **Optimizations**
- **Concurrent Downloads**: Multiple images simultaneously
- **Memory Management**: Efficient ZIP creation
- **Progress Tracking**: Real-time updates
- **Error Recovery**: Automatic retry logic

### **Resource Usage**
- **CPU**: Moderate during downloads
- **Memory**: ~50-100MB during operation
- **Storage**: Downloads + temporary files
- **Network**: Direct to Pixiv (no proxy)

## 🚀 Deployment Options

### **1. GitHub Releases**
```bash
# Build APK
./gradlew assembleRelease

# Upload to GitHub releases
# Users download and install
```

### **2. Self-Hosting**
```bash
# Host APK on your website
# Provide installation instructions
# Users download directly
```

### **3. App Stores**
- Google Play Store (paid developer account)
- F-Droid (free, open source)
- Amazon Appstore
- Samsung Galaxy Store

## 💡 Benefits

✅ **No Hosting Costs**: Each user runs their own backend
✅ **Complete Privacy**: No external servers involved
✅ **Offline Capable**: Works without internet (after setup)
✅ **User Control**: Users manage their own authentication
✅ **Scalable**: No server load limits
✅ **Fast**: Direct connection to Pixiv
✅ **Reliable**: No external dependencies

This approach gives you a **completely self-contained mobile app** that users can install and use without any external hosting requirements!