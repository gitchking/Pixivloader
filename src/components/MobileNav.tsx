import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, History, Settings, Download, Menu, X, LogOut, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User as UserType } from "@supabase/supabase-js";

interface MobileNavProps {
  user: UserType | null;
}

export const MobileNav = ({ user }: MobileNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    setIsMenuOpen(false);
  };

  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left - close menu
      setIsMenuOpen(false);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/dashboard", icon: History, label: "Downloads" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0f] border-b border-gray-200 dark:border-gray-900/50">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#0096fa]/10 rounded-xl transition-colors border-2 border-[#0096fa]/30"
          >
            <Menu className="w-6 h-6 text-[#0096fa]" />
          </button>
          
          <div className="flex items-center gap-2.5">
            {/* App Icon - Pixiv-inspired with "P" and download arrow */}
            <div className="relative w-9 h-9 rounded-xl bg-[#0096fa] flex items-center justify-center shadow-lg shadow-[#0096fa]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="5" y="17" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
                <path d="M16 12L16 16M16 16L14 14M16 16L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Pixivloader</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Side Drawer Menu */}
      <>
        {/* Backdrop */}
        <div
          className={`md:hidden fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div 
          className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0a0a0f] z-50 shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
              {/* Header with Close */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-900/50">
                <div className="flex items-center gap-3">
                  {/* App Icon in Sidebar */}
                  <div className="relative w-10 h-10 rounded-xl bg-[#0096fa] flex items-center justify-center shadow-lg shadow-[#0096fa]/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x="4" y="17" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
                      <path d="M16 12L16 16M16 16L14 14M16 16L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Pixivloader</h2>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-500" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    location.pathname === "/"
                      ? "bg-[#0096fa]/10 text-[#0096fa]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <Home className={`w-6 h-6 flex-shrink-0 ${location.pathname === "/" ? "text-[#0096fa]" : "text-[#0096fa]"}`} strokeWidth={2.5} />
                  <span className="font-semibold text-lg">Home</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    location.pathname === "/dashboard"
                      ? "bg-[#0096fa]/10 text-[#0096fa]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <History className={`w-6 h-6 flex-shrink-0 ${location.pathname === "/dashboard" ? "text-[#0096fa]" : "text-[#0096fa]"}`} strokeWidth={2.5} />
                  <span className="font-semibold text-lg">Downloads</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    location.pathname === "/settings"
                      ? "bg-[#0096fa]/10 text-[#0096fa]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <Settings className={`w-6 h-6 flex-shrink-0 ${location.pathname === "/settings" ? "text-[#0096fa]" : "text-[#0096fa]"}`} strokeWidth={2.5} />
                  <span className="font-semibold text-lg">Settings</span>
                </Link>
              </nav>

              {/* Logout Button */}
              {user && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-900/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-4 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <LogOut className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
                    <span className="font-semibold text-lg">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
      </>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0a0a0f] border-t border-gray-200 dark:border-gray-900/50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <div className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? "text-[#0096fa]" : "text-gray-500"
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#0096fa] rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
