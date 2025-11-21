# Pixiv Session Setup for Mobile Users

## 🔐 **Default Session Configuration**

Since mobile users cannot easily access Pixiv session cookies, the app now uses a shared default session for all users.

### **Setup Instructions:**

#### **1. Get Your Pixiv Session ID:**

1. **Login to Pixiv** in your web browser
2. **Open Developer Tools** (F12)
3. **Go to Application tab** → Storage → Cookies → https://www.pixiv.net
4. **Find PHPSESSID** cookie and copy its value
5. **Copy the long string** (e.g., `12345678_abcdefghijklmnopqrstuvwxyz1234567890`)

#### **2. Configure Backend:**

**For Development (.env.local):**
```bash
# Add this line to .env.local
PIXIV_PHPSESSID=your_actual_session_id_here
```

**For Production (.env):**
```bash
# Add this line to .env
PIXIV_PHPSESSID=your_actual_session_id_here
```

#### **3. Mobile App Configuration:**

**For Embedded Backend (src/services/embedded-backend.ts):**
```typescript
// Replace the default session line with your actual session
const defaultSessionId = 'your_actual_session_id_here';
```

### **Benefits of Shared Session:**

✅ **No User Setup Required** - Mobile users can download immediately
✅ **Simplified UX** - No complex authentication flow
✅ **Consistent Access** - All users get the same Pixiv access level
✅ **Easy Maintenance** - Single session to manage

### **Security Considerations:**

⚠️ **Session Sharing**: All users share the same Pixiv account access
⚠️ **Rate Limits**: Pixiv may apply rate limits to the shared session
⚠️ **Session Expiry**: You'll need to update the session when it expires

### **Monitoring Session Health:**

The backend will automatically check session validity:
- ✅ **Valid Session**: Downloads work normally
- ❌ **Invalid Session**: Users get authentication error
- 🔄 **Session Expired**: Update PIXIV_PHPSESSID and restart

### **Mobile Settings Changes:**

The mobile app settings no longer include:
- ❌ Pixiv Authentication section (removed)
- ❌ Session cookie input (removed)
- ❌ Authentication modal (removed)

Users can now focus on:
- ✅ Download quality settings
- ✅ Download location selection
- ✅ Notification preferences
- ✅ App appearance settings

### **Troubleshooting:**

**If downloads fail with authentication error:**
1. Check if PIXIV_PHPSESSID is set correctly
2. Verify the session is still valid (login to Pixiv)
3. Get a fresh session ID and update configuration
4. Restart the backend server

**Session Expiry Signs:**
- Downloads fail with "Not authenticated" error
- Backend logs show 401 errors from Pixiv
- Health check shows `pixiv_authenticated: false`

### **Production Deployment:**

For production APK builds:
1. Set PIXIV_PHPSESSID in build environment
2. Ensure embedded backend uses the session
3. Test downloads before distributing APK
4. Monitor session health regularly

This setup ensures mobile users can download immediately without any technical setup requirements.