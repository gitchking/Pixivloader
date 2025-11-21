import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { ChevronRight, Wifi, FolderDown, Bell, BellOff, AlertCircle, User as UserIcon, Trash2, Moon, Sun, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { localStorageService } from "@/services/local-storage";
import type { User as UserType } from "@supabase/supabase-js";

const MobileSettings = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [quality, setQuality] = useState("original");
  const [wifiOnly, setWifiOnly] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [onComplete, setOnComplete] = useState(true);
  const [onFailure, setOnFailure] = useState(false);
  const [downloadLocation, setDownloadLocation] = useState("Downloads");
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try {
      // Load saved settings from localStorage
      const settings = localStorageService.getAppSettings();
      setQuality(settings.downloadQuality);
      
      const savedWifiOnly = localStorage.getItem('wifiOnly');
      const savedNotifications = localStorage.getItem('notifications');
      const savedOnComplete = localStorage.getItem('onComplete');
      const savedOnFailure = localStorage.getItem('onFailure');
      const savedLocation = localStorage.getItem('downloadLocation');
      
      if (savedWifiOnly) setWifiOnly(savedWifiOnly === 'true');
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedOnComplete) setOnComplete(savedOnComplete === 'true');
      if (savedOnFailure) setOnFailure(savedOnFailure === 'true');
      if (savedLocation) setDownloadLocation(savedLocation);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    // Load user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    }).catch(error => {
      console.error('Failed to load session:', error);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    const settings = localStorageService.getAppSettings();
    localStorageService.updateAppSettings({ ...settings, downloadQuality: newQuality as any });
    setShowQualityModal(false);
    toast({
      title: "Quality Updated",
      description: `Download quality set to ${newQuality}`,
    });
  };

  const handleLocationSelect = async () => {
    try {
      // For mobile apps, we'll use the File System Access API or Capacitor
      if ('showDirectoryPicker' in window) {
        // Web File System Access API (for PWA)
        const dirHandle = await (window as any).showDirectoryPicker();
        const newLocation = dirHandle.name;
        setDownloadLocation(newLocation);
        localStorage.setItem('downloadLocation', newLocation);
        localStorage.setItem('downloadLocationHandle', JSON.stringify(dirHandle));
        setShowLocationModal(false);
        toast({
          title: "Location Updated",
          description: `Downloads will be saved to ${newLocation}`,
        });
      } else {
        // Fallback for mobile - show predefined options
        setShowLocationModal(true);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to select download location",
          variant: "destructive",
        });
      }
    }
  };

  const handlePredefinedLocation = (location: string) => {
    setDownloadLocation(location);
    localStorage.setItem('downloadLocation', location);
    setShowLocationModal(false);
    toast({
      title: "Location Updated",
      description: `Downloads will be saved to ${location}`,
    });
  };

  const handleToggle = (setting: string, value: boolean) => {
    localStorage.setItem(setting, value.toString());
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };



  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };



  if (!user) return null;

  try {
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] pb-24">
      <MobileNav user={user} />
      
      {/* Header */}
      <div className="pt-20 px-4 pb-6">
        <h1 className="text-3xl font-bold text-center text-[#0096fa]">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="px-4 space-y-6">
        {/* Download Settings */}
        <div>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
            DOWNLOAD
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setShowQualityModal(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FolderDown className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 dark:text-white font-medium">Download Quality</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-500 text-sm capitalize">{quality}</span>
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-500" />
              </div>
            </button>

            <div className="h-px bg-gray-200 dark:bg-gray-900/50 mx-4" />

            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">Download only over Wi-Fi</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !wifiOnly;
                  setWifiOnly(newValue);
                  handleToggle('wifiOnly', newValue);
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  wifiOnly ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    wifiOnly ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-900/50 mx-4" />

            <button 
              onClick={handleLocationSelect}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Folder className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 dark:text-white font-medium">Download Location</p>
                <p className="text-sm text-gray-600 dark:text-gray-500">{downloadLocation}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
            NOTIFICATIONS
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">Enable Notifications</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !notifications;
                  setNotifications(newValue);
                  handleToggle('notifications', newValue);
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notifications ? "bg-green-500" : "bg-gray-300 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-900/50 mx-4" />

            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <BellOff className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">On Download Completion</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !onComplete;
                  setOnComplete(newValue);
                  handleToggle('onComplete', newValue);
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  onComplete ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    onComplete ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-900/50 mx-4" />

            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">On Download Failure</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !onFailure;
                  setOnFailure(newValue);
                  handleToggle('onFailure', newValue);
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  onFailure ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    onFailure ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            ACCOUNT
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-semibold truncate">{user.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            APPEARANCE
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">Dark Mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  theme === 'dark' ? "bg-[#0096fa]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    theme === 'dark' ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>



        {/* Service Status */}
        <div>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            DOWNLOAD SERVICE
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 dark:text-white font-semibold">Content Service</p>
                <p className="text-sm text-green-600 dark:text-green-400">Ready for downloads</p>
              </div>
              <div className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* General */}
        <div>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            GENERAL
          </h2>
          <div className="bg-white dark:bg-[#0d0d12] border border-gray-200 dark:border-gray-900/50 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => {
                // Save auth-related keys before clearing
                const authKeys = Object.keys(localStorage).filter(key => 
                  key.startsWith('sb-') || key.includes('supabase') || key.includes('pixiv')
                );
                const authData: Record<string, string> = {};
                authKeys.forEach(key => {
                  const value = localStorage.getItem(key);
                  if (value) authData[key] = value;
                });

                // Clear all localStorage
                localStorage.clear();

                // Restore auth data
                Object.entries(authData).forEach(([key, value]) => {
                  localStorage.setItem(key, value);
                });

                toast({
                  title: "Cache Cleared",
                  description: "App cache cleared, authentication preserved",
                });
              }}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 dark:text-white font-semibold">Clear Cache</p>
              </div>
              <span className="text-gray-600 dark:text-gray-500 text-sm font-medium">Clear</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full h-14 bg-[#0096fa] hover:bg-[#0084d6] text-white font-semibold rounded-2xl"
        >
          Log Out
        </Button>
      </div>

      {/* Quality Selection Modal */}
      {showQualityModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setShowQualityModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0d0d12] border-t border-gray-200 dark:border-gray-900/50 rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Download Quality</h3>
            <div className="space-y-2">
              {[
                { value: 'original', label: 'Original', desc: 'Highest Quality' },
                { value: 'high', label: 'High Quality', desc: 'Recommended' },
                { value: 'medium', label: 'Medium Quality', desc: 'Balanced' },
                { value: 'low', label: 'Low Quality', desc: 'Faster Downloads' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQualityChange(option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
                    quality === option.value
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm opacity-70">{option.desc}</p>
                  </div>
                  {quality === option.value && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}





      {/* Download Location Modal */}
      {showLocationModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setShowLocationModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0d0d12] border-t border-gray-200 dark:border-gray-900/50 rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Download Location</h3>
            
            <div className="space-y-2 mb-6">
              {[
                { value: 'Downloads', label: 'Downloads', desc: 'Default downloads folder' },
                { value: 'Pictures/Pixiv', label: 'Pictures/Pixiv', desc: 'Pictures folder' },
                { value: 'Documents/Pixiv', label: 'Documents/Pixiv', desc: 'Documents folder' },
                { value: 'DCIM/Pixiv', label: 'DCIM/Pixiv', desc: 'Camera folder (mobile)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePredefinedLocation(option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
                    downloadLocation === option.value
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm opacity-70">{option.desc}</p>
                    </div>
                  </div>
                  {downloadLocation === option.value && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Note:</strong> In mobile apps, files are saved to the app's private storage. 
                Use the share function to save files to your device's public folders.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
    );
  } catch (error) {
    console.error('MobileSettings render error:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050508] flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Settings Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load settings page</p>
          <Button onClick={() => window.location.reload()} className="bg-[#0096fa] text-white">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
};

export default MobileSettings;
