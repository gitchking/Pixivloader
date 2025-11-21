import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for better download persistence
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Prevent hot reload during downloads
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Check if download is in progress
    const downloadInProgress = localStorage.getItem('pixivloader_download_cache');
    if (downloadInProgress) {
      console.log('Download in progress, skipping hot reload');
      return;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
