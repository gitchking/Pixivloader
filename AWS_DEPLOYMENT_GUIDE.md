# AWS Free Tier Deployment Guide - Pixiv Backend

## 🚀 **Overview**

Deploy your Pixiv backend to AWS Free Tier for **completely free hosting** that makes your mobile app work anywhere without requiring users to run a local backend.

## 💰 **AWS Free Tier Benefits**

### **What's Included (12 months free)**
- ✅ **AWS Lambda**: 1M requests/month + 400,000 GB-seconds compute
- ✅ **API Gateway**: 1M API calls/month
- ✅ **CloudWatch**: Basic monitoring and logs
- ✅ **S3**: 5GB storage (for deployment artifacts)

### **Cost After Free Tier**
- **Lambda**: ~$0.0000002 per request (extremely cheap)
- **API Gateway**: ~$0.0000035 per request
- **Typical monthly cost**: $1-5 for moderate usage

## 🛠️ **Deployment Options**

### **Option 1: AWS Lambda + API Gateway (Recommended)**
- **Serverless** - scales automatically
- **Pay per request** - only pay when used
- **Global CDN** - fast worldwide access
- **Zero maintenance** - AWS handles everything

### **Option 2: AWS EC2 t2.micro (Alternative)**
- **Always-on server** - traditional hosting
- **Free for 12 months** - t2.micro instance
- **More control** - full server access
- **Requires maintenance** - OS updates, security

## 📋 **Quick Setup Guide**

### **Prerequisites**
1. **AWS Account** (free to create)
2. **AWS CLI** installed locally
3. **Node.js** and npm installed

### **Step 1: Install Serverless Framework**
```bash
npm install -g serverless
npm install -g serverless-offline
```

### **Step 2: Create AWS Credentials**
1. Go to **AWS Console** → **IAM** → **Users**
2. Create new user with **Programmatic access**
3. Attach **AdministratorAccess** policy (for deployment)
4. Save **Access Key ID** and **Secret Access Key**

### **Step 3: Configure AWS CLI**
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key  
# Region: us-east-1 (recommended)
# Output format: json
```

## 🔧 **Project Setup**

### **Create Serverless Project**
```bash
mkdir pixiv-backend-aws
cd pixiv-backend-aws
npm init -y
```

### **Install Dependencies**
```bash
npm install express cors axios archiver uuid
npm install --save-dev serverless serverless-http serverless-offline
```

### **Create serverless.yml**
```yaml
service: pixiv-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: prod
  environment:
    PIXIV_PHPSESSID: ${env:PIXIV_PHPSESSID}
    PIXIV_BACKUP_SESSIONS: ${env:PIXIV_BACKUP_SESSIONS}
  httpApi:
    cors: true
  timeout: 30

functions:
  api:
    handler: handler.handler
    events:
      - httpApi:
          path: /{proxy+}
          method: ANY
      - httpApi:
          path: /
          method: ANY

plugins:
  - serverless-offline

custom:
  serverless-offline:
    httpPort: 3001
```

### **Create Environment File**
```bash
# Create .env file
echo "PIXIV_PHPSESSID=your_session_here" > .env
echo "PIXIV_BACKUP_SESSIONS=backup1,backup2,backup3" >> .env
```

## 📁 **File Structure**
```
pixiv-backend-aws/
├── handler.js          # Lambda function code
├── serverless.yml      # AWS configuration
├── package.json        # Dependencies
├── .env               # Environment variables
└── .gitignore         # Git ignore file
```

## 🚀 **Deployment Commands**

### **Test Locally**
```bash
# Install dependencies
npm install

# Start local development server
serverless offline

# Test endpoints
curl http://localhost:3001/api/health
```

### **Deploy to AWS**
```bash
# Deploy to AWS Lambda
serverless deploy

# View deployment info
serverless info

# View logs
serverless logs -f api
```

### **Update Environment Variables**
```bash
# Update Pixiv sessions
serverless deploy --stage prod
```

## 🌐 **Mobile App Configuration**

### **Update API Base URL**
After deployment, you'll get an AWS API Gateway URL like:
```
https://abc123def4.execute-api.us-east-1.amazonaws.com/
```

### **Update Mobile App**
```typescript
// src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-aws-api-gateway-url.amazonaws.com'
  : 'http://localhost:3001';
```

### **Environment Variables for Mobile**
```bash
# .env.production
VITE_API_BASE_URL=https://your-aws-api-gateway-url.amazonaws.com

# .env.development  
VITE_API_BASE_URL=http://localhost:3001
```

## 📊 **Monitoring & Management**

### **AWS Console Monitoring**
- **CloudWatch Logs**: View function logs and errors
- **CloudWatch Metrics**: Monitor request count, duration, errors
- **API Gateway**: View API usage and performance
- **Lambda Console**: Manage function settings

### **Useful Commands**
```bash
# View recent logs
serverless logs -f api --tail

# Remove deployment (cleanup)
serverless remove

# Deploy specific stage
serverless deploy --stage dev

# Update function code only
serverless deploy function -f api
```

## 🔒 **Security Best Practices**

### **Environment Variables**
- ✅ Store Pixiv sessions in AWS environment variables
- ✅ Never commit sessions to code repository
- ✅ Use different sessions for dev/prod environments
- ✅ Rotate sessions regularly

### **API Security**
- ✅ Enable CORS for your mobile app domain
- ✅ Add rate limiting if needed
- ✅ Monitor for unusual usage patterns
- ✅ Set up CloudWatch alarms for errors

## 💡 **Optimization Tips**

### **Performance**
- **Cold starts**: Keep functions warm with scheduled pings
- **Memory allocation**: Start with 512MB, adjust based on usage
- **Timeout**: Set to 30s for image processing
- **Concurrent executions**: Monitor and adjust limits

### **Cost Optimization**
- **Request batching**: Process multiple artworks per request
- **Caching**: Cache artwork metadata when possible
- **Compression**: Enable gzip compression
- **Monitoring**: Set up billing alerts

## 🎯 **Benefits for Mobile Users**

### **Global Access**
- ✅ **Works anywhere** - no local backend required
- ✅ **Fast worldwide** - AWS global infrastructure
- ✅ **Always available** - 99.9% uptime SLA
- ✅ **Auto-scaling** - handles traffic spikes

### **Zero Setup**
- ✅ **Download and use** - no technical setup
- ✅ **Instant access** - no waiting for backend startup
- ✅ **Cross-platform** - works on any device
- ✅ **Offline-ready** - can cache responses

## 🔄 **Maintenance**

### **Regular Tasks**
1. **Monitor usage** - check AWS billing dashboard
2. **Update sessions** - rotate Pixiv sessions monthly
3. **Check logs** - review CloudWatch for errors
4. **Update dependencies** - keep packages current

### **Scaling Considerations**
- **Free tier limits**: 1M requests/month
- **Paid tier**: Extremely cheap beyond free tier
- **Multiple regions**: Deploy to multiple AWS regions
- **Load balancing**: Use Route 53 for traffic distribution

This AWS deployment makes your Pixiv mobile app truly production-ready with global availability, automatic scaling, and minimal cost!