import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@supabase/supabase-js";

const Settings = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [quality, setQuality] = useState("original");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('downloadQuality', quality);
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const savedQuality = localStorage.getItem('downloadQuality');
    
    if (savedQuality) {
      setQuality(savedQuality);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    // Load 728x90 banner ad
    setTimeout(() => {
      const bannerConfig = document.createElement('script');
      bannerConfig.type = 'text/javascript';
      bannerConfig.innerHTML = `
        atOptions = {
          'key' : '70129e41ceb4014399e54925f3e5ce74',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const bannerInvoke = document.createElement('script');
      bannerInvoke.type = 'text/javascript';
      bannerInvoke.src = '//www.highperformanceformat.com/70129e41ceb4014399e54925f3e5ce74/invoke.js';
      
      const bannerContainer = document.getElementById('settings-banner-728x90');
      if (bannerContainer) {
        bannerContainer.appendChild(bannerConfig);
        bannerContainer.appendChild(bannerInvoke);
      }
    }, 100);

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-4 max-w-6xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-base">{user.email}</p>
        </div>

        {/* Download Settings Section */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Download Settings</CardTitle>
                <CardDescription className="text-base">
                  Configure how your archives are processed
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="quality" className="text-base">
                  Image Quality
                </Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger id="quality" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">
                      Original (Highest Quality)
                    </SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">Low Quality (Faster)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the quality of images to download. Original quality provides the best results but larger file sizes.
                </p>
              </div>

              <Button 
                className="w-full h-12 text-base"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Account Information</CardTitle>
                <CardDescription className="text-base">
                  Your account details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] space-y-3 text-base">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">User ID:</span>
                <span className="text-sm break-all">{user.id}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Quality Setting:</span>
                <span className="capitalize">{quality}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Ad - 728x90 */}
        <div className="flex justify-center mt-6 mb-4">
          <div id="settings-banner-728x90"></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
