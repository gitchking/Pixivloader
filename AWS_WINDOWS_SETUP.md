# AWS CLI Setup for Windows - Pixiv Backend

## 🪟 **Windows-Specific Installation**

### **Step 1: Install AWS CLI v2 (Windows)**

#### **Option A: MSI Installer (Recommended)**
1. Download AWS CLI MSI installer: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer as Administrator
3. Follow the installation wizard
4. Restart PowerShell/Command Prompt

#### **Option B: PowerShell Command**
```powershell
# Download and install AWS CLI
$url = "https://awscli.amazonaws.com/AWSCLIV2.msi"
$output = "$env:TEMP\AWSCLIV2.msi"
Invoke-WebRequest -Uri $url -OutFile $output
Start-Process msiexec.exe -Wait -ArgumentList "/i $output /quiet"
```

#### **Option C: Chocolatey (if you have it)**
```powershell
choco install awscli
```

#### **Option D: Winget (Windows 11/10)**
```powershell
winget install Amazon.AWSCLI
```

### **Step 2: Verify Installation**
```powershell
# Restart PowerShell and test
aws --version
# Should show: aws-cli/2.x.x Python/3.x.x Windows/...
```

### **Step 3: Configure AWS CLI**
```powershell
aws configure
# AWS Access Key ID [None]: YOUR_ACCESS_KEY
# AWS Secret Access Key [None]: YOUR_SECRET_KEY
# Default region name [None]: us-east-1
# Default output format [None]: json
```

## 🚀 **Windows PowerShell Deployment Script**

Since you're on Windows, I'll create a PowerShell version of the deployment script:

### **Create Windows Deployment Script**
```powershell
# Save this as: deploy-ec2-windows.ps1

# AWS EC2 Deployment Script for Windows PowerShell
param(
    [string]$KeyName = "pixiv-backend-key",
    [string]$SecurityGroup = "pixiv-backend-sg",
    [string]$InstanceName = "pixiv-backend",
    [string]$InstanceType = "t2.micro",
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Starting AWS EC2 deployment for Pixiv Backend..." -ForegroundColor Blue

# Check AWS CLI
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS credentials verified" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Check if key pair exists
$keyExists = $false
try {
    aws ec2 describe-key-pairs --key-names $KeyName | Out-Null
    $keyExists = $true
    Write-Host "⚠️  Key pair '$KeyName' already exists" -ForegroundColor Yellow
} catch {
    Write-Host "🔑 Creating SSH key pair..." -ForegroundColor Blue
    aws ec2 create-key-pair --key-name $KeyName --query 'KeyMaterial' --output text | Out-File -FilePath "$KeyName.pem" -Encoding ASCII
    Write-Host "✅ SSH key pair created: $KeyName.pem" -ForegroundColor Green
}

# Check if security group exists
$sgId = $null
try {
    $sgId = aws ec2 describe-security-groups --group-names $SecurityGroup --query 'SecurityGroups[0].GroupId' --output text 2>$null
} catch {
    # Security group doesn't exist, create it
}

if (-not $sgId -or $sgId -eq "None") {
    Write-Host "🛡️  Creating security group..." -ForegroundColor Blue
    $sgId = aws ec2 create-security-group --group-name $SecurityGroup --description "Security group for Pixiv backend" --query 'GroupId' --output text
    
    Write-Host "🔓 Adding security group rules..." -ForegroundColor Blue
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3001 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0
    
    Write-Host "✅ Security group created: $sgId" -ForegroundColor Green
} else {
    Write-Host "⚠️  Security group '$SecurityGroup' already exists: $sgId" -ForegroundColor Yellow
}

# Check for existing instances
$existingInstance = aws ec2 describe-instances --filters "Name=tag:Name,Values=$InstanceName" "Name=instance-state-name,Values=running,pending,stopping,stopped" --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' --output text

if ($existingInstance) {
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
    }
}

# Launch new instance if needed
if (-not $instanceId) {
    Write-Host "🚀 Launching EC2 instance..." -ForegroundColor Blue
    $instanceId = aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --count 1 --instance-type $InstanceType --key-name $KeyName --security-group-ids $sgId --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]" --query 'Instances[0].InstanceId' --output text
    
    Write-Host "⏳ Waiting for instance to be running..." -ForegroundColor Blue
    aws ec2 wait instance-running --instance-ids $instanceId
    
    Write-Host "📡 Getting public IP address..." -ForegroundColor Blue
    $publicIp = aws ec2 describe-instances --instance-ids $instanceId --query 'Reservations[*].Instances[*].PublicIpAddress' --output text
    
    Write-Host "✅ Instance launched successfully!" -ForegroundColor Green
    Write-Host "  Instance ID: $instanceId"
    Write-Host "  Public IP: $publicIp"
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Instance Information:" -ForegroundColor Blue
Write-Host "  Instance ID: $instanceId"
Write-Host "  Public IP: $publicIp"
Write-Host "  SSH Key: $KeyName.pem"
Write-Host ""
Write-Host "🌐 Next Steps:" -ForegroundColor Blue
Write-Host "1. Connect via SSH: ssh -i $KeyName.pem ubuntu@$publicIp"
Write-Host "2. Run setup script on server"
Write-Host "3. Update mobile app with: VITE_API_BASE_URL=http://$publicIp:3001"
Write-Host ""
Write-Host "✅ Your EC2 instance is ready!" -ForegroundColor Green
```

