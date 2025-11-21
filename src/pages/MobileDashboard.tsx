import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { Search, MoreVertical, FileText, Image as ImageIcon, Film, Music, Archive } from "lucide-react";
import { localStorageService, type DownloadHistoryItem } from "@/services/local-storage";
import type { User } from "@supabase/supabase-js";

const MobileDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchHistory();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchHistory();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchHistory = () => {
    setLoading(true);
    try {
      const localHistory = localStorageService.getDownloadHistory();
      setHistory(localHistory);
    } catch (error) {
      console.error('Failed to load download history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatSize = (totalImages?: number, downloadedImages?: number) => {
    const count = downloadedImages || totalImages || 0;
    if (!count) return "0 MB";
    const size = count * 2.5; // Approximate 2.5MB per image
    if (size < 1024) return `${size.toFixed(1)} MB`;
    return `${(size / 1024).toFixed(1)} GB`;
  };

  const getFileIcon = (url: string) => {
    if (url.includes("zip")) return Archive;
    if (url.includes("jpg") || url.includes("png")) return ImageIcon;
    if (url.includes("mp4")) return Film;
    if (url.includes("mp3")) return Music;
    return FileText;
  };

  const groupByDate = (items: DownloadHistoryItem[]) => {
    const groups: { [key: string]: DownloadHistoryItem[] } = {};
    items.forEach((item) => {
      const date = formatDate(item.startTime);
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  // Filter history based on search query
  const filteredHistory = history.filter(item => 
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.pixivUserId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  const groupedHistory = groupByDate(filteredHistory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] pb-24">
      <MobileNav user={user} />
      
      {/* Header */}
      <div className="pt-20 px-4 pb-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center text-[#0096fa]">Downloads</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0096fa]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search downloads..."
            className="w-full h-12 pl-12 pr-4 bg-gray-100 dark:bg-[#0d0d12] border border-gray-300 dark:border-gray-900/50 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#0096fa]/50 transition-colors"
          />
        </div>
      </div>

      {/* History List */}
      <div className="px-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#0096fa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-500">
              {searchQuery ? "No downloads match your search" : "No download history yet"}
            </p>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-600 mb-3 px-2">{date}</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const Icon = getFileIcon(item.url);
                  const fileName = item.artistName ? `${item.artistName} - ${item.pixivUserId || 'Pixiv'}` : item.url.split("/").pop() || "Pixiv_Archive.zip";
                  const statusColor = item.status === 'completed' ? 'text-green-500' : 
                                    item.status === 'failed' ? 'text-red-500' : 
                                    item.status === 'processing' ? 'text-blue-500' : 'text-gray-500';
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-[#12121a] transition-colors shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0096fa]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#0096fa]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white font-medium truncate mb-1">
                            {fileName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-500">
                            {formatSize(item.totalImages, item.downloadedImages)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium capitalize ${statusColor}`}>
                              {item.status}
                            </span>
                            {item.status === 'completed' && (
                              <span className="text-xs text-gray-500">
                                {item.downloadedImages}/{item.totalImages} images
                              </span>
                            )}
                            {item.status === 'failed' && item.errorMessage && (
                              <span className="text-xs text-red-500 truncate">
                                {item.errorMessage}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors flex-shrink-0">
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileDashboard;
