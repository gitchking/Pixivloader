# 📱 Mobile Offline Setup Guide

## 🎯 Options for Running Pixivloader Offline on Mobile

### **Option 1: PWA (Progressive Web App) - Recommended ⭐**

#### Setup:
1. **Generate Icons**: Open `generate-icons.html` in browser and download the generated icons
2. **Place Icons**: Put `icon-192.png` and `icon-512.png` in the `public/` folder
3. **Build PWA**: Run `npm run build`
4. **Serve Locally**: Use `npm run preview` or deploy to a local server

#### Install on Mobile:
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install App" prompt
3. The app will work offline for basic functionality

---

### **Option 2: Capacitor Native App 📱**

#### Build APK:
```bash
# Build the web app
npm run build

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy android

# Open in Android Studio
npx cap open android
```

#### For Offline Backend:
The APK will need a backend server. You have these options:

**A) Use Deployed Backend:**
- Your app will use `https://pixivloader.duckdns.org/api`
- Requires internet connection

**B) Local Mobile Server (Advanced):**
- Install Termux on Android
- Run Node.js server on mobile device
- Configure app to use `localhost:3001`

---

### **Option 3: Termux Mobile Server 🔧**

#### Install Termux:
1. Download Termux from F-Droid (not Play Store)
2. Install Node.js: `pkg install nodejs`
3. Install Git: `pkg install git`

#### Setup Backend:
```bash
# Clone your project
git clone <your-repo-url>
cd pixiv-portfolio-archive-main/mobile-backend

# Install dependencies
npm install

# Set environment variables
export PIXIV_PHPSESSID="your_session_id"
export PORT=3001

# Run server
node server.js
```

#### Configure App:
Update `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

---

### **Option 4: Hybrid Approach (Best of Both) 🚀**

#### Setup:
1. **Build PWA** for offline app shell
2. **Use Termux** for local backend when needed
3. **Fallback to deployed backend** when Termux isn't running

#### Configuration:
```typescript
// In src/config/environment.ts
function getApiUrl(): string {
  // Try local mobile server first
  if (navigator.userAgent.includes('Mobile')) {
    return 'http://localhost:3001';
  }
  
  // Fallback to deployed backend
  return 'https://pixivloader.duckdns.org/api';
}
```

---

## 🔧 Technical Requirements

### **For PWA:**
- ✅ Modern mobile browser (Chrome, Safari, Firefox)
- ✅ HTTPS (for service worker)
- ✅ ~50MB storage for offline cache

### **For Native App:**
- ✅ Android 7.0+ (API level 24+)
- ✅ ~100MB storage
- ✅ Internet for initial setup

### **For Termux Server:**
- ✅ Android device with Termux
- ✅ ~500MB storage for Node.js
- ✅ Pixiv session cookie (PHPSESSID)

---

## 🎯 Recommended Setup Steps

### **Quick Start (PWA):**
1. Generate icons using `generate-icons.html`
2. Build: `npm run build`
3. Deploy to GitHub Pages or Netlify
4. Install PWA on mobile
5. Use with deployed backend

### **Full Offline (Advanced):**
1. Set up Termux with Node.js
2. Clone project to Termux
3. Configure mobile backend
4. Build and install native app
5. Configure app to use localhost backend

---

## 🚨 Important Notes

- **Pixiv Authentication**: You'll need a valid PHPSESSID cookie
- **CORS Issues**: Local servers may need CORS configuration
- **Battery Usage**: Running servers on mobile drains battery
- **Storage**: Downloaded images consume device storage
- **Network**: Some features require internet connectivity

---

## 🔍 Troubleshooting

### **PWA Not Installing:**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker registration

### **Backend Connection Issues:**
- Check if server is running: `curl http://localhost:3001/api/health`
- Verify CORS settings in mobile-backend/server.js
- Ensure correct API URL in environment config

### **Termux Issues:**
- Use F-Droid version, not Play Store
- Grant storage permissions
- Keep Termux running in background

---

## 📱 Final Result

Once set up, you'll have:
- ✅ Offline-capable mobile app
- ✅ Local backend for downloads
- ✅ Persistent download state
- ✅ Native app experience
- ✅ Full Pixiv downloading functionality

Choose the option that best fits your technical comfort level and requirements!