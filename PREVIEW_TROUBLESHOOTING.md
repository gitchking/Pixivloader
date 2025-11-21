# Preview Not Updating - Troubleshooting Guide

## 🔍 **Common Issues & Solutions**

### **1. Environment Variables Not Loading**
The new session key might not be loaded because:
- ✅ **Solution**: Restart development server completely
- ✅ **Command**: Stop all Node processes and restart

### **2. Browser Cache Issues**
- ✅ **Solution**: Hard refresh browser (Ctrl+Shift+R)
- ✅ **Alternative**: Open in incognito/private mode
- ✅ **Clear**: Browser cache and localStorage

### **3. Development Server Issues**
- ✅ **Check**: Multiple Node processes running
- ✅ **Solution**: Kill all Node processes and restart
- ✅ **Verify**: Only one instance of each server running

## 🚀 **Step-by-Step Restart Process**

### **Option 1: Manual Restart**
```bash
# 1. Stop all Node processes
taskkill /f /im node.exe

# 2. Wait 2 seconds
timeout /t 2

# 3. Start mobile backend
cd mobile-backend
npm start

# 4. In new terminal, start frontend
npm run dev
```

### **Option 2: Use Restart Script**
```bash
# Run the restart script
./restart-dev.bat
```

### **Option 3: Use Mobile Dev Script**
```bash
# Use the built-in mobile development script
npm run mobile:dev
```

## 🔧 **Verification Steps**

### **1. Check Backend Health**
Visit: `http://localhost:3001/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Mobile backend is running",
  "service_authenticated": true,
  "session_cookies": true,
  "content_session_id": "configured"
}
```

### **2. Check Frontend**
Visit: `http://localhost:5173`

Should show:
- ✅ Settings → "DOWNLOAD SERVICE" section
- ✅ "Content Service ✅ Ready for downloads [Active]"

### **3. Test Download**
1. Go to main page
2. Paste any Pixiv URL
3. Click download
4. Should work without authentication prompts

## 🐛 **Common Error Messages**

### **"Backend Not Ready"**
- **Cause**: Mobile backend not running or session not configured
- **Fix**: Restart mobile backend, check .env file

### **"Content service authentication required"**
- **Cause**: Session key not loaded or invalid
- **Fix**: Check environment variables, restart servers

### **"Failed to fetch artworks"**
- **Cause**: Network issues or invalid session
- **Fix**: Check internet connection, verify session key

## 📱 **Mobile Preview Issues**

### **If using mobile preview:**
1. **Clear browser cache** completely
2. **Restart development server**
3. **Check network tab** for API calls
4. **Verify session key** is being sent

### **If using Capacitor:**
1. **Rebuild app**: `npm run mobile:build`
2. **Clear app data** on device
3. **Reinstall APK** if needed

## 🔍 **Debug Information**

### **Check Console Logs:**
- Browser DevTools → Console
- Look for: "🔐 Using content service session for mobile app"
- Check for: Any red error messages

### **Check Network Tab:**
- DevTools → Network
- Look for: API calls to localhost:3001
- Verify: Session cookies are being sent

### **Check Environment:**
- Verify `.env` and `.env.local` have the new session key
- Check `mobile-backend/.env` has the new session key
- Ensure no old session keys are cached

## ✅ **Expected Behavior After Fix**

1. **Settings Page**: Shows "DOWNLOAD SERVICE" with "Content Service" active
2. **Download Page**: Works immediately without authentication
3. **Console**: Shows content service session messages
4. **Network**: API calls succeed with 200 status
5. **Downloads**: Start immediately when URL is pasted

If none of these solutions work, the issue might be:
- Port conflicts (check if 3001 and 5173 are available)
- Firewall blocking local connections
- Antivirus interfering with Node.js processes
- Windows permissions issues with file access