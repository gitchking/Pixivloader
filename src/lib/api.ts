const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function startScraping(url: string, userId: string, historyId: string) {
  try {
    const response = await fetch(`${API_URL}/api/scrape/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        userId,
        historyId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start scraping');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getScrapeStatus(historyId: string) {
  try {
    const response = await fetch(`${API_URL}/api/scrape/status/${historyId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get scrape status');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
}
