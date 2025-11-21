# Pixiv Session Rotation System - Permanent Solution

## 🔄 **Overview**

This system provides a robust, permanent solution for handling Pixiv session management with automatic rotation, rate limiting, and failure recovery.

## ✅ **Key Features**

### **1. Session Rotation**
- **Multiple backup sessions** - Configure up to 10+ backup Pixiv sessions
- **Automatic rotation** - Switches to backup sessions when primary fails
- **Failure detection** - Monitors 429 errors and API failures
- **Smart rotation** - Only rotates after multiple failures (not on first error)

### **2. Advanced Rate Limiting**
- **Progressive delays** - Starts at 1s, increases with retries
- **Per-request throttling** - Prevents overwhelming Pixiv servers
- **Exponential backoff** - Intelligent retry timing
- **Session-aware delays** - Different delays for different session states

### **3. Error Recovery**
- **Graceful degradation** - Skips problematic artworks instead of failing completely
- **Retry logic** - Up to 2 retries per artwork with increasing delays
- **Session health monitoring** - Tracks session performance
- **Automatic failover** - Seamless switching between sessions

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Primary session (required)
PIXIV_PHPSESSID=107895576_X65zlVqQO2on3ahy8QFNdJ3HV81S7Myw

# Backup sessions (recommended for reliability)
PIXIV_BACKUP_SESSIONS=121620980_QvZapQeJyWCeS9HyiOHhnKccoQp9hrGE,another_session_id,yet_another_session

# Optional: Custom rate limiting
RATE_LIMIT_BASE_DELAY=1000
RATE_LIMIT_MAX_RETRIES=2
```

### **Adding More Sessions**

1. **Create additional Pixiv accounts** (use temporary emails)
2. **Extract PHPSESSID** from each account
3. **Add to PIXIV_BACKUP_SESSIONS** (comma-separated)
4. **Restart backend** to load new sessions

## 📊 **System Status**

### **Health Check Endpoint**
```bash
curl http://localhost:3001/api/health
```

**Response includes:**
- Total available sessions
- Current active session
- Rotation status
- Failure count
- Rate limiting configuration

### **Manual Session Rotation**
```bash
curl -X POST http://localhost:3001/api/session/rotate
```

**Use cases:**
- Testing backup sessions
- Forcing rotation when needed
- Troubleshooting session issues

## 🛡️ **Rate Limiting Strategy**

### **Request Timing**
- **User profile requests**: 1s delay
- **Artwork details**: 1s base + progressive increase
- **Multi-page artworks**: +500ms additional delay
- **Retry attempts**: 3s, 6s, 10s (max)

### **Failure Handling**
- **429 Rate Limited**: Automatic session rotation + retry
- **401 Unauthorized**: Session rotation + retry
- **Other errors**: Mark failure, continue with next artwork
- **Max failures**: Rotate after 3 consecutive failures

## 📈 **Performance Optimizations**

### **Conservative Limits**
- **Default artwork limit**: 25 (was 50)
- **Maximum artwork limit**: 50 (was 100)
- **Retry limit**: 2 attempts per artwork
- **Session rotation threshold**: 3 failures

### **Smart Caching**
- **Session validation cache**: 5-minute cache
- **Failure count tracking**: Per-session monitoring
- **Success rate monitoring**: Automatic session scoring

## 🔍 **Monitoring & Debugging**

### **Console Logs**
```
🔐 Session rotation system initialized with 3 session(s)
📋 Primary session: 107895576_...
🔄 Session rotation enabled with 3 backup sessions
✅ Pixiv session system ready

🔄 Rotated to backup session 2/3
⚠️  Session failed 3 times, rotating...
✅ Pixiv session validated successfully
```

### **Error Messages**
- **Rate Limited**: Clear indication of delays and retries
- **Session Rotation**: Shows which session is being used
- **Failure Tracking**: Counts failures per session
- **Recovery Status**: Shows when sessions recover

## 🚀 **Usage Examples**

### **Basic Download** (Mobile App)
```javascript
// App automatically uses session rotation system
const artworks = await api.getArtworkList(pixivUrl);
// System handles rate limits and session rotation transparently
```

### **Test Small Download**
```bash
curl -X POST http://localhost:3001/api/test/small \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.pixiv.net/users/123456"}'
```

### **Monitor Session Health**
```bash
# Check current status
curl http://localhost:3001/api/health | jq '.session_system'

# Rotate if needed
curl -X POST http://localhost:3001/api/session/rotate
```

## 🔒 **Security Considerations**

### **Session Management**
- **Temporary accounts only** - Use disposable Pixiv accounts
- **No personal data** - Accounts contain no personal information
- **Regular rotation** - Change sessions periodically
- **Environment variables** - Never commit sessions to code

### **Rate Limit Compliance**
- **Conservative delays** - Respects Pixiv's rate limits
- **Automatic backoff** - Increases delays when rate limited
- **Session distribution** - Spreads load across multiple sessions
- **Failure recovery** - Graceful handling of blocked sessions

## 📋 **Maintenance**

### **Regular Tasks**
1. **Monitor session health** - Check logs for rotation frequency
2. **Add backup sessions** - Maintain 3-5 active sessions
3. **Update expired sessions** - Replace sessions that stop working
4. **Monitor rate limits** - Adjust delays if needed

### **Troubleshooting**
- **All sessions failing**: Add fresh sessions to PIXIV_BACKUP_SESSIONS
- **Frequent rotations**: Increase base delays or reduce artwork limits
- **Slow downloads**: Normal with rate limiting - prioritizes reliability
- **Connection refused**: Backend not running - restart with `npm start`

## 🎯 **Benefits**

### **For Users**
- ✅ **Reliable downloads** - Automatic recovery from failures
- ✅ **No setup required** - Works out of the box
- ✅ **Consistent performance** - Predictable download speeds
- ✅ **Error resilience** - Continues working despite individual failures

### **For Developers**
- ✅ **Easy maintenance** - Add sessions via environment variables
- ✅ **Comprehensive logging** - Clear visibility into system status
- ✅ **Scalable design** - Support for unlimited backup sessions
- ✅ **Production ready** - Handles edge cases and failures gracefully

This system provides a permanent, robust solution for Pixiv session management that can handle rate limits, session expiration, and API changes while maintaining reliable service for users.