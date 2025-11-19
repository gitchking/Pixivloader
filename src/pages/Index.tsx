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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pixivUrl, setPixivUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    downloading: boolean;
  }>({ current: 0, total: 0, downloading: false });
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

      // Call backend API to get image URLs
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
        throw new Error('Failed to fetch images');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images');
      }

      // Update history with success
      await supabase
        .from("download_history")
        .update({
          status: "completed",
          items_count: result.images
        })
        .eq("id", historyData.id);

      // Start download progress
      setDownloadProgress({
        current: 0,
        total: result.images,
        downloading: true
      });

      toast({
        title: "Starting Downloads",
        description: `Downloading ${result.images} images... Check your Downloads folder.`,
      });

      let downloaded = 0;
      let failed = 0;

      // Download each image through backend proxy
      for (let i = 0; i < result.imageUrls.length; i++) {
        try {
          const imageUrl = result.imageUrls[i];
          const filename = imageUrl.split('/').pop() || `image_${i}.jpg`;
          
          // Request image through backend proxy
          const proxyResponse = await fetch(`${API_URL}/api/download/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl })
          });

          if (proxyResponse.ok) {
            const blob = await proxyResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            downloaded++;
          } else {
            failed++;
          }

          // Update progress
          setDownloadProgress({
            current: i + 1,
            total: result.images,
            downloading: true
          });

          // Small delay between downloads to avoid overwhelming browser
          if (i < result.imageUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (err) {
          console.error('Failed to download image:', err);
          failed++;
        }
      }

      // Reset progress
      setDownloadProgress({
        current: 0,
        total: 0,
        downloading: false
      });

      toast({
        title: "Download Complete",
        description: `Downloaded ${downloaded} of ${result.images} images. ${failed > 0 ? `${failed} failed.` : ''}`,
      });

      // Clear the input
      setPixivUrl("");

    } catch (error: any) {
      // Reset progress on error
      setDownloadProgress({
        current: 0,
        total: 0,
        downloading: false
      });

      toast({
        title: "Error",
        description: error.message || "Failed to start download",
        variant: "destructive",
      });
      
      // Update history with failure if it exists
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-4 max-w-6xl">
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
              <Button type="submit" className="w-full h-12 text-base" disabled={loading || downloadProgress.downloading}>
                {loading ? "Processing..." : downloadProgress.downloading ? "Downloading..." : "Start Archive"}
              </Button>
            </form>

            {/* Download Progress Bar */}
            {downloadProgress.downloading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Downloading images...</span>
                  <span className="font-medium">
                    {downloadProgress.current} / {downloadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                    style={{
                      width: `${(downloadProgress.current / downloadProgress.total) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((downloadProgress.current / downloadProgress.total) * 100)}% complete
                </p>
              </div>
            )}
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
    </div>
  );
};

export default Index;
