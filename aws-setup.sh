#!/bin/bash

# Pixivloader AWS EC2 Setup Script
# This script automates the complete deployment process

set -e  # Exit on any error

echo "=================================="
echo "🚀 Pixivloader AWS Setup Starting"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Update system
print_status "Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System updated!"
echo ""

# Step 2: Install dependencies
print_status "Installing dependencies (Python, Node.js, Nginx, Git)..."
sudo apt install -y python3-pip python3-venv nginx git curl
print_success "Basic dependencies installed!"
echo ""

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js installed: $(node --version)"
echo ""

# Step 3: Clone repository
print_status "Cloning Pixivloader repository..."
cd /opt
if [ -d "Pixivloader" ]; then
    print_status "Repository already exists, pulling latest changes..."
    cd Pixivloader
    sudo git pull
else
    sudo git clone https://github.com/gitchking/Pixivloader.git
    cd Pixivloader
fi
sudo chown -R ubuntu:ubuntu /opt/Pixivloader
print_success "Repository ready!"
echo ""

# Step 4: Setup Python backend
print_status "Setting up Python backend..."
cd /opt/Pixivloader/python-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
print_success "Python dependencies installed!"
echo ""

# Step 5: Configure environment variables
print_status "Setting up environment variables..."
echo ""
echo "=================================="
echo "⚠️  IMPORTANT: Environment Variables"
echo "=================================="
echo "You need to create a .env file with your credentials."
echo ""
echo "Press Enter to open the editor, then paste your environment variables:"
echo ""
echo "Required variables:"
echo "  SUPABASE_URL=your_supabase_url"
echo "  SUPABASE_KEY=your_supabase_key"
echo "  PIXIV_REFRESH_TOKEN=your_refresh_token"
echo ""
read -p "Press Enter to continue..."

nano /opt/Pixivloader/python-backend/.env

if [ ! -f "/opt/Pixivloader/python-backend/.env" ]; then
    print_error ".env file not created! Please create it manually."
    exit 1
fi

print_success "Environment variables configured!"
echo ""

# Step 6: Build frontend
print_status "Building frontend (this may take 3-5 minutes)..."
cd /opt/Pixivloader

# Install frontend dependencies
npm install

# Build production bundle
npm run build

# Copy to Nginx directory
sudo mkdir -p /var/www/html
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
print_success "Frontend built and deployed!"
echo ""

# Step 7: Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    root /var/www/html;
    index index.html;
    
    # Frontend - serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    # Increase max body size for uploads
    client_max_body_size 50M;
}
EOF

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
print_success "Nginx configured and running!"
echo ""

# Step 8: Setup backend as systemd service
print_status "Setting up backend service..."
sudo tee /etc/systemd/system/pixivloader.service > /dev/null <<EOF
[Unit]
Description=Pixivloader Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/Pixivloader/python-backend
Environment="PATH=/opt/Pixivloader/python-backend/venv/bin:/usr/bin"
ExecStart=/opt/Pixivloader/python-backend/venv/bin/python app.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pixivloader
sudo systemctl start pixivloader
print_success "Backend service configured and running!"
echo ""

# Step 9: Setup firewall (optional but recommended)
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_success "Firewall configured!"
echo ""

# Step 10: Final checks
print_status "Running final checks..."
echo ""

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    print_success "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
fi

# Check backend status
if sudo systemctl is-active --quiet pixivloader; then
    print_success "✅ Backend service is running"
else
    print_error "❌ Backend service is not running"
fi

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

echo ""
echo "=================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "Your Pixivloader app is now live!"
echo ""
echo "Frontend URL: http://$PUBLIC_IP"
echo "Backend API:  http://$PUBLIC_IP/api/health"
echo ""
echo "Useful commands:"
echo "  - View backend logs:    sudo journalctl -u pixivloader -f"
echo "  - Restart backend:      sudo systemctl restart pixivloader"
echo "  - Restart Nginx:        sudo systemctl restart nginx"
echo "  - Check service status: sudo systemctl status pixivloader"
echo ""
echo "Next steps:"
echo "  1. Visit http://$PUBLIC_IP in your browser"
echo "  2. Test the API: http://$PUBLIC_IP/api/health"
echo "  3. (Optional) Setup custom domain and SSL"
echo ""
echo "Need help? Check AWS_DEPLOY_COMPLETE.md for troubleshooting!"
echo "=================================="
