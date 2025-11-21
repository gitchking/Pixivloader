#!/bin/bash

# AWS EC2 Automated Deployment Script for Pixiv Backend
set -e

echo "🚀 Starting AWS EC2 deployment for Pixiv Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
KEY_NAME="pixiv-backend-key"
SECURITY_GROUP="pixiv-backend-sg"
INSTANCE_NAME="pixiv-backend"
INSTANCE_TYPE="t2.micro"
REGION="us-east-1"

# Ubuntu 22.04 LTS AMI (update if needed)
AMI_ID="ami-0c02fb55956c7d316"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Key Name: $KEY_NAME"
echo "  Security Group: $SECURITY_GROUP"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  Region: $REGION"
echo ""

# Check if AWS CLI is configured
echo -e "${BLUE}🔐 Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials verified${NC}"

# Check if key pair already exists
echo -e "${BLUE}🔑 Checking SSH key pair...${NC}"
aws ec2 describe-key-pairs --key-names $KEY_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Key pair '$KEY_NAME' already exists${NC}"
    if [ ! -f "${KEY_NAME}.pem" ]; then
        echo -e "${RED}❌ Key file '${KEY_NAME}.pem' not found locally${NC}"
        echo "Please either:"
        echo "1. Delete the key pair: aws ec2 delete-key-pair --key-name $KEY_NAME"
        echo "2. Or provide the existing key file"
        exit 1
    fi
else
    echo -e "${BLUE}🔑 Creating SSH key pair...${NC}"
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --query 'KeyMaterial' \
        --output text > ${KEY_NAME}.pem
    chmod 400 ${KEY_NAME}.pem
    echo -e "${GREEN}✅ SSH key pair created: ${KEY_NAME}.pem${NC}"
fi

# Check if security group exists
echo -e "${BLUE}🛡️  Checking security group...${NC}"
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
    --group-names $SECURITY_GROUP \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || echo "None")

if [ "$SECURITY_GROUP_ID" = "None" ]; then
    echo -e "${BLUE}🛡️  Creating security group...${NC}"
    SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP \
        --description "Security group for Pixiv backend" \
        --query 'GroupId' \
        --output text)
    
    echo -e "${BLUE}🔓 Adding security group rules...${NC}"
    # SSH access
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0
    
    # HTTP access
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0
    
    # Backend API access
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 3001 \
        --cidr 0.0.0.0/0
    
    # HTTPS access
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0
    
    echo -e "${GREEN}✅ Security group created: $SECURITY_GROUP_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Security group '$SECURITY_GROUP' already exists: $SECURITY_GROUP_ID${NC}"
fi

# Check if instance already exists
echo -e "${BLUE}🖥️  Checking for existing instances...${NC}"
EXISTING_INSTANCE=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=$INSTANCE_NAME" "Name=instance-state-name,Values=running,pending,stopping,stopped" \
    --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
    --output text)

if [ ! -z "$EXISTING_INSTANCE" ]; then
    echo -e "${YELLOW}⚠️  Found existing instance:${NC}"
    echo "$EXISTING_INSTANCE"
    read -p "Do you want to terminate it and create a new one? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        INSTANCE_ID=$(echo "$EXISTING_INSTANCE" | awk '{print $1}')
        echo -e "${BLUE}🗑️  Terminating existing instance...${NC}"
        aws ec2 terminate-instances --instance-ids $INSTANCE_ID
        echo "Waiting for instance to terminate..."
        aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID
        echo -e "${GREEN}✅ Instance terminated${NC}"
    else
        echo -e "${YELLOW}⚠️  Using existing instance${NC}"
        INSTANCE_ID=$(echo "$EXISTING_INSTANCE" | awk '{print $1}')
        PUBLIC_IP=$(echo "$EXISTING_INSTANCE" | awk '{print $3}')
        if [ "$PUBLIC_IP" = "None" ]; then
            echo "Getting public IP..."
            PUBLIC_IP=$(aws ec2 describe-instances \
                --instance-ids $INSTANCE_ID \
                --query 'Reservations[*].Instances[*].PublicIpAddress' \
                --output text)
        fi
    fi
fi

