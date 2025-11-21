# AWS Quick Start - 5 Minute Deployment

## 🚀 **Deploy Your Pixiv Backend to AWS in 5 Minutes**

This guide gets your Pixiv backend running on AWS Free Tier with zero ongoing costs for most users.

## ⚡ **Quick Setup**

### **1. Prerequisites (2 minutes)**
```bash
# Install AWS CLI (if not installed)
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Install Serverless Framework
npm install -g serverless

# Verify installations
aws --version
serverless --version
```

### **2. AWS Account Setup (1 minute)**
1. **Create AWS Account**: https://aws.amazon.com/free/
2. **Create IAM User**:
   - Go to AWS Console → IAM → Users → Create User
   - Enable "Programmatic access"
   - Attach "AdministratorAccess" policy
   - Save Access Key ID and Secret Key

### **3. Configure AWS (30 seconds)**
```bash
aws configure
# AWS Access Key ID: [paste your key]
# AWS Secret Access Key: [paste your secret]
# Default region: us-east-1
# Default output format: json
```

### **4. Deploy Backend (2 minutes)**
```bash
# Make deployment script executable
chmod +x deploy-to-aws.sh

# Run deployment
./deploy-to-aws.sh
```

## 📱 **Update Mobile App**

After deployment, you'll get an API Gateway URL like:
```
https://abc123def4.execute-api.us-east-1.amazonaws.com/
```

### **Update your mobile app configuration:**

1. **Create production environment file**:
```bash
# .env.production
VITE_API_BASE_URL=https://your-aws-api-gateway-url.amazonaws.com
```

2. **Update API service** (if needed):
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

3. **Build and test**:
```bash
npm run build
npm run preview
```

## ✅ **Verification**

### **Test Your Deployed Backend**
```bash
# Replace with your actual API Gateway URL
curl https://your-aws-url.amazonaws.com/api/health

# Should return:
# {"status":"ok","message":"Lambda backend running",...}
```

### **Test Mobile App**
1. Open your mobile app
2. Try downloading from a Pixiv URL
3. Should work without running local backend!

## 💰 **Cost Monitoring**

### **AWS Free Tier Limits**
- **Lambda**: 1M requests/month (FREE)
- **API Gateway**: 1M calls/month (FREE)
- **CloudWatch**: Basic monitoring (FREE)

### **After Free Tier**
- **Typical cost**: $1-5/month for moderate usage
- **Per request**: ~$0.000004 (extremely cheap)

### **Set Up Billing Alerts**
1. Go to AWS Console → Billing → Budgets
2. Create budget for $5/month
3. Get email alerts at 80% usage

## 🔧 **Management Commands**

```bash
cd pixiv-backend-aws

# View logs
npm run logs

# Deploy updates
npm run deploy

# Remove deployment (cleanup)
npm run remove

# Deploy to different stage
npm run deploy:dev
```

## 🎯 **Benefits**

### **For You**
- ✅ **Zero maintenance** - AWS handles everything
- ✅ **Global availability** - works worldwide
- ✅ **Auto-scaling** - handles traffic spikes
- ✅ **99.9% uptime** - AWS reliability

### **For Your Users**
- ✅ **No setup required** - app works immediately
- ✅ **Fast downloads** - AWS global infrastructure
- ✅ **Always available** - no "backend not running" errors
- ✅ **Mobile-friendly** - designed for mobile use

## 🔄 **Updates & Maintenance**

### **Update Pixiv Sessions**
```bash
# Edit .env file with new sessions
nano .env

# Redeploy
npm run deploy
```

### **Monitor Usage**
- **AWS Console**: CloudWatch → Metrics → Lambda
- **Logs**: CloudWatch → Log Groups → /aws/lambda/pixiv-backend-prod-api
- **Billing**: AWS Console → Billing Dashboard

## 🆘 **Troubleshooting**

### **Common Issues**
- **"AWS credentials not configured"**: Run `aws configure`
- **"Deployment failed"**: Check AWS permissions
- **"Function timeout"**: Increase timeout in serverless.yml
- **"Rate limited"**: Sessions may need rotation

### **Get Help**
```bash
# Check deployment status
serverless info

# View detailed logs
serverless logs -f api --tail

# Test locally
npm start
```

That's it! Your Pixiv backend is now running on AWS and your mobile app works globally! 🎉