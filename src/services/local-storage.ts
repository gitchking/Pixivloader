// Local storage service for download history and app data

export interface DownloadHistoryItem {
  id: string;
  url: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  totalImages: number;
  downloadedImages: number;
  failedImages: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  userId: string;
  pixivUserId?: string;
  artistName?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  downloadQuality: 'original' | 'large' | 'medium';
  maxConcurrentDownloads: number;
  autoDeleteAfterDays: number;
  pixivSessionId?: string;
}

class LocalStorageService {
  private readonly HISTORY_KEY = 'pixivloader_download_history';
  private readonly SETTINGS_KEY = 'pixivloader_settings';
  private readonly MAX_HISTORY_ITEMS = 1000;

  // Download History Methods
  getDownloadHistory(): DownloadHistoryItem[] {
    try {
      // For Android/Capacitor apps, ensure localStorage is properly initialized
      if ((window as any).Capacitor && (window as any).Capacitor.Plugins?.Preferences) {
        // Use Capacitor Preferences for better persistence on mobile
        return this.getDownloadHistoryCapacitor();
      }
      
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (!stored) return [];
      
      const history: DownloadHistoryItem[] = JSON.parse(stored);
      
      // Sort by start time (newest first)
      return history.sort((a, b) => b.startTime - a.startTime);
    } catch (error) {
      console.error('Failed to load download history:', error);
      return [];
    }
  }

  private async getDownloadHistoryCapacitor(): Promise<DownloadHistoryItem[]> {
    try {
      const { Preferences } = (window as any).Capacitor.Plugins;
      const result = await Preferences.get({ key: this.HISTORY_KEY });
      
      if (!result.value) return [];
      
      const history: DownloadHistoryItem[] = JSON.parse(result.value);
      return history.sort((a, b) => b.startTime - a.startTime);
    } catch (error) {
      console.error('Failed to load download history from Capacitor:', error);
      return [];
    }
  }

  addDownloadHistory(item: Omit<DownloadHistoryItem, 'id' | 'startTime'>): string {
    try {
      const history = this.getDownloadHistory();
      const newItem: DownloadHistoryItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        startTime: Date.now()
      };

      history.unshift(newItem);

      // Keep only the latest items
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }

      // Use Capacitor Preferences for Android if available
      if ((window as any).Capacitor && (window as any).Capacitor.Plugins?.Preferences) {
        this.saveDownloadHistoryCapacitor(history);
      } else {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
      
      return newItem.id;
    } catch (error) {
      console.error('Failed to add download history:', error);
      return '';
    }
  }

  private async saveDownloadHistoryCapacitor(history: DownloadHistoryItem[]): Promise<void> {
    try {
      const { Preferences } = (window as any).Capacitor.Plugins;
      await Preferences.set({
        key: this.HISTORY_KEY,
        value: JSON.stringify(history)
      });
    } catch (error) {
      console.error('Failed to save download history to Capacitor:', error);
      // Fallback to localStorage
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    }
  }

  updateDownloadHistory(id: string, updates: Partial<DownloadHistoryItem>): void {
    try {
      const history = this.getDownloadHistory();
      const index = history.findIndex(item => item.id === id);
      
      if (index !== -1) {
        history[index] = { ...history[index], ...updates };
        
        // Calculate duration if completed
        if (updates.status === 'completed' || updates.status === 'failed') {
          history[index].endTime = Date.now();
          history[index].duration = history[index].endTime - history[index].startTime;
        }
        
        // Use Capacitor Preferences for Android if available
        if ((window as any).Capacitor && (window as any).Capacitor.Plugins?.Preferences) {
          this.saveDownloadHistoryCapacitor(history);
        } else {
          localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        }
      }
    } catch (error) {
      console.error('Failed to update download history:', error);
    }
  }

  deleteDownloadHistory(id: string): void {
    try {
      const history = this.getDownloadHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete download history:', error);
    }
  }

  clearDownloadHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear download history:', error);
    }
  }

  // Statistics Methods
  getDownloadStats() {
    const history = this.getDownloadHistory();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    return {
      total: history.length,
      completed: history.filter(h => h.status === 'completed').length,
      failed: history.filter(h => h.status === 'failed').length,
      totalImages: history.reduce((sum, h) => sum + (h.downloadedImages || 0), 0),
      today: history.filter(h => (now - h.startTime) < oneDay).length,
      thisWeek: history.filter(h => (now - h.startTime) < oneWeek).length,
      thisMonth: history.filter(h => (now - h.startTime) < oneMonth).length,
      averageDuration: this.calculateAverageDuration(history),
      topArtists: this.getTopArtists(history)
    };
  }

  private calculateAverageDuration(history: DownloadHistoryItem[]): number {
    const completed = history.filter(h => h.status === 'completed' && h.duration);
    if (completed.length === 0) return 0;
    
    const totalDuration = completed.reduce((sum, h) => sum + (h.duration || 0), 0);
    return Math.round(totalDuration / completed.length);
  }

  private getTopArtists(history: DownloadHistoryItem[]): Array<{artist: string, downloads: number}> {
    const artistCounts: Record<string, number> = {};
    
    history.forEach(h => {
      if (h.artistName) {
        artistCounts[h.artistName] = (artistCounts[h.artistName] || 0) + 1;
      }
    });

    return Object.entries(artistCounts)
      .map(([artist, downloads]) => ({ artist, downloads }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5);
  }

  // Settings Methods
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (!stored) return this.getDefaultSettings();
      
      return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  updateSettings(updates: Partial<AppSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...updates };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'dark',
      downloadQuality: 'original',
      maxConcurrentDownloads: 3,
      autoDeleteAfterDays: 30
    };
  }

  // Cleanup Methods
  cleanupOldHistory(days: number = 30): number {
    try {
      const history = this.getDownloadHistory();
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      const filtered = history.filter(item => item.startTime > cutoff);
      
      const deletedCount = history.length - filtered.length;
      if (deletedCount > 0) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old history:', error);
      return 0;
    }
  }

  // App Settings Methods (alias for backward compatibility)
  getAppSettings(): AppSettings {
    return this.getSettings();
  }

  updateAppSettings(updates: Partial<AppSettings>): void {
    this.updateSettings(updates);
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();