## 🔧 **Windows-Specific Commands**

### **Run PowerShell Script**
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run deployment script
.\deploy-ec2-windows.ps1
```

### **Connect to EC2 from Windows**

#### **Option A: Use WSL (Windows Subsystem for Linux)**
```powershell
# Install WSL if not already installed
wsl --install

# Use SSH from WSL
wsl ssh -i pixiv-backend-key.pem ubuntu@YOUR_PUBLIC_IP
```

#### **Option B: Use PuTTY**
1. Download PuTTY: https://www.putty.org/
2. Convert .pem to .ppk using PuTTYgen:
   - Open PuTTYgen
   - Load your .pem file
   - Save as .ppk file
3. Use PuTTY to connect with the .ppk file

#### **Option C: Use Windows OpenSSH**
```powershell
# Enable OpenSSH client (Windows 10/11)
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Connect using SSH
ssh -i pixiv-backend-key.pem ubuntu@YOUR_PUBLIC_IP
```

## 📦 **Alternative: Use AWS CloudShell**

If you have trouble with local AWS CLI, use AWS CloudShell (browser-based):

1. Go to AWS Console: https://console.aws.amazon.com/
2. Click the CloudShell icon (terminal icon in top bar)
3. Run the Linux deployment script directly in CloudShell

## 🔄 **Windows Management Commands**

### **PowerShell Equivalents**
```powershell
# Get instance information
aws ec2 describe-instances --filters "Name=tag:Name,Values=pixiv-backend" --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' --output table

# Stop instance
$instanceId = aws ec2 describe-instances --filters "Name=tag:Name,Values=pixiv-backend" --query 'Reservations[*].Instances[*].InstanceId' --output text
aws ec2 stop-instances --instance-ids $instanceId

# Start instance
aws ec2 start-instances --instance-ids $instanceId

# Get public IP
$publicIp = aws ec2 describe-instances --filters "Name=tag:Name,Values=pixiv-backend" --query 'Reservations[*].Instances[*].PublicIpAddress' --output text
Write-Host "Public IP: $publicIp"
```

### **Test Connection from Windows**
```powershell
# Test API endpoint
$publicIp = aws ec2 describe-instances --filters "Name=tag:Name,Values=pixiv-backend" --query 'Reservations[*].Instances[*].PublicIpAddress' --output text
Invoke-RestMethod -Uri "http://$publicIp:3001/api/health"
```

This Windows-specific guide should work perfectly with your PowerShell environment!