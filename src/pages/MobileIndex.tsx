import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Download as DownloadIcon } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { PixivAPI } from "@/services/api";
import { localStorageService } from "@/services/local-storage";
import type { User } from "@supabase/supabase-js";

const MobileIndex = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pixivUrl, setPixivUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [totalIllustrations, setTotalIllustrations] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [historyId, setHistoryId] = useState<string>("");
  const { toast } = useToast();

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to start downloading",
        variant: "destructive",
      });
      return;
    }

    if (!pixivUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid Pixiv URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setDownloadStatus("Connecting to backend...");

    // Add initial download history entry
    const newHistoryId = localStorageService.addDownloadHistory({
      url: pixivUrl,
      status: 'processing',
      totalImages: 0,
      downloadedImages: 0,
      failedImages: 0,
      userId: user.id,
      pixivUserId: extractPixivUserId(pixivUrl),
    });
    setHistoryId(newHistoryId);

    try {
      // Check backend health
      const health = await PixivAPI.checkHealth();
      
      if (!health.service_authenticated) {
        toast({
          title: "Backend Not Ready",
          description: "Content service authentication required on backend",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setDownloadStatus("Starting download...");
      setProgress(10);

      // Get artwork list first
      setDownloadStatus("Fetching artwork list...");
      setProgress(5);
      
      // Get download location from settings
      const downloadLocation = localStorage.getItem('downloadLocation') || 'Downloads';
      
      const artworkList = await PixivAPI.getArtworkList(pixivUrl, user.id, downloadLocation);
      
      if (!artworkList.success || !artworkList.artworks || artworkList.artworks.length === 0) {
        throw new Error('No artworks found');
      }

      // Set totals for progress tracking
      setTotalIllustrations(artworkList.totalArtworks);
      setTotalImages(artworkList.totalImages);
      setCurrentImage(0);
      setProgress(10);
      setDownloadStatus(`Found ${artworkList.totalArtworks} illustrations with ${artworkList.totalImages} images`);

      // Update download history with found artworks
      localStorageService.updateDownloadHistory(newHistoryId, {
        totalImages: artworkList.totalImages,
        artistName: artworkList.artworks[0]?.title || 'Pixiv Download',
        thumbnailUrl: artworkList.artworks[0]?.images[0] || undefined,
      });

      // Small delay to show the found message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Download images one by one
      await PixivAPI.downloadMultipleImages(
        artworkList.artworks,
        (downloaded, total, currentFile) => {
          const progressPercent = Math.round((downloaded / total) * 90) + 10; // 10-100%
          setProgress(progressPercent);
          setCurrentImage(downloaded);
          setCurrentFileName(currentFile);
          setDownloadStatus(`Processing ${currentFile}`);
          
          // Update download history progress
          localStorageService.updateDownloadHistory(newHistoryId, {
            downloadedImages: downloaded,
          });
        },
        downloadLocation
      );

      setProgress(100);
      setCurrentImage(artworkList.totalImages);
      setDownloadStatus("All downloads complete!");
      setLoading(false);

      // Update download history as completed
      localStorageService.updateDownloadHistory(newHistoryId, {
        status: 'completed',
        downloadedImages: artworkList.totalImages,
      });
      
      toast({
        title: "Success!",
        description: `Downloaded ${artworkList.totalImages} images from ${artworkList.totalArtworks} illustrations`,
      });

    } catch (error) {
      console.error('Download error:', error);
      setLoading(false);
      setProgress(0);
      setDownloadStatus("");

      // Update download history as failed
      if (newHistoryId) {
        localStorageService.updateDownloadHistory(newHistoryId, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Download failed',
        });
      }
      
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Removed old progress checking - now using one-by-one downloads

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] pb-24">
      <MobileNav user={user} />
      
      {/* Main Content */}
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0096fa] mb-2">Pixiv Downloader</h1>
            <p className="text-gray-600 dark:text-gray-500">Paste your Pixiv URL to start</p>
          </div>

          {/* Download Form */}
          <div className="bg-white dark:bg-[#0d0d12] rounded-3xl p-6 space-y-4 border border-gray-200 dark:border-gray-900/50 shadow-sm">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Link2 className="w-5 h-5 text-blue-400" />
              </div>
              <Input
                type="url"
                placeholder="Paste your download link here"
                value={pixivUrl}
                onChange={(e) => setPixivUrl(e.target.value)}
                className="h-14 pl-12 bg-gray-100 dark:bg-[#16161d] border-gray-300 dark:border-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 rounded-2xl focus:border-[#0096fa]/50 transition-colors"
              />
            </div>

            <Button
              onClick={handleDownload}
              disabled={loading || !pixivUrl}
              className="w-full h-14 bg-[#0096fa] hover:bg-[#0084d6] text-white font-semibold rounded-2xl text-lg"
            >
              {loading ? "Downloading..." : "Download"}
            </Button>
          </div>

          {/* Ongoing Downloads */}
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Processing</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  Stay on the page
                </span>
              </div>
              
              <div className="bg-white dark:bg-[#0d0d12] rounded-3xl p-6 border border-gray-200 dark:border-gray-900/50 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <DownloadIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-medium truncate mb-1">
                      {totalIllustrations > 0 ? `${totalIllustrations} Illustrations` : 'Pixiv Download'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-500">{downloadStatus}</p>
                    {currentFileName && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Current: {currentFileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-500">
                      {totalImages > 0 ? `${currentImage} / ${totalImages} images` : 'Processing...'}
                    </span>
                    <span className="text-[#0096fa] font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0096fa] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {/* Stats section removed - replaced with detailed progress above */}
        </div>
      </div>
    </div>
  );
};

export default MobileIndex;
