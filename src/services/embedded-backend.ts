// Embedded backend functionality for mobile app
// This replaces the Node.js backend with browser-compatible code

interface PixivSession {
  authenticated: boolean;
  sessionId: string;
}

interface EmbeddedArtwork {
  id: string;
  url: string;
  title: string;
  images: string[];
  imageCount: number;
}

interface EmbeddedArtworkListResponse {
  success: boolean;
  artworks: EmbeddedArtwork[];
  totalArtworks: number;
  totalImages: number;
  message: string;
}

class EmbeddedPixivBackend {
  private session: PixivSession = {
    authenticated: false,
    sessionId: ''
  };

  constructor() {
    this.loadSession();
    this.initializeDefaultSession();
  }

  private loadSession() {
    const stored = localStorage.getItem('pixiv_session');
    if (stored) {
      try {
        this.session = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }

  private initializeDefaultSession() {
    // Always use the default session for mobile users (no user configuration needed)
    const defaultSessionId = '121620980_QvZapQeJyWCeS9HyiOHhnKccoQp9hrGE';
    
    this.session = {
      authenticated: true,
      sessionId: defaultSessionId
    };
    this.saveSession();
    console.log('🔐 Using content service session for mobile app');
  }

  private saveSession() {
    localStorage.setItem('pixiv_session', JSON.stringify(this.session));
  }

  async setSession(sessionId: string) {
    this.session = {
      authenticated: true,
      sessionId
    };
    this.saveSession();
  }

  async checkHealth() {
    return {
      status: 'ok',
      message: 'Embedded backend is running',
      pixiv_authenticated: this.session.authenticated,
      session_cookies: this.session.authenticated,
      pixiv_session_id: this.session.sessionId ? 'configured' : 'missing'
    };
  }

  async getUserArtworks(userId: string, limit = 500): Promise<EmbeddedArtworkListResponse> {
    if (!this.session.authenticated) {
      throw new Error('Not authenticated with Pixiv');
    }

    try {
      // Use Pixiv's AJAX API directly from the browser
      const response = await fetch(`https://www.pixiv.net/ajax/user/${userId}/profile/all`, {
        headers: {
          'Cookie': `PHPSESSID=${this.session.sessionId}`,
          'Referer': 'https://www.pixiv.net/',
          'User-Agent': navigator.userAgent
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'API error');
      }

      // Extract and sort artwork IDs
      const artworkIds = [];
      if (data.body && data.body.illusts) {
        artworkIds.push(...Object.keys(data.body.illusts));
      }
      
      // Sort by ID (newest first)
      artworkIds.sort((a, b) => parseInt(b) - parseInt(a));
      
      console.log(`Found ${artworkIds.length} artworks for user ${userId}`);
      
      if (artworkIds.length === 0) {
        throw new Error('No artworks found for this user');
      }

      // Convert to artwork objects
      const limitedIds = limit ? artworkIds.slice(0, limit) : artworkIds;
      const artworks: EmbeddedArtwork[] = limitedIds.map(id => ({
        id: id,
        url: `https://www.pixiv.net/artworks/${id}`,
        title: `Artwork ${id}`,
        images: [], // Will be populated when needed
        imageCount: 0 // Will be updated when images are loaded
      }));

      return {
        success: true,
        artworks,
        totalArtworks: artworks.length,
        totalImages: 0, // Will be calculated when getting images
        message: `Found ${artworks.length} artworks`
      };
    } catch (error) {
      console.error('Error fetching user artworks:', error);
      throw error;
    }
  }

  async getArtworkImages(artworkId: string) {
    if (!this.session.authenticated) {
      throw new Error('Not authenticated with Pixiv');
    }

    try {
      // Get artwork details
      const response = await fetch(`https://www.pixiv.net/ajax/illust/${artworkId}`, {
        headers: {
          'Cookie': `PHPSESSID=${this.session.sessionId}`,
          'Referer': 'https://www.pixiv.net/',
          'User-Agent': navigator.userAgent
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`Failed to fetch artwork ${artworkId}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (data.error) {
        console.error(`API error for artwork ${artworkId}:`, data.message);
        return [];
      }

      const images = [];
      
      if (data.body && data.body.urls && data.body.urls.original) {
        // Single image artwork
        images.push(data.body.urls.original);
      } else if (data.body && data.body.pageCount > 1) {
        // Multi-page artwork
        const pagesResponse = await fetch(`https://www.pixiv.net/ajax/illust/${artworkId}/pages`, {
          headers: {
            'Cookie': `PHPSESSID=${this.session.sessionId}`,
            'Referer': 'https://www.pixiv.net/',
            'User-Agent': navigator.userAgent
          },
          credentials: 'include'
        });
        
        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          if (!pagesData.error && pagesData.body) {
            pagesData.body.forEach((page: any) => {
              if (page.urls && page.urls.original) {
                images.push(page.urls.original);
              }
            });
          }
        }
      }

      console.log(`Found ${images.length} images for artwork ${artworkId}`);
      return images;
    } catch (error) {
      console.error(`Error fetching artwork ${artworkId}:`, error);
      return [];
    }
  }

  async downloadImage(imageUrl: string, filename?: string, downloadLocation?: string) {
    if (!this.session.authenticated) {
      throw new Error('Not authenticated with Pixiv');
    }

    try {
      // Use a proxy or direct fetch with proper headers
      const response = await fetch(imageUrl, {
        headers: {
          'Referer': 'https://www.pixiv.net/',
          'User-Agent': navigator.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const blob = await response.blob();

      // If running in Capacitor, save to filesystem
      if ((window as any).Capacitor) {
        await this.saveToMobileFilesystem(blob, filename || 'pixiv_image.jpg', downloadLocation || 'Downloads');
      }

      return blob;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  private async saveToMobileFilesystem(blob: Blob, filename: string, downloadLocation: string) {
    try {
      // Check if Capacitor Filesystem is available
      const { Filesystem, Directory } = (window as any).Capacitor.Plugins;
      
      if (!Filesystem) {
        console.warn('Capacitor Filesystem not available');
        return;
      }

      // Convert blob to base64
      const base64Data = await this.blobToBase64(blob);
      
      // Determine directory based on download location
      let directory = Directory.Documents;
      let path = downloadLocation;
      
      if (downloadLocation.includes('Pictures')) {
        directory = Directory.Documents; // Fallback to Documents as Pictures might not be writable
        path = 'Pictures/Pixiv';
      } else if (downloadLocation.includes('DCIM')) {
        directory = Directory.Documents; // Fallback to Documents as DCIM might not be writable
        path = 'DCIM/Pixiv';
      } else if (downloadLocation.includes('Downloads')) {
        directory = Directory.Documents;
        path = 'Downloads';
      }

      // Create directory if it doesn't exist
      try {
        await Filesystem.mkdir({
          path: path,
          directory: directory,
          recursive: true
        });
      } catch (e) {
        // Directory might already exist
      }

      // Save file
      await Filesystem.writeFile({
        path: `${path}/${filename}`,
        data: base64Data,
        directory: directory
      });

      console.log(`File saved to ${path}/${filename}`);
    } catch (error) {
      console.error('Error saving to mobile filesystem:', error);
      throw error;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Create singleton instance
export const embeddedBackend = new EmbeddedPixivBackend();

// Export for use in API service
export default EmbeddedPixivBackend;