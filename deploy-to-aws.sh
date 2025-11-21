#!/bin/bash

# AWS Deployment Script for Pixiv Backend
echo "🚀 Starting AWS Lambda deployment for Pixiv Backend..."

# Check if required tools are installed
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p pixiv-backend-aws
cd pixiv-backend-aws

# Copy necessary files
echo "📋 Copying deployment files..."
cp ../aws-lambda-handler.js ./handler.js
cp ../serverless.yml ./
cp ../aws-package.json ./package.json

# Create .env file with current sessions
echo "🔧 Setting up environment variables..."
if [ -f "../mobile-backend/.env" ]; then
    grep "PIXIV_PHPSESSID\|PIXIV_BACKUP_SESSIONS" ../mobile-backend/.env > .env
    echo "✅ Environment variables copied from mobile-backend/.env"
else
    echo "⚠️  No .env file found. Please create one with your Pixiv sessions:"
    echo "PIXIV_PHPSESSID=your_session_here"
    echo "PIXIV_BACKUP_SESSIONS=backup1,backup2,backup3"
    read -p "Press Enter to continue after creating .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS credentials verified"

# Test locally first
echo "🧪 Testing locally..."
echo "Starting local server on http://localhost:3001"
echo "Press Ctrl+C to stop and continue with deployment"
npm start &
LOCAL_PID=$!

# Wait a moment for server to start
sleep 3

# Test health endpoint
curl -s http://localhost:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Local test successful"
else
    echo "⚠️  Local test failed, but continuing with deployment"
fi

# Stop local server
kill $LOCAL_PID 2>/dev/null

# Deploy to AWS
echo "🚀 Deploying to AWS Lambda..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    
    # Get deployment info
    echo "📊 Getting deployment information..."
    npm run info
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "📱 Update your mobile app with the API Gateway URL shown above"
    echo "🔍 Monitor logs with: npm run logs"
    echo "🗑️  Remove deployment with: npm run remove"
    
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi