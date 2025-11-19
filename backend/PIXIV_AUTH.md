# Pixiv Authentication Setup

## Why Authentication?

Authenticated scraping provides:
- ✅ Access to more content
- ✅ Better reliability
- ✅ Fewer rate limits
- ✅ Access to age-restricted content
- ✅ Higher quality images

## Setup Instructions

### Step 1: Get Pixiv Account

If you don't have a Pixiv account:
1. Go to https://www.pixiv.net/
2. Click "Sign Up"
3. Create a free account

### Step 2: Add Credentials to .env

Edit `backend/.env` and add your credentials:

```env
PIXIV_USERNAME=your_email@example.com
PIXIV_PASSWORD=your_password
```

**Important:** 
- Use your actual Pixiv login email/username
- Use your actual password
- Keep this file secure and never commit it to Git

### Step 3: Restart Backend

After adding credentials, restart the backend:
```bash
npm run dev
```

## How It Works

1. When scraping starts, the backend will:
   - Launch a browser
   - Navigate to Pixiv login page
   - Enter your credentials
   - Login automatically
   - Then scrape the requested profile

2. You'll see these logs:
   ```
   🔐 Logging into Pixiv...
   ✅ Successfully logged into Pixiv
   ```

3. If login fails, it will attempt unauthenticated scraping:
   ```
   ⚠️  No Pixiv credentials found, attempting unauthenticated scraping...
   ```

## Troubleshooting

### Login Fails

**Problem:** Login credentials rejected

**Solutions:**
- Double-check your email/username and password
- Make sure there are no extra spaces in .env
- Try logging in manually at https://www.pixiv.net/ to verify credentials
- Check if Pixiv requires CAPTCHA (may need to login manually first)

### Two-Factor Authentication (2FA)

If you have 2FA enabled on your Pixiv account:
- The automated login may not work
- Consider creating a separate Pixiv account without 2FA for scraping
- Or temporarily disable 2FA for scraping

### Rate Limiting

Even with authentication, Pixiv may rate limit:
- The scraper is limited to 100 artworks per request
- Wait a few minutes between large scraping jobs
- Consider upgrading to Pixiv Premium for better limits

## Security Notes

⚠️ **Important Security Information:**

1. **Never share your .env file**
   - It contains your password in plain text
   - Add `.env` to `.gitignore` (already done)

2. **Use a dedicated account**
   - Consider creating a separate Pixiv account just for scraping
   - Don't use your main account with important data

3. **Environment Variables**
   - In production (Render), add credentials as environment variables
   - Never hardcode credentials in your code

4. **Password Security**
   - Use a strong, unique password
   - Don't reuse passwords from other services

## Testing

To test if authentication works:

1. Add credentials to `.env`
2. Start backend: `npm run dev`
3. Try scraping a profile from the frontend
4. Check backend logs for:
   ```
   ✅ Successfully logged into Pixiv
   ```

## Without Authentication

The scraper will still work without credentials, but:
- May fail on some profiles
- Limited to public content only
- More likely to hit rate limits
- May get blocked by Pixiv's anti-bot measures

**Recommendation:** Always use authentication for best results!
