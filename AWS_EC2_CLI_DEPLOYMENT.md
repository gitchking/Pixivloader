# AWS EC2 CLI Deployment Guide - Pixiv Backend

## 🚀 **Overview**

Deploy your Pixiv backend to AWS EC2 using **100% CLI commands**. No manual clicking in AWS Console required!

## 💰 **EC2 Free Tier Benefits**

- ✅ **t2.micro instance**: Free for 12 months
- ✅ **750 hours/month**: Essentially 24/7 free hosting
- ✅ **30GB EBS storage**: Free
- ✅ **15GB data transfer**: Free outbound

## 📋 **Prerequisites**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

## 🔧 **One-Command Setup**

### **Step 1: Configure AWS CLI**
```bash
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

### **Step 2: Run Automated Deployment**
```bash
# Make script executable and run
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

## 📜 **What the Script Does**

The automated script performs these actions:

1. **Creates Security Group** with proper ports (22, 3001, 80, 443)
2. **Generates SSH Key Pair** for secure access
3. **Launches EC2 Instance** (t2.micro, Ubuntu 22.04)
4. **Installs Dependencies** (Node.js, npm, PM2)
5. **Deploys Backend Code** with session rotation
6. **Configures Auto-Start** on boot
7. **Sets up SSL** (optional)
8. **Provides Access URLs**

## 🔑 **Manual CLI Commands (If Needed)**

### **Create Security Group**
```bash
# Create security group
aws ec2 create-security-group \
    --group-name pixiv-backend-sg \
    --description "Security group for Pixiv backend"

# Add SSH access (port 22)
aws ec2 authorize-security-group-ingress \
    --group-name pixiv-backend-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Add HTTP access (port 80)
aws ec2 authorize-security-group-ingress \
    --group-name pixiv-backend-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Add backend access (port 3001)
aws ec2 authorize-security-group-ingress \
    --group-name pixiv-backend-sg \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0

# Add HTTPS access (port 443)
aws ec2 authorize-security-group-ingress \
    --group-name pixiv-backend-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

### **Create SSH Key Pair**
```bash
# Generate key pair
aws ec2 create-key-pair \
    --key-name pixiv-backend-key \
    --query 'KeyMaterial' \
    --output text > pixiv-backend-key.pem

# Set proper permissions
chmod 400 pixiv-backend-key.pem
```

### **Launch EC2 Instance**
```bash
# Launch instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t2.micro \
    --key-name pixiv-backend-key \
    --security-groups pixiv-backend-sg \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=pixiv-backend}]'
```

### **Get Instance Information**
```bash
# Get instance ID and public IP
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' \
    --output table
```

## 🔧 **Server Setup Commands**

### **Connect to Instance**
```bash
# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text)

# SSH into instance
ssh -i pixiv-backend-key.pem ubuntu@$PUBLIC_IP
```

### **Install Dependencies on Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx

# Verify installations
node --version
npm --version
pm2 --version
```

### **Deploy Backend Code**
```bash
# Clone or upload your backend code
git clone https://github.com/your-repo/pixiv-backend.git
# OR upload via SCP:
# scp -i pixiv-backend-key.pem -r ./mobile-backend ubuntu@$PUBLIC_IP:~/

cd mobile-backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=3001
NODE_ENV=production
PIXIV_PHPSESSID=your_session_here
PIXIV_BACKUP_SESSIONS=backup1,backup2,backup3
EOF

# Start with PM2
pm2 start server.js --name pixiv-backend
pm2 startup
pm2 save
```

## 🌐 **Configure Nginx (Optional)**

```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/pixiv-backend << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/pixiv-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 **SSL Setup (Optional)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **Management Commands**

### **Monitor Backend**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs pixiv-backend

# Restart backend
pm2 restart pixiv-backend

# Monitor resources
pm2 monit
```

### **Update Backend**
```bash
# Pull latest code
git pull origin main

# Restart application
pm2 restart pixiv-backend
```

### **System Monitoring**
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep :3001
```

## 🔄 **Backup & Recovery**

### **Create AMI Backup**
```bash
# Get instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=pixiv-backend" \
    --query 'Reservations[*].Instances[*].InstanceId' \
    --output text)

# Create AMI backup
aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "pixiv-backend-backup-$(date +%Y%m%d)" \
    --description "Pixiv backend backup"
```

### **Restore from Backup**
```bash
# List available AMIs
aws ec2 describe-images \
    --owners self \
    --filters "Name=name,Values=pixiv-backend-backup-*" \
    --query 'Images[*].[ImageId,Name,CreationDate]' \
    --output table

# Launch from backup AMI
aws ec2 run-instances \
    --image-id ami-xxxxxxxxx \
    --count 1 \
    --instance-type t2.micro \
    --key-name pixiv-backend-key \
    --security-groups pixiv-backend-sg
```

## 💰 **Cost Management**

### **Monitor Costs**
```bash
# Get current month costs
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost \
    --group-by Type=DIMENSION,Key=SERVICE

# Set up billing alerts
aws budgets create-budget \
    --account-id $(aws sts get-caller-identity --query Account --output text) \
    --budget file://budget.json
```

### **Stop/Start Instance**
```bash
# Stop instance (saves money)
aws ec2 stop-instances --instance-ids $INSTANCE_ID

# Start instance
aws ec2 start-instances --instance-ids $INSTANCE_ID

# Terminate instance (permanent deletion)
aws ec2 terminate-instances --instance-ids $INSTANCE_ID
```

## 🎯 **Final URLs**

After deployment, your backend will be available at:

- **Direct Backend**: `http://your-ec2-ip:3001/api/health`
- **Through Nginx**: `http://your-ec2-ip/api/health`
- **With SSL**: `https://your-domain.com/api/health`

## 📱 **Update Mobile App**

```bash
# Update mobile app configuration
echo "VITE_API_BASE_URL=http://your-ec2-ip:3001" > .env.production

# Or with custom domain
echo "VITE_API_BASE_URL=https://your-domain.com" > .env.production
```

This CLI-based approach is much faster and more reliable than manual console clicking!