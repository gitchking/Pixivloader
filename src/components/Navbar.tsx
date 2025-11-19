import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Image, LogOut, Home, History, Sparkles, Settings, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <span>Pixivloader</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group">
            <Home className="w-5 h-5 text-blue-500 group-hover:text-primary" />
            Home
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group">
            <History className="w-5 h-5 text-purple-500 group-hover:text-primary" />
            History
          </Link>
          <Link to="/features" className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group">
            <Sparkles className="w-5 h-5 text-pink-500 group-hover:text-primary" />
            Features
          </Link>
          <Link to="/settings" className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group">
            <Settings className="w-5 h-5 text-green-500 group-hover:text-primary" />
            Settings
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Button variant="outline" size="default" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button size="default" onClick={() => navigate("/auth")} className="bg-blue-500 hover:bg-blue-600 text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
