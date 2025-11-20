#!/bin/bash

# EC2 Performance Optimization Script for Pixivloader
echo "🚀 Optimizing EC2 instance for better download performance..."

# 1. Add swap memory (2GB)
echo "📝 Adding 2GB swap memory..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Optimize system settings
echo "⚙️ Optimizing system settings..."

# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize network settings
sudo tee -a /etc/sysctl.conf << EOF
# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr
EOF

# Apply sysctl settings
sudo sysctl -p

# 3. Install performance monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt update
sudo apt install -y htop iotop nethogs

# 4. Optimize Python backend
echo "🐍 Optimizing Python backend..."

# Install performance packages
cd /opt/Pixivloader/python-backend
source venv/bin/activate
pip install --upgrade pip
pip install aiohttp aiofiles  # For async operations if needed

# 5. Restart services
echo "🔄 Restarting services..."
sudo systemctl restart pixivloader
sudo systemctl restart nginx

# 6. Show system info
echo "📈 Current system status:"
echo "Memory:"
free -h
echo ""
echo "Swap:"
swapon --show
echo ""
echo "CPU:"
nproc
echo ""
echo "Disk:"
df -h /

echo "✅ Optimization complete!"
echo ""
echo "🎯 Performance improvements:"
echo "  • Added 2GB swap memory"
echo "  • Increased file descriptor limits"
echo "  • Optimized network settings"
echo "  • Enabled concurrent downloads (2-8 workers)"
echo "  • Larger download chunks (64KB)"
echo "  • Faster ZIP compression"
echo ""
echo "🚀 Your downloads should now be significantly faster!"