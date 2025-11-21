import config from '@/config/environment';
import { embeddedBackend } from './embedded-backend';

const API_BASE_URL = config.api.baseUrl;

// Check if running in Capacitor (mobile app)
const isCapacitor = window.location.protocol === 'capacitor:' || 
                   window.location.protocol === 'ionic:' ||
                   (window as any).Capacitor;

export interface ArtworkImage {
  url: string;
  filename: string;
}

export interface Artwork {
  id: string;
  title: string;
  images: string[];
  imageCount: number;
}

export interface ArtworkListResponse {
  success: boolean;
  artworks: Artwork[];
  totalArtworks: number;
  totalImages: number;
  message: string;
}

export interface HealthStatus {
  status: string;
  message: string;
  service_authenticated: boolean;
  session_cookies: boolean | number;
}

export class PixivAPI {
  static async checkHealth(): Promise<HealthStatus> {
    if (isCapacitor) {
      // Use embedded backend in mobile app
      return embeddedBackend.checkHealth();
    }
    
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error('Backend not available');
    }
    return response.json();
  }

  static async getArtworkList(url: string, userId: string, downloadLocation?: string): Promise<ArtworkListResponse> {
    if (isCapacitor) {
      // Use embedded backend in mobile app
      const pixivUserId = this.extractUserId(url);
      const artworkId = this.extractArtworkId(url);

      if (!pixivUserId && !artworkId) {
        throw new Error('Please provide a valid Pixiv user or artwork URL');
      }

      if (pixivUserId) {
        const result = await embeddedBackend.getUserArtworks(pixivUserId);
        
        // Get image counts for each artwork
        let totalImages = 0;
        const updatedArtworks: Artwork[] = [];
        
        for (const artwork of result.artworks) {
          const images = await embeddedBackend.getArtworkImages(artwork.id);
          const updatedArtwork: Artwork = {
            id: artwork.id,
            title: artwork.title,
            images: images,
            imageCount: images.length
          };
          updatedArtworks.push(updatedArtwork);
          totalImages += images.length;
        }

        return {
          success: result.success,
          artworks: updatedArtworks,
          totalArtworks: result.totalArtworks,
          totalImages,
          message: result.message
        };
      } else if (artworkId) {
        const images = await embeddedBackend.getArtworkImages(artworkId);
        return {
          success: true,
          artworks: [{
            id: artworkId,
            title: `Artwork ${artworkId}`,
            images,
            imageCount: images.length
          }],
          totalArtworks: 1,
          totalImages: images.length,
          message: 'Found 1 artwork'
        };
      }

      throw new Error('Invalid URL');
    }

    // Use external backend
    const response = await fetch(`${API_BASE_URL}/api/download/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        userId,
        downloadLocation: downloadLocation || 'Downloads'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch artworks');
    }

    return response.json();
  }

  private static extractUserId(url: string): string | null {
    // Match various Pixiv user URL formats
    const patterns = [
      /users\/(\d+)/,           // /users/123456
      /member\.php\?id=(\d+)/,  // /member.php?id=123456
      /u\/(\d+)/                // /u/123456
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private static extractArtworkId(url: string): string | null {
    // Match various Pixiv artwork URL formats
    const patterns = [
      /artworks\/(\d+)/,           // /artworks/123456
      /illust_id=(\d+)/,          // /illust_id=123456
      /i\/(\d+)/                  // /i/123456
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static async downloadImage(imageUrl: string, filename?: string, downloadLocation?: string): Promise<Blob> {
    if (isCapacitor) {
      // Use embedded backend in mobile app
      return embeddedBackend.downloadImage(imageUrl, filename, downloadLocation);
    }

    // Use external backend
    const params = new URLSearchParams({
      url: imageUrl,
      ...(filename && { filename })
    });

    const response = await fetch(`${API_BASE_URL}/api/download/image?${params}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
      throw new Error(errorData.message || 'Failed to download image');
    }

    return response.blob();
  }

  static async downloadMultipleImages(
    artworks: Artwork[], 
    onProgress?: (downloaded: number, total: number, currentFile: string) => void,
    downloadLocation?: string
  ): Promise<void> {
    let downloaded = 0;
    const totalImages = artworks.reduce((sum, artwork) => sum + artwork.imageCount, 0);

    for (const artwork of artworks) {
      for (let i = 0; i < artwork.images.length; i++) {
        const imageUrl = artwork.images[i];
        const filename = `${artwork.id}_${i + 1}.jpg`;
        
        try {
          onProgress?.(downloaded, totalImages, filename);
          
          const blob = await this.downloadImage(imageUrl, filename, downloadLocation);
          
          // Only use downloadFile for web browsers, mobile apps save directly to filesystem
          if (!isCapacitor) {
            this.downloadFile(blob, filename);
          }
          
          downloaded++;
          onProgress?.(downloaded, totalImages, filename);
          
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download ${filename}:`, error);
        }
      }
    }
  }

  static downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}