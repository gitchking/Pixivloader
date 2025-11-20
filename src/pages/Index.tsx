import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Eye, Link, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import Footer from "@/components/Footer";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pixivUrl, setPixivUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);



  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // Extract user ID from URL for better naming
      const userIdMatch = pixivUrl.match(/users\/(\d+)/);
      const userId = userIdMatch ? userIdMatch[1] : 'unknown';

      // Save to Supabase download_history table
      const { data: historyData, error } = await supabase
        .from("download_history")
        .insert([
          {
            user_id: user.id,
            url: pixivUrl,
            status: "processing",
            items_count: 0
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Processing",
        description: "Downloading and packaging images...",
      });

      // Call backend API to download and create zip
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Start progress simulation
      setProgress(0);
      setDownloadStatus("Fetching image list...");
      
      // Simulate progress (since we can't get real-time progress from backend yet)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until real download completes
          return prev + Math.random() * 10;
        });
      }, 500);

      toast({
        title: "Downloading",
        description: "This may take 1-3 minutes depending on the number of images...",
      });

      setDownloadStatus("Downloading images...");
      const response = await fetch(`${API_URL}/api/download/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: pixivUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to download images';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Stop progress simulation
      clearInterval(progressInterval);
      setProgress(95);
      setDownloadStatus("Creating zip file...");

      // Get the zip file
      const blob = await response.blob();
      
      // Verify we got a zip file
      if (blob.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      setProgress(100);
      setDownloadStatus("Download complete!");
      
      const filename = `pixiv_user_${userId}.zip`;

      // Download the zip file
      downloadWithLink(blob, filename);
      
      toast({
        title: "Download Complete! 🎉",
        description: `${filename} saved to your Downloads folder`,
      });

      // Update history with success
      await supabase
        .from("download_history")
        .update({
          status: "completed",
          items_count: 1 // 1 zip file
        })
        .eq("id", historyData.id);

      // Clear the input and reset progress
      setPixivUrl("");
      setTimeout(() => {
        setProgress(0);
        setDownloadStatus("");
      }, 2000);

    } catch (error: any) {
      setProgress(0);
      setDownloadStatus("");
      
      toast({
        title: "Error",
        description: error.message || "Failed to download",
        variant: "destructive",
      });
      
      // Update history with failure
      try {
        await supabase
          .from("download_history")
          .update({ status: "failed" })
          .eq("user_id", user.id)
          .eq("url", pixivUrl);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Helper function for default download
  function downloadWithLink(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-4 max-w-6xl flex-1">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Archive Manager</h1>
          <p className="text-muted-foreground text-base">{user.email}</p>
        </div>

        {/* Archive Section */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Archive className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Archive Pixiv Profile</CardTitle>
                <CardDescription className="text-base">
                  Enter a Pixiv artist profile URL to archive their entire portfolio
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDownload} className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="pixiv-url" className="text-base">Pixiv Profile URL</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="pixiv-url"
                    type="url"
                    placeholder="https://www.pixiv.net/en/users/..."
                    value={pixivUrl}
                    onChange={(e) => setPixivUrl(e.target.value)}
                    required
                    className="h-12 text-lg placeholder:text-lg pl-11"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? "Processing..." : "Start Archive"}
              </Button>
              
              {loading && progress > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{downloadStatus}</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Preview</CardTitle>
                <CardDescription className="text-base">
                  Your archived content will appear here
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-lg">
              <ImageOff className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-base">No content to preview yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
