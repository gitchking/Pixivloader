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
      // Don't redirect - allow viewing the page
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load JuicyAds
  useEffect(() => {
    // Load 300x250 ad
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.async = true;
    script1.setAttribute('data-cfasync', 'false');
    script1.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1105482});`;
    
    const adContainer = document.getElementById('juicy-ad-container');
    if (adContainer) {
      adContainer.appendChild(script1);
    }

    // Load 468x60 banner
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.async = true;
    script2.setAttribute('data-cfasync', 'false');
    script2.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1105483});`;
    
    const bannerContainer = document.getElementById('juicy-ad-banner');
    if (bannerContainer) {
      bannerContainer.appendChild(script2);
    }

    // Load 728x90 hero banner
    const heroConfig = document.createElement('script');
    heroConfig.type = 'text/javascript';
    heroConfig.innerHTML = `
      atOptions = {
        'key' : '70129e41ceb4014399e54925f3e5ce74',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    
    const heroInvoke = document.createElement('script');
    heroInvoke.type = 'text/javascript';
    heroInvoke.src = '//www.highperformanceformat.com/70129e41ceb4014399e54925f3e5ce74/invoke.js';
    
    const heroContainer = document.getElementById('hero-banner-728x90');
    if (heroContainer) {
      heroContainer.appendChild(heroConfig);
      heroContainer.appendChild(heroInvoke);
    }

    return () => {
      if (adContainer && script1.parentNode) {
        adContainer.removeChild(script1);
      }
      if (bannerContainer && script2.parentNode) {
        bannerContainer.removeChild(script2);
      }
      if (heroContainer) {
        if (heroConfig.parentNode) heroContainer.removeChild(heroConfig);
        if (heroInvoke.parentNode) heroContainer.removeChild(heroInvoke);
      }
    };
  }, []);



  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require authentication for download
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to download archives",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
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
      
      // Enhanced progress simulation with realistic stages
      setProgress(0);
      setDownloadStatus("Initializing...");
      
      const progressStages = [
        { progress: 10, message: "Connecting to Pixiv...", delay: 500 },
        { progress: 20, message: "Fetching artwork list...", delay: 1000 },
        { progress: 35, message: "Downloading images...", delay: 2000 },
        { progress: 60, message: "Processing images...", delay: 3000 },
        { progress: 80, message: "Creating archive...", delay: 1000 },
        { progress: 95, message: "Finalizing...", delay: 500 },
      ];
      
      let currentStage = 0;
      const progressInterval = setInterval(() => {
        if (currentStage < progressStages.length) {
          const stage = progressStages[currentStage];
          setProgress(stage.progress);
          setDownloadStatus(stage.message);
          currentStage++;
        }
      }, 800);

      toast({
        title: "Download Started",
        description: "Archiving Pixiv profile...",
      });

      const response = await fetch(`${API_URL}/download/start`, {
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

      // Stop progress simulation and complete
      clearInterval(progressInterval);
      setProgress(100);
      setDownloadStatus("Download complete!");

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-4 max-w-6xl flex-1">
        {/* Hero Banner - 728x90 */}
        <div className="flex justify-center mb-4">
          <div id="hero-banner-728x90"></div>
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold">Archive Manager</h1>
          <p className="text-muted-foreground text-base">
            {user ? user.email : "Login to start archiving"}
          </p>
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
                <div className="space-y-3 mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{downloadStatus}</span>
                    <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-md"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Please wait while we archive your content...</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sponsored Content Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Sponsored Content</CardTitle>
                <CardDescription className="text-base">
                  Support us by checking out our partners
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* JuicyAds 300x250 */}
            <div className="flex justify-center mb-4">
              <div id="juicy-ad-container">
                <ins id="1105482" data-width="300" data-height="250"></ins>
              </div>
            </div>
            
            {/* JuicyAds 468x60 Banner */}
            <div className="flex justify-center">
              <div id="juicy-ad-banner">
                <ins id="1105483" data-width="468" data-height="60"></ins>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
