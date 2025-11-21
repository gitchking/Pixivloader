// Environment configuration for different build targets
export const config = {
  // Supabase (same for all environments)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // API URL based on environment
  api: {
    baseUrl: getApiUrl(),
  },
};

function getApiUrl(): string {
  // Check if we're in a mobile app (Capacitor)
  if (window.location.protocol === 'capacitor:') {
    // Mobile app - use deployed backend
    return 'https://pixivloader.duckdns.org/api';
  }
  
  // Check if we're in development
  if (import.meta.env.DEV) {
    // Development - use mobile backend or override from env
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  
  // Production web - use deployed backend
  return import.meta.env.VITE_API_URL || 'https://pixivloader.duckdns.org/api';
}

export default config;