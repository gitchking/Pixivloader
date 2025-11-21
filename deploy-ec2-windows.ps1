# AWS EC2 Deployment Script for Windows PowerShell
param(
    [string]$KeyName = "pixiv-backend-key",
    [string]$SecurityGroup = "pixiv-backend-sg", 
    [string]$InstanceName = "pixiv-backend",
    [string]$InstanceType = "t2.micro",
    [string]$Region = "us-east-1",
    [string]$AmiId = "ami-0c02fb55956c7d316"  # Ubuntu 22.04 LTS
)

Write-Host "🚀 Starting AWS EC2 deployment for Pixiv Backend..." -ForegroundColor Blue
Write-Host ""

# Configuration display
Write-Host "📋 Configuration:" -ForegroundColor Blue
Write-Host "  Key Name: $KeyName"
Write-Host "  Security Group: $SecurityGroup"
Write-Host "  Instance Type: $InstanceType"
Write-Host "  Region: $Region"
Write-Host ""

# Check AWS CLI and credentials
Write-Host "🔐 Checking AWS credentials..." -ForegroundColor Blue
try {
    $callerIdentity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
    if ($callerIdentity) {
        Write-Host "✅ AWS credentials verified" -ForegroundColor Green
        Write-Host "  Account: $($callerIdentity.Account)"
        Write-Host "  User: $($callerIdentity.Arn)"
    } else {
        throw "No credentials"
    }
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    Write-Host ""
    Write-Host "To configure AWS CLI:" -ForegroundColor Yellow
    Write-Host "1. Get your AWS Access Key and Secret Key from AWS Console"
    Write-Host "2. Run: aws configure"
    Write-Host "3. Enter your credentials when prompted"
    exit 1
}

# Check if key pair exists
Write-Host "🔑 Checking SSH key pair..." -ForegroundColor Blue
$keyExists = $false
try {
    aws ec2 describe-key-pairs --key-names $KeyName 2>$null | Out-Null
    $keyExists = $true
    Write-Host "⚠️  Key pair '$KeyName' already exists" -ForegroundColor Yellow
    
    if (-not (Test-Path "$KeyName.pem")) {
        Write-Host "❌ Key file '$KeyName.pem' not found locally" -ForegroundColor Red
        Write-Host "Please either:" -ForegroundColor Yellow
        Write-Host "1. Delete the key pair: aws ec2 delete-key-pair --key-name $KeyName"
        Write-Host "2. Or provide the existing key file"
        exit 1
    }
} catch {
    Write-Host "🔑 Creating SSH key pair..." -ForegroundColor Blue
    $keyMaterial = aws ec2 create-key-pair --key-name $KeyName --query 'KeyMaterial' --output text
    $keyMaterial | Out-File -FilePath "$KeyName.pem" -Encoding ASCII -NoNewline
    Write-Host "✅ SSH key pair created: $KeyName.pem" -ForegroundColor Green
}

# Check if security group exists
Write-Host "🛡️  Checking security group..." -ForegroundColor Blue
$sgId = $null
try {
    $sgId = aws ec2 describe-security-groups --group-names $SecurityGroup --query 'SecurityGroups[0].GroupId' --output text 2>$null
    if ($sgId -eq "None" -or -not $sgId) {
        throw "Security group not found"
    }
    Write-Host "⚠️  Security group '$SecurityGroup' already exists: $sgId" -ForegroundColor Yellow
} catch {
    Write-Host "🛡️  Creating security group..." -ForegroundColor Blue
    $sgId = aws ec2 create-security-group --group-name $SecurityGroup --description "Security group for Pixiv backend" --query 'GroupId' --output text
    
    Write-Host "🔓 Adding security group rules..." -ForegroundColor Blue
    # SSH access
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0
    # HTTP access  
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0
    # Backend API access
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3001 --cidr 0.0.0.0/0
    # HTTPS access
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0
    
    Write-Host "✅ Security group created: $sgId" -ForegroundColor Green
}

# Check for existing instances
Write-Host "🖥️  Checking for existing instances..." -ForegroundColor Blue
$existingInstance = aws ec2 describe-instances --filters "Name=tag:Name,Values=$InstanceName" "Name=instance-state-name,Values=running,pending,stopping,stopped" --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' --output text

$instanceId = $null
$publicIp = $null

if ($existingInstance -and $existingInstance.Trim() -ne "") {
    Write-Host "⚠️  Found existing instance:" -ForegroundColor Yellow
    Write-Host $existingInstance
    $response = Read-Host "Do you want to terminate it and create a new one? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $instanceId = ($existingInstance -split '\s+')[0]
        Write-Host "🗑️  Terminating existing instance..." -ForegroundColor Blue
        aws ec2 terminate-instances --instance-ids $instanceId
        Write-Host "Waiting for instance to terminate..."
        aws ec2 wait instance-terminated --instance-ids $instanceId
        Write-Host "✅ Instance terminated" -ForegroundColor Green
        $instanceId = $null
    } else {
        $instanceId = ($existingInstance -split '\s+')[0]
        $publicIp = ($existingInstance -split '\s+')[2]
        if ($publicIp -eq "None" -or -not $publicIp) {
            Write-Host "Getting public IP..."
            $publicIp = aws ec2 describe-instances --instance-ids $instanceId --query 'Reservations[*].Instances[*].PublicIpAddress' --output text
        }
    }
}

