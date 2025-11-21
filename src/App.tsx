import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DownloadProvider } from "@/contexts/DownloadContext";
import GlobalDownloadStatus from "@/components/GlobalDownloadStatus";
import NetworkStatus from "@/components/NetworkStatus";
import ErrorBoundary from "@/components/ErrorBoundary";

// Mobile-only pages
import MobileIndex from "./pages/MobileIndex";
import Auth from "./pages/Auth";
import MobileDashboard from "./pages/MobileDashboard";
import MobileSettings from "./pages/MobileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <DownloadProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MobileIndex />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<MobileDashboard />} />
                  <Route path="/settings" element={<MobileSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ErrorBoundary>
                  <GlobalDownloadStatus />
                </ErrorBoundary>
                <ErrorBoundary>
                  <NetworkStatus />
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </DownloadProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
