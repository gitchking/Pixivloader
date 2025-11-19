# Free Backend Hosting Options (No Credit Card Required)

## 🎯 Best Options for Python Flask Backend

### 1. ⭐ **PythonAnywhere** (RECOMMENDED)
**Best for: Beginners, No credit card needed**

#### Pros:
- ✅ **No credit card required**
- ✅ Always-on (no cold starts)
- ✅ Easy Python setup
- ✅ Built-in MySQL/PostgreSQL
- ✅ Simple file upload
- ✅ Good documentation
- ✅ 512MB storage
- ✅ Custom domain support

#### Cons:
- ⚠️ Limited to 100k hits/day
- ⚠️ Slower performance than paid options
- ⚠️ Manual deployment (no git auto-deploy)

#### Setup:
```bash
1. Sign up at pythonanywhere.com
2. Upload your python-backend folder
3. Create virtual environment
4. Install requirements
5. Configure WSGI file
6. Set environment variables
```

**URL Format**: `https://yourusername.pythonanywhere.com`

---

### 2. 🚀 **Railway** (Great Alternative)
**Best for: Modern deployment, Git integration**

#### Pros:
- ✅ **No credit card for trial**
- ✅ $5 free credit/month
- ✅ Git auto-deploy
- ✅ No cold starts
- ✅ Easy environment variables
- ✅ Good performance
- ✅ PostgreSQL included

#### Cons:
- ⚠️ Requires GitHub account
- ⚠️ $5 credit runs out (~500 hours)
- ⚠️ Need credit card after trial

#### Setup:
```bash
1. Sign up at railway.app
2. Connect GitHub
3. Deploy from repo
4. Add environment variables
5. Done!
```

**URL Format**: `https://your-app.up.railway.app`

---

### 3. 🐍 **Glitch** (Quick & Easy)
**Best for: Quick prototypes, Learning**

#### Pros:
- ✅ **No credit card required**
- ✅ Live code editor
- ✅ Instant deployment
- ✅ Git integration
- ✅ Community support
- ✅ Easy to use

#### Cons:
- ⚠️ Sleeps after 5 min inactivity
- ⚠️ Limited resources (512MB RAM)
- ⚠️ Public code by default
- ⚠️ Not ideal for production

#### Setup:
```bash
1. Sign up at glitch.com
2. Import from GitHub
3. Add .env variables
4. Auto-deploys on save
```

**URL Format**: `https://your-app.glitch.me`

---

### 4. ☁️ **Koyeb** (Modern Platform)
**Best for: Production-ready, No cold starts**

#### Pros:
- ✅ **No credit card required**
- ✅ No cold starts
- ✅ Git auto-deploy
- ✅ Good performance
- ✅ Free SSL
- ✅ 2 services free

#### Cons:
- ⚠️ Limited to 2 services
- ⚠️ 512MB RAM limit
- ⚠️ Newer platform (less docs)

#### Setup:
```bash
1. Sign up at koyeb.com
2. Connect GitHub
3. Select python-backend folder
4. Add environment variables
5. Deploy
```

**URL Format**: `https://your-app.koyeb.app`

---

### 5. 🌐 **Fly.io** (Developer Friendly)
**Best for: Docker users, Global deployment**

#### Pros:
- ✅ **No credit card for free tier**
- ✅ 3 shared VMs free
- ✅ Global deployment
- ✅ Good performance
- ✅ PostgreSQL included

#### Cons:
- ⚠️ Requires Docker knowledge
- ⚠️ CLI-based deployment
- ⚠️ More complex setup
- ⚠️ Limited free resources

#### Setup:
```bash
1. Install flyctl CLI
2. fly auth signup
3. fly launch
4. fly deploy
```

**URL Format**: `https://your-app.fly.dev`

---

### 6. 🔷 **Deta Space** (Serverless)
**Best for: Serverless, Simple apps**

#### Pros:
- ✅ **No credit card required**
- ✅ Completely free
- ✅ Easy deployment
- ✅ Built-in database
- ✅ No cold starts

#### Cons:
- ⚠️ Limited to Deta ecosystem
- ⚠️ Smaller community
- ⚠️ Less flexible

#### Setup:
```bash
1. Install Deta CLI
2. deta login
3. deta new
4. deta deploy
```

