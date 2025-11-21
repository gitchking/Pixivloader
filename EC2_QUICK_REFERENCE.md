# EC2 Quick Reference - Pixiv Backend

## 🚀 **One-Command Setup**

Copy and paste this into your EC2 terminal:

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/ec2-setup-script.sh | bash
```

Or manually copy the entire `ec2-setup-script.sh` content and paste it.

## ⚡ **Essential Commands**

### **Server Management**
```bash
# Start server
pm2 start server.js --name pixiv-backend

# Check status
pm2 status

# View logs (live)
pm2 logs pixiv-backend

# Restart server
pm2 restart pixiv-backend

# Stop server
pm2 stop pixiv-backend

# Delete from PM2
pm2 delete pixiv-backend
```

### **Configuration**
```bash
# Edit Pixiv sessions
cd ~/pixiv-backend
nano .env

# Restart after config change
pm2 restart pixiv-backend

# View current config
cat .env
```

### **System Monitoring**
```bash
# System resources
htop

# Disk space
df -h

# Memory usage
free -h

# Network connections
netstat -tulpn | grep 3001
```

## 🔧 **Troubleshooting**

### **Server Won't Start**
```bash
# Check if port is in use
sudo lsof -i :3001

# Kill process on port 3001
sudo kill -9 $(sudo lsof -t -i:3001)

# Check server logs
pm2 logs pixiv-backend --lines 50
```

### **Can't Connect from Mobile App**
```bash
# Check if server is running
pm2 status

# Check firewall
sudo ufw status

# Test locally
curl http://localhost:3001/api/health

# Get public IP
curl http://checkip.amazonaws.com
```

### **Session Issues**
```bash
# Update sessions
nano .env
# Edit PIXIV_PHPSESSID and PIXIV_BACKUP_SESSIONS

# Restart server
pm2 restart pixiv-backend

# Test session rotation
curl -X POST http://localhost:3001/api/session/rotate
```

## 📊 **Health Checks**

### **Test Endpoints**
```bash
# Health check
curl http://YOUR_PUBLIC_IP:3001/api/health

# Session rotation
curl -X POST http://YOUR_PUBLIC_IP:3001/api/session/rotate

# Test download (replace with real Pixiv URL)
curl -X POST http://YOUR_PUBLIC_IP:3001/api/download/start \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.pixiv.net/users/123456"}'
```

### **Expected Responses**
```json
// Health check response
{
  "status": "ok",
  "message": "EC2 backend running",
  "pixiv_authenticated": true,
  "session_system": {
    "total_sessions": 2,
    "rotation_enabled": true
  },
  "environment": "AWS EC2"
}
```

## 🔒 **Security**

### **Update System**
```bash
sudo apt update && sudo apt upgrade -y
pm2 restart pixiv-backend
```

### **Firewall Status**
```bash
sudo ufw status verbose
```

### **Check Open Ports**
```bash
sudo netstat -tulpn
```

## 📱 **Mobile App Configuration**

### **Get Your Server URL**
```bash
# Get public IP
curl http://checkip.amazonaws.com

# Your API URL will be:
# http://YOUR_PUBLIC_IP:3001
```

### **Update Mobile App**
Create `.env.production`:
```bash
VITE_API_BASE_URL=http://YOUR_PUBLIC_IP:3001
```

## 💰 **Cost Monitoring**

### **Check Instance Type**
```bash
curl http://169.254.169.254/latest/meta-data/instance-type
# Should return: t2.micro (for free tier)
```

### **Monitor Usage**
- Go to **AWS Console** → **EC2** → **Instances**
- Check **Monitoring** tab for CPU/Network usage
- Set up **CloudWatch** alarms for high usage

## 🔄 **Backup & Updates**

### **Backup Configuration**
```bash
# Backup your .env file
cp ~/pixiv-backend/.env ~/pixiv-backend/.env.backup

# Backup entire project
tar -czf ~/pixiv-backend-backup.tar.gz ~/pixiv-backend/
```

### **Update Backend Code**
```bash
cd ~/pixiv-backend

# Backup current version
cp server.js server.js.backup

# Edit server.js with new code
nano server.js

# Restart server
pm2 restart pixiv-backend
```

## 🆘 **Emergency Procedures**

### **Server Crashed**
```bash
# Check what happened
pm2 logs pixiv-backend --lines 100

# Restart everything
pm2 restart all

# If still broken, reinstall
cd ~/pixiv-backend
npm install
pm2 restart pixiv-backend
```

### **Out of Disk Space**
```bash
# Check disk usage
df -h

# Clean PM2 logs
pm2 flush

# Clean system logs
sudo journalctl --vacuum-time=7d

# Clean package cache
sudo apt autoremove && sudo apt autoclean
```

### **High CPU Usage**
```bash
# Check processes
htop

# Restart server
pm2 restart pixiv-backend

# Check for memory leaks
pm2 monit
```

## 📞 **Support**

### **Get System Info**
```bash
echo "=== System Info ==="
uname -a
echo "=== Node Version ==="
node --version
echo "=== PM2 Status ==="
pm2 status
echo "=== Disk Space ==="
df -h
echo "=== Memory ==="
free -h
echo "=== Public IP ==="
curl -s http://checkip.amazonaws.com
```

### **Useful AWS Links**
- **EC2 Console**: https://console.aws.amazon.com/ec2/
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch/
- **Billing**: https://console.aws.amazon.com/billing/

Remember: Your EC2 instance public IP may change if you stop/start the instance. Use an Elastic IP for a permanent address!