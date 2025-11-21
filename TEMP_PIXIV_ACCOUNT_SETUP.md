# Temporary Pixiv Account Setup Guide

## 🎯 **Mobile-Friendly Solution**

Since mobile users can't access developer tools to get session keys, we'll use a shared temporary Pixiv account for all app users.

## 📋 **Setup Steps:**

### **1. Create Temporary Email**
Use any temporary email service:
- **10minutemail.com**
- **tempmail.org** 
- **guerrillamail.com**
- **mailinator.com**

Example: `pixivloader2024@tempmail.org`

### **2. Create Pixiv Account**
1. Go to **https://accounts.pixiv.net/signup**
2. Fill in registration:
   - **Email**: Use temporary email
   - **Username**: `pixivloader2024` (or similar)
   - **Password**: Generate strong password
   - **Birth Date**: Use valid date (18+ years old)
3. **Verify email** from temporary inbox
4. **Complete profile** setup (minimal info needed)

### **3. Extract Session ID**
1. **Login to new account** in browser
2. **Open Developer Tools** (F12)
3. **Go to Application → Cookies → pixiv.net**
4. **Find PHPSESSID** cookie
5. **Copy the value** (long string like `107895576_FNUmaOI5U7gYh7dYv1ap6j8YDAmwrfEM`)

### **4. Update App Configuration**
Replace session ID in these files:
- `.env` 
- `.env.local`
- `src/services/embedded-backend.ts`

## ✅ **Benefits of This Approach:**

### **For Mobile Users:**
- ✅ **Zero Setup**: App works immediately after install
- ✅ **No Technical Knowledge**: No need to understand cookies/sessions
- ✅ **No Personal Account**: Don't need their own Pixiv account
- ✅ **Privacy**: No personal Pixiv data exposed

### **For App Distribution:**
- ✅ **Ready to Use**: APK works out of the box
- ✅ **User Friendly**: No configuration required
- ✅ **Consistent Experience**: All users get same functionality
- ✅ **No Support Issues**: No authentication problems

## 🔒 **Security Considerations:**

### **Temporary Account Safety:**
- ✅ **No Personal Data**: Account has no personal information
- ✅ **Disposable Email**: Email address is temporary
- ✅ **Minimal Profile**: Basic account with no content
- ✅ **Shared Usage**: Designed for app access only

### **Rate Limiting Management:**
- ⚠️ **Monitor Usage**: Watch for rate limit issues
- ⚠️ **Backup Sessions**: Create multiple accounts if needed
- ⚠️ **Session Rotation**: Implement fallback sessions

## 📱 **Mobile App Experience:**

### **Settings Page:**
```
Pixiv Access: ✅ Ready for downloads [Active]
```

### **Download Flow:**
```
1. User opens app
2. Pastes Pixiv URL
3. Downloads start immediately
4. No authentication required
```

## 🔄 **Session Management:**

### **When Session Expires:**
1. **Create new temporary account**
2. **Get new session ID**
3. **Update app configuration**
4. **Push app update** (or server-side update)

### **Backup Strategy:**
```javascript
// Multiple backup sessions
const BACKUP_SESSIONS = [
  'session1_from_account1',
  'session2_from_account2', 
  'session3_from_account3'
];

// Auto-rotate when one fails
if (currentSessionFails) {
  useNextBackupSession();
}
```

## 🎯 **Implementation Status:**

✅ **Session Configured**: `121620980_QvZapQeJyWCeS9HyiOHhnKccoQp9hrGE` (Active Temporary Account)
✅ **Mobile Settings**: Shows "Ready for downloads"
✅ **No User Setup**: Authentication section removed
✅ **Embedded Backend**: Uses shared session automatically
✅ **Mobile Backend**: Uses shared session for all requests

## 📈 **Future Improvements:**

### **Server-Side Session Management:**
```javascript
// Host sessions on your server
const getActiveSession = async () => {
  const response = await fetch('https://your-server.com/api/pixiv-session');
  return response.json().sessionId;
};
```

### **Session Health Monitoring:**
```javascript
// Check session validity
const validateSession = async (sessionId) => {
  try {
    const response = await fetch('https://www.pixiv.net/ajax/user/self', {
      headers: { Cookie: `PHPSESSID=${sessionId}` }
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

This approach makes the app truly mobile-friendly by eliminating any technical setup requirements for users!