import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { embeddedBackend } from "@/services/embedded-backend";
import { Key, Info } from "lucide-react";

interface PixivSessionSetupProps {
  onSessionSet: () => void;
}

const PixivSessionSetup = ({ onSessionSet }: PixivSessionSetupProps) => {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId.trim()) {
      toast({
        title: "Session ID Required",
        description: "Please enter your Pixiv PHPSESSID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await embeddedBackend.setSession(sessionId.trim());
      
      toast({
        title: "Session Set Successfully",
        description: "You can now download from Pixiv",
      });
      
      onSessionSet();
    } catch (error) {
      toast({
        title: "Failed to Set Session",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">Setup Pixiv Session</CardTitle>
          <CardDescription>
            Enter your Pixiv session ID to enable downloads in offline mode
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSetSession} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-id">PHPSESSID</Label>
              <Input
                id="session-id"
                type="text"
                placeholder="Enter your Pixiv PHPSESSID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !sessionId.trim()}
            >
              {loading ? "Setting up..." : "Set Session"}
            </Button>
          </form>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How to get your PHPSESSID:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Open Pixiv in your browser</li>
                  <li>Login to your account</li>
                  <li>Open Developer Tools (F12)</li>
                  <li>Go to Application → Cookies → pixiv.net</li>
                  <li>Copy the PHPSESSID value</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixivSessionSetup;