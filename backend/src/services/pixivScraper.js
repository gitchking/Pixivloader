import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateDownloadHistory } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract user ID from Pixiv URL
 */
function extractUserId(url) {
  const match = url.match(/users\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Call Python scraper
 */
function callPythonScraper(userId, maxIllusts = 100) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../python/pixiv_scraper.py');
    
    console.log(`🐍 Calling Python scraper for user ${userId}...`);
    
    const python = spawn('python', [pythonScript, userId, maxIllusts.toString()]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
      // Log Python output in real-time
      process.stderr.write(data);
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python scraper failed with code ${code}\n${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}\n${stdout}`));
      }
    });
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start Python: ${error.message}`));
    });
  });
}

/**
 * Scrape Pixiv profile using Python API scraper
 */
export async function scrapePixivProfile(url, userId, historyId) {
  try {
    console.log(`🚀 Starting scrape for: ${url}`);
    
    // Update status to processing
    await updateDownloadHistory(historyId, {
      status: 'processing',
      updated_at: new Date().toISOString()
    });

    const pixivUserId = extractUserId(url);
    if (!pixivUserId) {
      throw new Error('Invalid Pixiv user URL');
    }

    // Call Python scraper
    const result = await callPythonScraper(pixivUserId, 100);
    
    if (!result.success) {
      throw new Error(result.error || 'Scraping failed');
    }

    console.log(`🎉 Scraping completed: ${result.images} images from ${result.artworks} artworks`);

    // Update history with completion
    await updateDownloadHistory(historyId, {
      status: 'completed',
      items_count: result.images,
      updated_at: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    // Update history with failure
    if (historyId) {
      await updateDownloadHistory(historyId, {
        status: 'failed',
        updated_at: new Date().toISOString()
      });
    }

    throw error;
  }
}

/**
 * FALLBACK: Login to Pixiv (Puppeteer - if Python fails)
 */
async function loginToPixiv(page) {
  const username = process.env.PIXIV_USERNAME;
  const password = process.env.PIXIV_PASSWORD;

  if (!username || !password) {
    console.log('⚠️  No Pixiv credentials found, attempting unauthenticated scraping...');
    return false;
  }

  try {
    console.log('🔐 Logging into Pixiv...');
    
    // Go to login page
    await page.goto('https://accounts.pixiv.net/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Fill in login form
    await page.type('input[type="text"]', username, { delay: 100 });
    await page.type('input[type="password"]', password, { delay: 100 });

    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return !window.location.href.includes('login');
    });

    if (isLoggedIn) {
      console.log('✅ Successfully logged into Pixiv');
      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
}



/**
 * Auto-scroll page to load lazy-loaded content
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const maxScroll = 10000;
      
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight >= maxScroll) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}
