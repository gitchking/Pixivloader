import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/services/local-storage";

interface PixivAuthProps {
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

export const PixivLogin: React.FC<PixivAuthProps> = ({ onSuccess, onCancel }) => {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your Pixiv session ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate session format (basic check)
      if (!sessionId.includes('_') || sessionId.length < 20) {
        throw new Error('Invalid session ID format');
      }

      // Save session to local storage
      const settings = localStorageService.getAppSettings();
      localStorageService.updateAppSettings({ ...settings, pixivSessionId: sessionId });

      toast({
        title: "Authentication Successful!",
        description: "Pixiv session has been configured",
      });

      onSuccess(sessionId);
    } catch (error) {
      console.error('Pixiv auth error:', error);
      
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Invalid session ID",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Pixiv Authentication
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your Pixiv session ID to enable downloads
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pixiv Session ID
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <textarea
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Paste your Pixiv session ID here..."
              className="w-full h-24 pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#16161d] border border-gray-300 dark:border-gray-800/50 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 resize-none text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-2">How to get your session ID:</p>
              <ol className="space-y-1 text-xs">
                <li>1. Login to Pixiv in your browser</li>
                <li>2. Press F12 to open Developer Tools</li>
                <li>3. Go to Application → Cookies → pixiv.net</li>
                <li>4. Find PHPSESSID and copy its value</li>
                <li>5. Paste the value in the field above</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-[#0096fa] hover:bg-[#0084d6] text-white"
            disabled={loading || !sessionId.trim()}
          >
            {loading ? "Saving..." : "Save Session"}
          </Button>
        </div>
      </form>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium mb-1">Privacy Notice:</p>
            <ul className="space-y-1 text-xs">
              <li>• Session is stored locally on your device</li>
              <li>• We don't store your username or password</li>
              <li>• You can remove the session anytime</li>
              <li>• Session expires automatically after some time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};