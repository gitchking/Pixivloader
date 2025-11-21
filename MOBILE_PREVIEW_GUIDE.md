# 📱 Mobile App Preview Guide

## 🚀 Quick Start - Preview Mobile UI

### Method 1: Browser DevTools (Easiest)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - Go to `http://localhost:5173`

3. **Enable Mobile View:**
   - **Chrome/Edge:** Press `F12` → Click device icon (or `Ctrl+Shift+M`)
   - **Firefox:** Press `F12` → Click responsive design icon (or `Ctrl+Shift+M`)
   - **Safari:** Enable Developer menu → Develop → Enter Responsive Design Mode

4. **Select Device:**
   - Choose "iPhone 14 Pro" or "Pixel 7"
   - Or set custom size: 375x812 (iPhone) or 393x851 (Android)

5. **Refresh page** - You'll see the mobile UI! 🎉

---

### Method 2: Test on Real Android Device

#### Option A: Same WiFi Network

1. **Find your computer's IP:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. **Start dev server:**
   ```bash
   npm run dev -- --host
   ```

3. **On your Android phone:**
   - Connect to same WiFi
   - Open browser
   - Go to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

#### Option B: USB Debugging (Advanced)

1. **Enable USB Debugging on Android:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

2. **Connect phone to computer via USB**

3. **Chrome DevTools:**
   - Open Chrome on computer
   - Go to `chrome://inspect`
   - Your phone should appear
   - Click "Inspect" on your browser tab

---

### Method 3: Expo/Capacitor (For Native App)

If you want to build a real native app later:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# Add Android platform
npm install @capacitor/android
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in Android Studio
npx cap open android
```

---

## 🎨 What You'll See

### Mobile Features:
- ✅ **Hamburger Menu** - Tap top-left to open side drawer
- ✅ **Bottom Navigation** - Home, History, Settings tabs
- ✅ **Dark Theme** - Purple accents matching reference
- ✅ **Touch-Optimized** - Large buttons, easy to tap
- ✅ **No Ads** - Clean mobile experience
- ✅ **Smooth Animations** - Native-like transitions

### Pages:
1. **Home** - Download manager with URL input
2. **History** - Card-based download history
3. **Settings** - Grouped settings with toggles

---

## 🔧 Responsive Breakpoints

The app automatically switches between desktop and mobile:

- **Mobile:** < 768px width
- **Desktop:** ≥ 768px width

Test by resizing your browser window!

---

## 📱 Recommended Test Devices

### In Browser DevTools:

**iOS:**
- iPhone 14 Pro (393 x 852)
- iPhone SE (375 x 667)
- iPad Mini (768 x 1024)

**Android:**
- Pixel 7 (412 x 915)
- Galaxy S23 (360 x 800)
- Galaxy Tab (800 x 1280)

---

## 🎯 Testing Checklist

- [ ] Hamburger menu opens/closes
- [ ] Bottom navigation switches pages
- [ ] Download form works
- [ ] Progress indicator shows
- [ ] History loads correctly
- [ ] Settings toggles work
- [ ] Logout button works
- [ ] Touch targets are easy to tap
- [ ] Scrolling is smooth
- [ ] No horizontal scroll

---

## 🐛 Troubleshooting

### Mobile UI not showing?
- Check browser width is < 768px
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache and reload

### Can't access from phone?
- Make sure phone and computer on same WiFi
- Check firewall isn't blocking port 5173
- Try `npm run dev -- --host 0.0.0.0`

### Styles look broken?
- Make sure Tailwind is working
- Check console for errors
- Verify all imports are correct

---

## 🚀 Next Steps

Once you're happy with the mobile preview:

1. **Deploy to web** - Works on any mobile browser
2. **Build PWA** - Installable web app
3. **Build native app** - Use Capacitor for iOS/Android
4. **Publish to stores** - Google Play / App Store

---

## 💡 Pro Tips

1. **Use Chrome DevTools Device Mode** - Best for development
2. **Test on real device** - Always test on actual phone before launch
3. **Check different screen sizes** - Not all phones are the same
4. **Test touch interactions** - Make sure everything is tappable
5. **Check performance** - Mobile devices are slower than desktop

---

**Your mobile app is ready to preview! 🎉**

Just run `npm run dev` and resize your browser to < 768px width!