# Launch new instance if needed
if [ -z "$INSTANCE_ID" ] || [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Launching EC2 instance...${NC}"
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id $AMI_ID \
        --count 1 \
        --instance-type $INSTANCE_TYPE \
        --key-name $KEY_NAME \
        --security-group-ids $SECURITY_GROUP_ID \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    echo -e "${BLUE}⏳ Waiting for instance to be running...${NC}"
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    
    echo -e "${BLUE}📡 Getting public IP address...${NC}"
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query 'Reservations[*].Instances[*].PublicIpAddress' \
        --output text)
    
    echo -e "${GREEN}✅ Instance launched successfully!${NC}"
    echo "  Instance ID: $INSTANCE_ID"
    echo "  Public IP: $PUBLIC_IP"
    
    echo -e "${BLUE}⏳ Waiting for SSH to be ready...${NC}"
    sleep 30
    
    # Wait for SSH to be ready
    for i in {1..30}; do
        ssh -i ${KEY_NAME}.pem -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'SSH Ready'" 2>/dev/null && break
        echo "Waiting for SSH... ($i/30)"
        sleep 10
    done
fi

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
mkdir -p deployment
cp mobile-backend/server.js deployment/
cp mobile-backend/package.json deployment/
cp mobile-backend/.env deployment/ 2>/dev/null || echo "No .env file found, will create on server"

# Create server setup script
cat > deployment/setup.sh << 'EOF'
#!/bin/bash
set -e

echo "🔧 Setting up Pixiv backend server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx

# Create app directory
mkdir -p ~/pixiv-backend
cd ~/pixiv-backend

echo "✅ Server setup complete!"
EOF

chmod +x deployment/setup.sh

# Upload files to server
echo -e "${BLUE}📤 Uploading files to server...${NC}"
scp -i ${KEY_NAME}.pem -o StrictHostKeyChecking=no -r deployment/* ubuntu@$PUBLIC_IP:~/

# Run setup on server
echo -e "${BLUE}🔧 Setting up server environment...${NC}"
ssh -i ${KEY_NAME}.pem -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP << 'EOF'
# Run setup script
chmod +x setup.sh
./setup.sh

# Setup application
cd ~/pixiv-backend
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << ENVEOF
PORT=3001
NODE_ENV=production
PIXIV_PHPSESSID=your_session_here
PIXIV_BACKUP_SESSIONS=backup1,backup2,backup3
ENVEOF
    echo "⚠️  Created default .env file - please update with your Pixiv sessions"
fi

# Start application with PM2
pm2 start server.js --name pixiv-backend
pm2 startup
pm2 save

# Configure nginx
sudo tee /etc/nginx/sites-available/pixiv-backend << NGINXEOF
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
NGINXEOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/pixiv-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "🎉 Deployment complete!"
EOF

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
sleep 10

# Test direct backend
echo "Testing direct backend access..."
curl -s http://$PUBLIC_IP:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Direct backend access working${NC}"
else
    echo -e "${YELLOW}⚠️  Direct backend access failed (may need time to start)${NC}"
fi

# Test nginx proxy
echo "Testing nginx proxy..."
curl -s http://$PUBLIC_IP/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx proxy working${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx proxy failed (may need time to start)${NC}"
fi

# Cleanup
rm -rf deployment

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Instance Information:${NC}"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP: $PUBLIC_IP"
echo "  SSH Key: ${KEY_NAME}.pem"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "  Direct Backend: http://$PUBLIC_IP:3001/api/health"
echo "  Through Nginx: http://$PUBLIC_IP/api/health"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "  SSH Access: ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP"
echo "  View Logs: ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP 'pm2 logs pixiv-backend'"
echo "  Restart App: ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP 'pm2 restart pixiv-backend'"
echo ""
echo -e "${BLUE}📱 Update Mobile App:${NC}"
echo "  Add to .env.production: VITE_API_BASE_URL=http://$PUBLIC_IP:3001"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Update Pixiv sessions in .env file on server"
echo "2. Update mobile app configuration"
echo "3. Test downloads with mobile app"
echo ""
echo -e "${GREEN}✅ Your Pixiv backend is now running on AWS EC2!${NC}"