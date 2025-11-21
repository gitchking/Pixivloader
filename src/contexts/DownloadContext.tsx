import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { PixivAPI, type Artwork } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { localStorageService } from '@/services/local-storage';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  downloadStatus: string;
  totalIllustrations: number;
  totalImages: number;
  currentImage: number;
  currentFileName: string;
  downloadId: string | null;
  url: string;
  userId: string;
  startTime: number;
}

interface CachedDownload {
  state: DownloadState;
  artworks: Artwork[];
  currentArtworkIndex: number;
  currentImageIndex: number;
  resumeData: {
    downloadedImages: string[];
    failedImages: string[];
  };
}

interface DownloadContextType {
  downloadState: DownloadState;
  startDownload: (url: string, userId: string) => Promise<void>;
  cancelDownload: () => void;
  resumeDownload: () => Promise<void>;
}

const CACHE_KEY = 'pixivloader_download_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to extract Pixiv user ID from URL
const extractPixivUserId = (url: string): string | undefined => {
  const patterns = [
    /users\/(\d+)/,           // /users/123456
    /member\.php\?id=(\d+)/,  // /member.php?id=123456
    /u\/(\d+)/                // /u/123456
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return undefined;
};

const initialState: DownloadState = {
  isDownloading: false,
  progress: 0,
  downloadStatus: '',
  totalIllustrations: 0,
  totalImages: 0,
  currentImage: 0,
  currentFileName: '',
  downloadId: null,
  url: '',
  userId: '',
  startTime: 0,
};

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

interface DownloadProviderProps {
  children: ReactNode;
}

export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children }) => {
  const [downloadState, setDownloadState] = useState<DownloadState>(initialState);
  const [cachedDownload, setCachedDownload] = useState<CachedDownload | null>(null);
  const { toast } = useToast();
  const downloadAbortController = useRef<AbortController | null>(null);
  const isDownloadingRef = useRef(false);
  const isPageVisible = usePageVisibility();

  // Load cached download on mount
  useEffect(() => {
    const loadCachedDownload = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: CachedDownload = JSON.parse(cached);
          const now = Date.now();
          
          // Check if cache is not expired and download was in progress
          if (parsedCache.state.startTime && (now - parsedCache.state.startTime) < CACHE_EXPIRY) {
            if (parsedCache.state.isDownloading) {
              // Resume download
              setCachedDownload(parsedCache);
              setDownloadState({
                ...parsedCache.state,
                isDownloading: false, // Will be set to true when resumed
                downloadStatus: 'Download interrupted - click to resume',
              });
            }
          } else {
            // Clear expired cache
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load cached download:', error);
        localStorage.removeItem(CACHE_KEY);
      }
    };

    loadCachedDownload();
  }, []);

  // Save download state to cache
  const saveToCache = useCallback((state: DownloadState, artworks: Artwork[], currentArtworkIndex: number, currentImageIndex: number, resumeData: any) => {
    try {
      const cacheData: CachedDownload = {
        state,
        artworks,
        currentArtworkIndex,
        currentImageIndex,
        resumeData: resumeData || { downloadedImages: [], failedImages: [] },
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedDownload(cacheData);
    } catch (error) {
      console.error('Failed to save download cache:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCachedDownload(null);
  }, []);

  const updateDownloadState = useCallback((updates: Partial<DownloadState>) => {
    setDownloadState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save to cache if download is in progress
      if (newState.isDownloading && cachedDownload) {
        saveToCache(
          newState,
          cachedDownload.artworks,
          cachedDownload.currentArtworkIndex,
          cachedDownload.currentImageIndex,
          cachedDownload.resumeData
        );
      }
      
      return newState;
    });
  }, [cachedDownload, saveToCache]);

  const startDownload = useCallback(async (url: string, userId: string) => {
    if (isDownloadingRef.current) {
      toast({
        title: "Download in Progress",
        description: "Please wait for the current download to complete",
        variant: "destructive",
      });
      return;
    }

    isDownloadingRef.current = true;
    downloadAbortController.current = new AbortController();
    const downloadId = Date.now().toString();
    const startTime = Date.now();
    
    const newState: DownloadState = {
      isDownloading: true,
      progress: 0,
      downloadStatus: 'Starting download...',
      downloadId,
      totalIllustrations: 0,
      totalImages: 0,
      currentImage: 0,
      currentFileName: '',
      url,
      userId,
      startTime,
    };

    setDownloadState(newState);

    // Add initial download history entry
    const historyId = localStorageService.addDownloadHistory({
      url,
      status: 'processing',
      totalImages: 0,
      downloadedImages: 0,
      failedImages: 0,
      userId,
      pixivUserId: extractPixivUserId(url),
    });

    try {
      // Check backend health
      const health = await PixivAPI.checkHealth();
      
      if (!health.service_authenticated) {
        throw new Error('Backend not authenticated with content service. Please check server configuration.');
      }

      updateDownloadState({
        progress: 5,
        downloadStatus: 'Fetching artwork list...',
      });

      // Get download location from settings
      const downloadLocation = localStorage.getItem('downloadLocation') || 'Downloads';
      
      // Get artwork list
      const artworkList = await PixivAPI.getArtworkList(url, userId, downloadLocation);
      
      if (!artworkList.success || !artworkList.artworks || artworkList.artworks.length === 0) {
        throw new Error('No artworks found');
      }

      // Update state with found artworks
      const updatedState = {
        totalIllustrations: artworkList.totalArtworks,
        totalImages: artworkList.totalImages,
        progress: 10,
        downloadStatus: `Found ${artworkList.totalArtworks} illustrations with ${artworkList.totalImages} images`,
      };

      updateDownloadState(updatedState);

      // Update download history with total images
      localStorageService.updateDownloadHistory(historyId, {
        totalImages: artworkList.totalImages,
        artistName: artworkList.artworks[0]?.title || 'Pixiv Download',
        thumbnailUrl: artworkList.artworks[0]?.images[0] || undefined,
      });

      // Save initial cache
      saveToCache(
        { ...newState, ...updatedState },
        artworkList.artworks,
        0,
        0,
        { downloadedImages: [], failedImages: [] }
      );

      // Small delay to show the found message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Download images one by one with caching
      let downloadedCount = 0;
      const downloadedImages: string[] = [];
      const failedImages: string[] = [];

      for (let artworkIndex = 0; artworkIndex < artworkList.artworks.length; artworkIndex++) {
        const artwork = artworkList.artworks[artworkIndex];
        
        for (let imageIndex = 0; imageIndex < artwork.images.length; imageIndex++) {
          if (downloadAbortController.current?.signal.aborted) {
            throw new Error('Download cancelled');
          }

          const imageUrl = artwork.images[imageIndex];
          const filename = `${artwork.id}_${imageIndex + 1}.jpg`;
          
          try {
            // Update progress
            const progressPercent = Math.round((downloadedCount / artworkList.totalImages) * 90) + 10;
            const currentState = {
              progress: progressPercent,
              currentImage: downloadedCount,
              currentFileName: filename,
              downloadStatus: `Processing ${filename}`,
            };

            updateDownloadState(currentState);

            // Save progress to cache
            saveToCache(
              { ...newState, ...updatedState, ...currentState },
              artworkList.artworks,
              artworkIndex,
              imageIndex,
              { downloadedImages, failedImages }
            );

            // Download the image
            const blob = await PixivAPI.downloadImage(imageUrl, filename, downloadLocation);
            
            // Only use downloadFile for web browsers, mobile apps save directly to filesystem
            const isCapacitor = window.location.protocol === 'capacitor:' || 
                               window.location.protocol === 'ionic:' ||
                               (window as any).Capacitor;
            
            if (!isCapacitor) {
              PixivAPI.downloadFile(blob, filename);
            }
            
            downloadedImages.push(filename);
            downloadedCount++;

            // Small delay to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, 300));

          } catch (error) {
            console.error(`Failed to download ${filename}:`, error);
            failedImages.push(filename);
          }
        }
      }

      // Complete download
      const finalState = {
        progress: 100,
        currentImage: downloadedCount,
        downloadStatus: 'All downloads complete!',
        isDownloading: false,
      };

      updateDownloadState(finalState);

      // Update download history as completed
      localStorageService.updateDownloadHistory(historyId, {
        status: 'completed',
        downloadedImages: downloadedCount,
        failedImages: failedImages.length,
      });

      toast({
        title: "Success!",
        description: `Downloaded ${downloadedCount} images from ${artworkList.totalArtworks} illustrations`,
      });

      // Clear cache after successful completion
      setTimeout(() => {
        clearCache();
        setDownloadState(initialState);
        isDownloadingRef.current = false;
      }, 3000);

    } catch (error: any) {
      isDownloadingRef.current = false;
      
      if (error.message !== 'Download cancelled') {
        updateDownloadState({
          progress: 0,
          downloadStatus: 'Download failed',
          isDownloading: false,
        });

        // Update download history as failed
        if (historyId) {
          localStorageService.updateDownloadHistory(historyId, {
            status: 'failed',
            errorMessage: error.message || 'Download failed',
          });
        }

        toast({
          title: "Error",
          description: error.message || "Download failed",
          variant: "destructive",
        });

        // Keep cache for potential resume
        setTimeout(() => {
          if (!cachedDownload) {
            setDownloadState(initialState);
          }
        }, 5000);
      } else {
        // Update download history as cancelled
        if (historyId) {
          localStorageService.updateDownloadHistory(historyId, {
            status: 'cancelled',
          });
        }
      }
    }
  }, [toast, updateDownloadState, saveToCache, clearCache, cachedDownload]);

  const resumeDownload = useCallback(async () => {
    if (!cachedDownload) {
      toast({
        title: "No Download to Resume",
        description: "No interrupted download found",
        variant: "destructive",
      });
      return;
    }

    await startDownload(cachedDownload.state.url, cachedDownload.state.userId);
  }, [cachedDownload, startDownload, toast]);

  const cancelDownload = useCallback(() => {
    if (downloadAbortController.current) {
      downloadAbortController.current.abort();
    }

    isDownloadingRef.current = false;
    
    updateDownloadState({
      isDownloading: false,
      progress: 0,
      downloadStatus: 'Download cancelled',
    });

    toast({
      title: "Download Cancelled",
      description: "The download has been stopped",
    });

    // Clear cache and reset after delay
    setTimeout(() => {
      clearCache();
      setDownloadState(initialState);
    }, 2000);
  }, [updateDownloadState, toast, clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (downloadAbortController.current) {
        downloadAbortController.current.abort();
      }
    };
  }, []);

  const contextValue: DownloadContextType = {
    downloadState,
    startDownload,
    cancelDownload,
    resumeDownload,
  };

  return (
    <DownloadContext.Provider value={contextValue}>
      {children}
    </DownloadContext.Provider>
  );
};