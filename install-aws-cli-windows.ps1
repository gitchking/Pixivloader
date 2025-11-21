# AWS CLI Installation Script for Windows
# Run this in PowerShell as Administrator

Write-Host "🚀 Installing AWS CLI v2 for Windows..." -ForegroundColor Blue

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if AWS CLI is already installed
try {
    $currentVersion = aws --version 2>$null
    if ($currentVersion) {
        Write-Host "⚠️  AWS CLI already installed: $currentVersion" -ForegroundColor Yellow
        $response = Read-Host "Do you want to reinstall/update? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "✅ Using existing AWS CLI installation" -ForegroundColor Green
            exit 0
        }
    }
} catch {
    Write-Host "📦 AWS CLI not found, installing..." -ForegroundColor Blue
}

# Method 1: Try winget first (Windows 10/11)
Write-Host "📦 Attempting installation via winget..." -ForegroundColor Blue
try {
    winget install Amazon.AWSCLI --accept-source-agreements --accept-package-agreements
    Write-Host "✅ AWS CLI installed via winget" -ForegroundColor Green
    $installSuccess = $true
} catch {
    Write-Host "⚠️  winget installation failed, trying MSI installer..." -ForegroundColor Yellow
    $installSuccess = $false
}

# Method 2: MSI installer fallback
if (-not $installSuccess) {
    Write-Host "📦 Downloading AWS CLI MSI installer..." -ForegroundColor Blue
    $url = "https://awscli.amazonaws.com/AWSCLIV2.msi"
    $output = "$env:TEMP\AWSCLIV2.msi"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host "📦 Installing AWS CLI..." -ForegroundColor Blue
        Start-Process msiexec.exe -Wait -ArgumentList "/i `"$output`" /quiet"
        Remove-Item $output -ErrorAction SilentlyContinue
        Write-Host "✅ AWS CLI installed via MSI" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download/install AWS CLI" -ForegroundColor Red
        Write-Host "Please manually download from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
        exit 1
    }
}

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Blue
Start-Sleep -Seconds 3

try {
    $version = aws --version 2>$null
    if ($version) {
        Write-Host "✅ AWS CLI installed successfully!" -ForegroundColor Green
        Write-Host "  Version: $version"
    } else {
        throw "Version check failed"
    }
} catch {
    Write-Host "⚠️  Installation completed but AWS CLI not immediately available" -ForegroundColor Yellow
    Write-Host "Please restart PowerShell and try: aws --version" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Blue
Write-Host "1. Restart PowerShell (close and reopen)"
Write-Host "2. Configure AWS CLI: aws configure"
Write-Host "3. Run deployment: .\deploy-ec2-windows.ps1"
Write-Host ""
Write-Host "📋 You'll need:" -ForegroundColor Yellow
Write-Host "- AWS Access Key ID"
Write-Host "- AWS Secret Access Key"
Write-Host "- Default region: us-east-1"
Write-Host ""
Write-Host "✅ AWS CLI installation complete!" -ForegroundColor Green