# EC2 Management Commands - Quick Reference

## 🚀 **One-Command Deployment**

```bash
# Deploy everything automatically
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

## 🔧 **Daily Management**

### **Connect to Server**
```bash
# SSH into your server
ssh -i pixiv-backend-key.pem ubuntu@YOUR_PUBLIC_IP

# Or get IP automatically
PUBLIC_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text)
ssh -i pixiv-backend-key.pem ubuntu@$PUBLIC_IP
```

### **Backend Management**
```bash
# Check backend status
pm2 status

# View logs
pm2 logs pixiv-backend

# Restart backend
pm2 restart pixiv-backend

# Stop backend
pm2 stop pixiv-backend

# Start backend
pm2 start pixiv-backend
```

### **Update Pixiv Sessions**
```bash
# Edit environment file
nano .env

# Restart to apply changes
pm2 restart pixiv-backend
```

### **Monitor System**
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep :3001
```

## 🌐 **Test Endpoints**

```bash
# Test health endpoint
curl http://YOUR_PUBLIC_IP:3001/api/health

# Test through nginx
curl http://YOUR_PUBLIC_IP/api/health

# Test session rotation
curl -X POST http://YOUR_PUBLIC_IP:3001/api/session/rotate
```

## 💰 **Cost Management**

### **Stop Instance (Save Money)**
```bash
# Stop instance when not needed
aws ec2 stop-instances --instance-ids INSTANCE_ID

# Start when needed
aws ec2 start-instances --instance-ids INSTANCE_ID

# Get instance ID
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].InstanceId' \
    --output text
```

### **Monitor Costs**
```bash
# Check current costs
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost
```

## 🔄 **Updates & Maintenance**

### **Update Backend Code**
```bash
# On server
cd ~/pixiv-backend
git pull origin main  # if using git
npm install           # if dependencies changed
pm2 restart pixiv-backend
```

### **Update System**
```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm update

# Restart services
pm2 restart pixiv-backend
sudo systemctl restart nginx
```

## 🛡️ **Security**

### **Update SSH Key**
```bash
# Generate new key pair
aws ec2 create-key-pair \
    --key-name pixiv-backend-key-new \
    --query 'KeyMaterial' \
    --output text > pixiv-backend-key-new.pem
chmod 400 pixiv-backend-key-new.pem

# Update instance to use new key (requires instance restart)
```

### **Firewall Rules**
```bash
# List current security group rules
aws ec2 describe-security-groups \
    --group-names pixiv-backend-sg

# Add new rule (example: restrict SSH to your IP)
aws ec2 authorize-security-group-ingress \
    --group-name pixiv-backend-sg \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32
```

## 📊 **Monitoring & Logs**

### **Application Logs**
```bash
# PM2 logs
pm2 logs pixiv-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### **Performance Monitoring**
```bash
# CPU and memory usage
top
htop

# Disk I/O
iotop

# Network usage
iftop
```

## 🔄 **Backup & Recovery**

### **Create Backup**
```bash
# Create AMI backup
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].InstanceId' \
    --output text)

aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "pixiv-backend-backup-$(date +%Y%m%d)" \
    --description "Pixiv backend backup"
```

### **Backup Application Data**
```bash
# On server - backup configuration
tar -czf pixiv-backup-$(date +%Y%m%d).tar.gz \
    ~/pixiv-backend/.env \
    ~/pixiv-backend/package.json

# Download backup
scp -i pixiv-backend-key.pem ubuntu@$PUBLIC_IP:~/pixiv-backup-*.tar.gz ./
```

## 🗑️ **Cleanup**

### **Remove Everything**
```bash
# Terminate instance
aws ec2 terminate-instances --instance-ids INSTANCE_ID

# Delete security group (after instance is terminated)
aws ec2 delete-security-group --group-name pixiv-backend-sg

# Delete key pair
aws ec2 delete-key-pair --key-name pixiv-backend-key
rm pixiv-backend-key.pem
```

## 🆘 **Troubleshooting**

### **Backend Not Starting**
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs pixiv-backend

# Restart PM2
pm2 kill
pm2 start server.js --name pixiv-backend
```

### **Can't Connect to Server**
```bash
# Check instance status
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]'

# Check security group rules
aws ec2 describe-security-groups --group-names pixiv-backend-sg
```

### **High CPU/Memory Usage**
```bash
# Check processes
top
ps aux | grep node

# Restart backend
pm2 restart pixiv-backend

# Check for memory leaks
pm2 monit
```

## 📱 **Mobile App Integration**

### **Update Mobile App Configuration**
```bash
# Get current public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text)

echo "Update your mobile app .env.production:"
echo "VITE_API_BASE_URL=http://$PUBLIC_IP:3001"
```

### **Test Mobile App Connection**
```bash
# Test from mobile app's perspective
curl -X POST http://$PUBLIC_IP:3001/api/download/start \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.pixiv.net/users/123456"}'
```

This reference covers all the essential commands you'll need for managing your EC2-hosted Pixiv backend!