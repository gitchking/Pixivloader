# 🚀 Complete AWS EC2 Deployment Guide

## What You'll Get
- Full stack app on 1 EC2 instance (t3.micro - FREE tier)
- Frontend: React + Nginx
- Backend: Python Flask
- SSL ready (optional)
- Auto-restart on crashes
- Professional production setup

---

## Part 1: Create EC2 Instance (5 minutes)

### Step 1: Launch Instance
1. Go to [AWS Console](https://console.aws.amazon.com/ec2/)
2. Click **"Launch Instance"** (big orange button)

### Step 2: Configure Instance
Fill in these settings:

**Name and tags:**
```
Name: pixivloader
```

**Application and OS Images (AMI):**
- Click **"Ubuntu"**
- Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Architecture: **64-bit (x86)**
- Should say "Free tier eligible" ✅

**Instance type:**
- Select: **t3.micro** (1 GB RAM, 2 vCPUs)
- Should say "Free tier eligible" ✅
- Note: t3.micro is newer and faster than t2.micro!

**Key pair (login):**
- Click **"Create new key pair"**
- Key pair name: `pixivloader-key`
- Key pair type: **RSA**
- Private key format: **.pem**
- Click **"Create key pair"** (downloads `pixivloader-key.pem`)
- **IMPORTANT:** Save this file! You can't download it again

**Network settings:**
Click **"Edit"** then configure:
- Auto-assign public IP: **Enable**
- Firewall (security groups): **Create security group**
- Security group name: `pixivloader-sg`
- Description: `Pixivloader security group`

Add these rules:
1. ✅ SSH (port 22) - Source: My IP (auto-filled)
2. Click **"Add security group rule"**
   - Type: **HTTP**
   - Port: **80**
   - Source: **Anywhere (0.0.0.0/0)**
3. Click **"Add security group rule"**
   - Type: **HTTPS**
   - Port: **443**
   - Source: **Anywhere (0.0.0.0/0)**
4. Click **"Add security group rule"**
   - Type: **Custom TCP**
   - Port: **5000**
   - Source: **My IP** (for testing backend directly)

**Configure storage:**
- Keep default: **8 GB gp2** (Free tier eligible)

### Step 3: Launch
1. Review everything
2. Click **"Launch instance"** (orange button)
3. Wait 2 minutes for instance to start
4. Click on your instance ID
5. **Copy the "Public IPv4 address"** (looks like: 3.145.67.89)

---

## Part 2: Connect to Server (2 minutes)

**Step 1: Open PowerShell**
- Press `Windows Key + X`
- Click "Windows PowerShell" or "Terminal"
- You'll see a blue window with text

**Step 2: Go to where your key file is saved**
The key file (`pixivloader-key.pem`) is probably in your Downloads folder.

Type this and press Enter:
```powershell
cd Downloads
```

**Step 3: Set permissions on the key file (IMPORTANT - do this once)**

**Method 1 (Easiest):** Copy and paste this single command:
```powershell
icacls.exe pixivloader-key.pem /reset
icacls.exe pixivloader-key.pem /grant:r "$env:USERNAME`:R"
icacls.exe pixivloader-key.pem /inheritance:r
```

**Method 2 (If Method 1 fails):** Run these commands one at a time:

First command:
```powershell
icacls pixivloader-key.pem /inheritance:r
```
Press Enter. You'll see "processed file: pixivloader-key.pem"

Second command (copy this EXACTLY as shown):
```powershell
icacls pixivloader-key.pem /grant:r "${env:USERNAME}:(R)"
```
Press Enter. You'll see "Successfully processed 1 files"

**Method 3 (Alternative - works on all Windows versions):**
```powershell
$path = ".\pixivloader-key.pem"
icacls.exe $path /reset
icacls.exe $path /GRANT:R "$($env:USERNAME):(R)"
icacls.exe $path /inheritance:r
```

**If all methods fail**, you can still connect! Just ignore the warning message when you run ssh.

**Step 4: Add SSH Port to Security Group (CRITICAL!)**

Before you can connect, you MUST allow SSH access:

1. Go back to **AWS Console** → **EC2** → **Instances**
2. Click on your `pixivloader` instance
3. Click the **"Security"** tab (bottom section)
4. Click on the security group name (looks like `sg-xxxxx`)
5. Click **"Edit inbound rules"**
6. Click **"Add rule"**
7. Configure:
   - **Type:** Select **SSH**
   - **Port:** 22 (auto-fills)
   - **Source:** Select **"My IP"** (auto-detects your IP)
   - Or use **"Anywhere-IPv4"** with `0.0.0.0/0`
8. Click **"Save rules"**

**Step 5: Get your EC2 IP address**
- Go back to AWS Console → EC2 → Instances
- Click on your instance
- Look for "Public IPv4 address" (example: 13.238.218.206)
- Copy this IP address

**Step 6: Connect to your server**
Type this command, but replace `YOUR_EC2_IP` with the actual IP you copied:
```powershell
ssh -i pixivloader-key.pem ubuntu@YOUR_EC2_IP
```

Example (if your IP is 13.238.218.206):
```powershell
ssh -i pixivloader-key.pem ubuntu@13.238.218.206
```

Press Enter.

**Step 7: Confirm connection**
You'll see a message like:
```
The authenticity of host '13.238.218.206' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Type `yes` and press Enter.

**Success!** You'll see:
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

You're now inside your server! 🎉

---

## Part 3: Automated Setup (10 minutes)

🎉 You're now inside your Ubuntu server! The prompt looks like: `ubuntu@ip-xxx:~$`

Now we'll run a magic script that does everything automatically.

### Step 1: Create the Setup Script

The script isn't on GitHub yet, so we'll create it manually (it's easy!):

**Type this command:**
```bash
nano aws-setup.sh
```

This opens a text editor in your terminal.

**Now copy the script content:**

1. On your Windows computer, open File Explorer
2. Go to your Pixivloader project folder
3. Find and open the file `aws-setup.sh`
4. Select ALL the content (Ctrl+A)
5. Copy it (Ctrl+C)

**Paste into the server:**

6. Go back to your PowerShell/SSH window (where nano is open)
7. Right-click in the terminal window (this pastes)
   - Or press `Shift + Insert`
8. You'll see all the script content appear in the editor

**Save the file:**

9. Press `Ctrl + X`
10. Press `Y` (to confirm save)
11. Press `Enter` (to confirm filename)

You'll see: "ubuntu@ip-xxx:~$" (back to command prompt)

**Make it executable:**
```bash
chmod +x aws-setup.sh
```

You'll see: No output means success! ✅

### Step 2: Run the Magic Setup Script

Type this and press Enter:
```bash
./aws-setup.sh
```

**What happens now:**
The script will start installing everything. You'll see messages like:
- "🚀 Pixivloader AWS Setup Starting"
- "[INFO] Updating system packages..."
- "[INFO] Installing dependencies..."
- "[SUCCESS] System updated!"

**Just wait and watch!** This takes 8-10 minutes.

The script automatically:
- ✅ Updates Ubuntu
- ✅ Installs Python, Node.js, Nginx
- ✅ Downloads your code from GitHub
- ✅ Installs all dependencies
- ✅ Builds your React frontend
- ✅ Sets up the backend service
- ✅ Configures Nginx web server

### Step 3: Add Your Secret Keys (IMPORTANT!)

After a few minutes, the script will PAUSE and show:
```
⚠️  IMPORTANT: Environment Variables
You need to create a .env file with your credentials.
Press Enter to open the editor...
```

**Get your keys ready!** You can find them in your `python-backend/.env` file.

**Now:**
1. Press `Enter` (the script will open a text editor)
2. Copy and paste these lines EXACTLY (these are your actual credentials):
```env
PORT=5000
FLASK_ENV=production

# Supabase Configuration
SUPABASE_URL=https://qkxauxnpwbshsjbbonrt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGF1eG5wd2JzaHNqYmJvbnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzU1NjIsImV4cCI6MjA3OTA1MTU2Mn0.-_D-BtttlVwQMuwaKERqQTj3PCZNu9_HOq-c091g_fs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGF1eG5wd2JzaHNqYmJvbnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzU1NjIsImV4cCI6MjA3OTA1MTU2Mn0.-_D-BtttlVwQMuwaKERqQTj3PCZNu9_HOq-c091g_fs

# CORS Configuration (use your EC2 IP)
FRONTEND_URL=http://YOUR_EC2_IP

# Pixiv Configuration
PIXIV_PHPSESSID=107895576_FNUmaOI5U7gYh7dYv1ap6j8YDAmwrfEM
```

**IMPORTANT:** Replace `YOUR_EC2_IP` with your actual EC2 IP address (e.g., `http://13.238.218.206`)

3. Save the file:
   - Press `Ctrl + X`
   - Press `Y`
   - Press `Enter`

4. The script will continue automatically!

### Step 4: Wait for Completion

The script will finish building everything. After 2-3 more minutes, you'll see:
```
🎉 DEPLOYMENT COMPLETE!

Your Pixivloader app is now live!

Frontend URL: http://3.145.67.89
Backend API:  http://3.145.67.89/api/health
```

**Copy that IP address!** That's your live website! 🚀

---

## Part 4: Test Your Website (2 minutes)

### Test 1: Open Your Website

1. Open your web browser (Chrome, Firefox, etc.)
2. Type in the address bar: `http://YOUR_EC2_IP`
   - Example: `http://3.145.67.89`
3. Press Enter

**You should see your Pixivloader app!** 🎉

If you see the login page or homepage, it's working!

### Test 2: Check the Backend API

In your browser, visit:
```
http://YOUR_EC2_IP/api/health
```

You should see:
```json
{"status": "healthy"}
```

This means your backend is running! ✅

### Test 3: Check Backend Logs (Optional)

Want to see what's happening behind the scenes?

In your terminal (still connected to the server), type:
```bash
sudo journalctl -u pixivloader -f
```

You'll see live logs from your backend. This is useful for debugging.

To stop watching logs:
- Press `Ctrl + C`

### What if something doesn't work?

**Frontend not loading?**
```bash
sudo systemctl status nginx
```
Look for "active (running)" in green.

**Backend not responding?**
```bash
sudo systemctl status pixivloader
```
Look for "active (running)" in green.

**See error messages?**
```bash
sudo journalctl -u pixivloader -n 50
```
This shows the last 50 log lines to help debug.

---

## Part 5: Optional - Add Custom Domain & SSL (15 minutes)

### If you have a domain (e.g., pixivloader.com):

1. **Point domain to EC2:**
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add an A record:
     - Host: `@` (or `www`)
     - Value: `YOUR_EC2_IP`
     - TTL: 300

2. **Install SSL certificate:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts, enter your email, agree to terms.

3. **Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

Done! Your site is now on HTTPS! 🔒

---

## Useful Commands

### Check if services are running:
```bash
sudo systemctl status nginx
sudo systemctl status pixivloader
```

### Restart services:
```bash
sudo systemctl restart nginx
sudo systemctl restart pixivloader
```

### View backend logs:
```bash
sudo journalctl -u pixivloader -f
```

### Update your code:
```bash
cd /opt/Pixivloader
sudo git pull
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl restart pixivloader
```

### Check disk space:
```bash
df -h
```

### Check memory usage:
```bash
free -h
```

---

## Troubleshooting

### Frontend not loading?
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Backend not working?
```bash
sudo systemctl status pixivloader
sudo journalctl -u pixivloader -n 50
```

### Port 5000 blocked?
Check security group in AWS Console has port 5000 open.

### Out of memory?
```bash
# Create swap file (emergency memory)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Can't connect via SSH?
- Check security group allows port 22 from your IP
- Your IP might have changed (update security group)
- Make sure instance is running in AWS Console

---

## Cost Estimate

**t3.micro (Free Tier):**
- First 12 months: **$0/month** ✅
- After 12 months: **~$7.50/month** (cheaper than t2!)

**Data Transfer:**
- First 100 GB/month: **Free**
- After: **$0.09/GB**

**Total for most users: $0-8/month** 🎉

**Why t3.micro is better:**
- 2 vCPUs instead of 1 (faster!)
- Better network performance
- Burstable performance credits
- Slightly cheaper than t2.micro

---

## Security Best Practices

1. **Keep system updated:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Setup firewall:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

3. **Disable root login:**
```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

4. **Regular backups:**
   - Use AWS snapshots (EC2 → Volumes → Create Snapshot)
   - Or backup database regularly

---

## Next Steps

✅ Your app is live!
✅ Backend auto-restarts on crashes
✅ Nginx serves frontend efficiently
✅ Ready for production traffic

**Want to scale?**
- Upgrade to t3.small (2GB RAM) for $15/month
- Add load balancer for high traffic
- Use RDS for managed database
- Add CloudFront CDN for faster global access

Need help? Check logs first, then debug! 🚀