# Launch new instance if needed
if (-not $instanceId) {
    Write-Host "🚀 Launching EC2 instance..." -ForegroundColor Blue
    $instanceId = aws ec2 run-instances --image-id $AmiId --count 1 --instance-type $InstanceType --key-name $KeyName --security-group-ids $sgId --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]" --query 'Instances[0].InstanceId' --output text
    
    Write-Host "⏳ Waiting for instance to be running..." -ForegroundColor Blue
    aws ec2 wait instance-running --instance-ids $instanceId
    
    Write-Host "📡 Getting public IP address..." -ForegroundColor Blue
    $publicIp = aws ec2 describe-instances --instance-ids $instanceId --query 'Reservations[*].Instances[*].PublicIpAddress' --output text
    
    Write-Host "✅ Instance launched successfully!" -ForegroundColor Green
    Write-Host "  Instance ID: $instanceId"
    Write-Host "  Public IP: $publicIp"
    
    Write-Host "⏳ Waiting for SSH to be ready..." -ForegroundColor Blue
    Start-Sleep -Seconds 30
}

# Create deployment files
Write-Host "📦 Creating deployment package..." -ForegroundColor Blue
if (-not (Test-Path "deployment")) {
    New-Item -ItemType Directory -Path "deployment" | Out-Null
}

# Copy backend files if they exist
if (Test-Path "mobile-backend/server.js") {
    Copy-Item "mobile-backend/server.js" "deployment/"
}
if (Test-Path "mobile-backend/package.json") {
    Copy-Item "mobile-backend/package.json" "deployment/"
}
if (Test-Path "mobile-backend/.env") {
    Copy-Item "mobile-backend/.env" "deployment/"
}

# Create server setup script
$setupScript = @'
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
'@

$setupScript | Out-File -FilePath "deployment/setup.sh" -Encoding UTF8

# Create backend server.js if it doesn't exist
if (-not (Test-Path "deployment/server.js")) {
    Write-Host "📝 Creating default server.js..." -ForegroundColor Blue
    $serverJs = Get-Content "mobile-backend/server.js" -Raw -ErrorAction SilentlyContinue
    if (-not $serverJs) {
        $serverJs = @'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Pixiv backend running on EC2',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pixiv backend running on port ${PORT}`);
});
'@
    }
    $serverJs | Out-File -FilePath "deployment/server.js" -Encoding UTF8
}

# Create package.json if it doesn't exist
if (-not (Test-Path "deployment/package.json")) {
    $packageJson = @'
{
  "name": "pixiv-backend-ec2",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "axios": "^1.13.2",
    "dotenv": "^16.6.1"
  }
}
'@
    $packageJson | Out-File -FilePath "deployment/package.json" -Encoding UTF8
}

# Create .env if it doesn't exist
if (-not (Test-Path "deployment/.env")) {
    $envFile = @'
PORT=3001
NODE_ENV=production
PIXIV_PHPSESSID=your_session_here
PIXIV_BACKUP_SESSIONS=backup1,backup2,backup3
'@
    $envFile | Out-File -FilePath "deployment/.env" -Encoding UTF8
}

Write-Host ""
Write-Host "🎉 EC2 Instance Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Instance Information:" -ForegroundColor Blue
Write-Host "  Instance ID: $instanceId"
Write-Host "  Public IP: $publicIp"
Write-Host "  SSH Key: $KeyName.pem"
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Blue
Write-Host "1. Connect to server and setup backend:"
Write-Host ""

# Check if WSL is available
$wslAvailable = $false
try {
    wsl --status 2>$null | Out-Null
    $wslAvailable = $true
} catch {
    $wslAvailable = $false
}

if ($wslAvailable) {
    Write-Host "   Using WSL (Recommended):" -ForegroundColor Green
    Write-Host "   wsl scp -i $KeyName.pem -r deployment/* ubuntu@${publicIp}:~/"
    Write-Host "   wsl ssh -i $KeyName.pem ubuntu@$publicIp"
} else {
    Write-Host "   Install WSL first (Recommended):" -ForegroundColor Yellow
    Write-Host "   wsl --install"
    Write-Host ""
    Write-Host "   Or use PuTTY/Windows SSH:" -ForegroundColor Blue
    Write-Host "   ssh -i $KeyName.pem ubuntu@$publicIp"
}

Write-Host ""
Write-Host "2. On the server, run:" -ForegroundColor Blue
Write-Host "   chmod +x setup.sh && ./setup.sh"
Write-Host "   cd pixiv-backend && npm install"
Write-Host "   pm2 start server.js --name pixiv-backend"
Write-Host ""
Write-Host "3. Update mobile app configuration:" -ForegroundColor Blue
Write-Host "   VITE_API_BASE_URL=http://$publicIp:3001"
Write-Host ""
Write-Host "🌐 Test URLs:" -ForegroundColor Blue
Write-Host "  Health Check: http://$publicIp:3001/api/health"
Write-Host ""
Write-Host "💰 Cost Info:" -ForegroundColor Green
Write-Host "  t2.micro is FREE for 12 months with AWS Free Tier"
Write-Host "  After free tier: ~$8-12/month"
Write-Host ""
Write-Host "🔧 Management:" -ForegroundColor Blue
Write-Host "  Stop instance: aws ec2 stop-instances --instance-ids $instanceId"
Write-Host "  Start instance: aws ec2 start-instances --instance-ids $instanceId"
Write-Host ""
Write-Host "✅ Deployment files ready in 'deployment' folder!" -ForegroundColor Green

# Cleanup
# Remove-Item -Path "deployment" -Recurse -Force -ErrorAction SilentlyContinue