**URL Format**: `https://your-app.deta.app`

---

## 📊 Comparison Table

| Platform | Credit Card | Cold Starts | Auto-Deploy | RAM | Storage | Best For |
|----------|-------------|-------------|-------------|-----|---------|----------|
| **PythonAnywhere** | ❌ No | ❌ No | ❌ No | 512MB | 512MB | Beginners |
| **Railway** | ⚠️ Trial | ❌ No | ✅ Yes | 512MB | 1GB | Modern apps |
| **Glitch** | ❌ No | ✅ Yes | ✅ Yes | 512MB | 200MB | Prototypes |
| **Koyeb** | ❌ No | ❌ No | ✅ Yes | 512MB | 2GB | Production |
| **Fly.io** | ❌ No | ⚠️ Maybe | ✅ Yes | 256MB | 3GB | Docker users |
| **Deta** | ❌ No | ❌ No | ✅ Yes | 128MB | 10GB | Serverless |
| **Render** | ⚠️ Yes | ✅ Yes | ✅ Yes | 512MB | 1GB | Full-featured |

---

## 🏆 My Recommendations

### For Your Pixivloader Project:

#### 1st Choice: **PythonAnywhere**
- No credit card needed
- Always-on (important for downloads)
- Easy to set up
- Good for learning

#### 2nd Choice: **Railway**
- Better performance
- Git auto-deploy
- $5 free credit lasts ~2 weeks
- Easy to upgrade later

#### 3rd Choice: **Koyeb**
- No cold starts
- Modern platform
- Good performance
- Free forever

---

## 🚀 Quick Setup Guide for PythonAnywhere

### Step 1: Sign Up
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Click "Start running Python online in less than a minute!"
3. Create free account (no credit card)

### Step 2: Upload Code
1. Go to **Files** tab
2. Create folder: `pixivloader-backend`
3. Upload all files from `python-backend/` folder

### Step 3: Setup Virtual Environment
Open **Bash console**:
```bash
cd pixivloader-backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Configure Web App
1. Go to **Web** tab
2. Click "Add a new web app"
3. Choose "Manual configuration"
4. Select Python 3.10
5. Set source code: `/home/yourusername/pixivloader-backend`
6. Set virtualenv: `/home/yourusername/pixivloader-backend/venv`

### Step 5: Configure WSGI
Edit WSGI configuration file:
```python
import sys
import os

# Add your project directory
project_home = '/home/yourusername/pixivloader-backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, '.env'))

# Import Flask app
from app import app as application
```

### Step 6: Set Environment Variables
Create `.env` file in your project folder:
```env
FLASK_ENV=production
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
PIXIV_PHPSESSID=your_cookie
FRONTEND_URL=https://your-app.vercel.app
```

### Step 7: Reload & Test
1. Click "Reload" button in Web tab
2. Visit: `https://yourusername.pythonanywhere.com/api/health`
3. Should see: `{"status": "ok"}`

---

## 💡 Pro Tips

### For PythonAnywhere:
- Use scheduled tasks for maintenance
- Check error logs in Web tab
- Reload after code changes
- Free tier is enough for testing

### For Railway:
- $5 credit = ~500 hours
- Upgrade to $5/mo for unlimited
- Great for production
- Best developer experience

### For Glitch:
- Keep app awake with UptimeRobot
- Good for demos
- Not for production
- Easy to share

---

## 🎯 Final Recommendation

**For Pixivloader, I recommend:**

1. **Start with PythonAnywhere** (Free, no card, always-on)
2. **Test with Railway** (Better performance, $5 credit)
3. **Upgrade to Render** when ready (Best features, $7/mo)

PythonAnywhere is perfect for your use case because:
- Downloads need always-on backend (no cold starts)
- No credit card required
- Easy to set up
- Good enough performance for personal use
- Can upgrade later if needed

---

## 📞 Need Help?

Each platform has good documentation:
- PythonAnywhere: [help.pythonanywhere.com](https://help.pythonanywhere.com)
- Railway: [docs.railway.app](https://docs.railway.app)
- Koyeb: [koyeb.com/docs](https://www.koyeb.com/docs)

Choose based on your needs and comfort level!
