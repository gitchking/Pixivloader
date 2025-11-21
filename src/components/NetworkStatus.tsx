import { Wifi, WifiOff, Server } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useState, useEffect } from "react";
import { PixivAPI } from "@/services/api";

const NetworkStatus = () => {
  const { isOnline, connectionType } = useNetworkStatus();
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use the embedded backend health check
        const health = await PixivAPI.checkHealth();
        setBackendStatus(health.service_authenticated ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };

    // Always check backend status (embedded backend works offline too)
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isOnline]);

  if (isOnline && backendStatus === 'online') {
    return null; // Don't show when everything is working
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
        !isOnline 
          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          : 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
      }`}>
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline - Some features unavailable</span>
          </>
        ) : backendStatus === 'offline' ? (
          <>
            <Server className="w-4 h-4" />
            <span>Backend offline - Downloads unavailable</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connected ({connectionType})</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;