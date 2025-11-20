import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, Download, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface HistoryItem {
  id: string;
  url: string;
  status: "completed" | "failed" | "processing";
  created_at: string;
  items_count?: number;
  user_id: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchHistory(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchHistory(session.user.id);
      }
    });

    // Load banner ads
    setTimeout(() => {
      // Top Banner - 728x90
      const topBannerConfig = document.createElement('script');
      topBannerConfig.type = 'text/javascript';
      topBannerConfig.innerHTML = `
        atOptions = {
          'key' : '70129e41ceb4014399e54925f3e5ce74',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const topBannerInvoke = document.createElement('script');
      topBannerInvoke.type = 'text/javascript';
      topBannerInvoke.src = '//www.highperformanceformat.com/70129e41ceb4014399e54925f3e5ce74/invoke.js';
      
      const topBannerContainer = document.getElementById('history-top-banner-728x90');
      if (topBannerContainer) {
        topBannerContainer.appendChild(topBannerConfig);
        topBannerContainer.appendChild(topBannerInvoke);
      }

      // Middle Banner - 300x250
      const middleBannerConfig = document.createElement('script');
      middleBannerConfig.type = 'text/javascript';
      middleBannerConfig.innerHTML = `
        atOptions = {
          'key' : 'e88d7bd16a35340865176e4cc0c74b83',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      
      const middleBannerInvoke = document.createElement('script');
      middleBannerInvoke.type = 'text/javascript';
      middleBannerInvoke.src = '//www.highperformanceformat.com/e88d7bd16a35340865176e4cc0c74b83/invoke.js';
      
      const middleBannerContainer = document.getElementById('history-middle-banner-300x250');
      if (middleBannerContainer) {
        middleBannerContainer.appendChild(middleBannerConfig);
        middleBannerContainer.appendChild(middleBannerInvoke);
      }

      // Bottom Banner - 468x60
      const bottomBannerConfig = document.createElement('script');
      bottomBannerConfig.type = 'text/javascript';
      bottomBannerConfig.innerHTML = `
        atOptions = {
          'key' : '5f6bdb1e7d7bd8bdabfb60ea769eeadd',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      
      const bottomBannerInvoke = document.createElement('script');
      bottomBannerInvoke.type = 'text/javascript';
      bottomBannerInvoke.src = '//www.highperformanceformat.com/5f6bdb1e7d7bd8bdabfb60ea769eeadd/invoke.js';
      
      const bottomBannerContainer = document.getElementById('history-bottom-banner-468x60');
      if (bottomBannerContainer) {
        bottomBannerContainer.appendChild(bottomBannerConfig);
        bottomBannerContainer.appendChild(bottomBannerInvoke);
      }
    }, 100);

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchHistory = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("download_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "processing":
        return "Processing";
      default:
        return status;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleClearHistory = async () => {
    if (!user) return;
    
    setClearing(true);
    try {
      const { error } = await supabase
        .from("download_history")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setHistory([]);
      setShowClearDialog(false);
      
      toast({
        title: "History Cleared",
        description: "All download history has been deleted.",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center">
        <div className="relative w-12 h-12">
          <svg className="animate-spin" viewBox="0 0 50 50">
            <circle
              className="stroke-primary"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80, 200"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-4 max-w-6xl">
        {/* Top Banner - 728x90 */}
        <div className="flex justify-center mb-4">
          <div id="history-top-banner-728x90"></div>
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold">Download History</h1>
          <p className="text-muted-foreground text-base">{user.email}</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Archive History</CardTitle>
                  <CardDescription className="text-base">
                    Track all your download tasks and their status
                  </CardDescription>
                </div>
              </div>
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowClearDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-base">No download history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                        <Download className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium truncate">{item.url}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.status === "completed" && item.items_count && (
                        <span className="text-sm text-muted-foreground">
                          {item.items_count} items
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium min-w-[90px]">
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle Banner - 300x250 */}
        <div className="flex justify-center my-6">
          <div id="history-middle-banner-300x250"></div>
        </div>

        {/* Bottom Banner - 468x60 */}
        <div className="flex justify-center mt-6 mb-4">
          <div id="history-bottom-banner-468x60"></div>
        </div>

        {/* Clear History Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Download History?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your download history records. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                disabled={clearing}
                className="bg-red-600 hover:bg-red-700"
              >
                {clearing ? "Clearing..." : "Clear History"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;
