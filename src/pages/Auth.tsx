import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      setLoading(false);

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to confirm your account.",
        });
        // Don't navigate immediately, wait for email confirmation
      }
    } catch (err) {
      setLoading(false);
      console.error('Signup error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] flex items-center justify-center p-6">
      <Card className="w-full max-w-xl shadow-2xl bg-white dark:bg-[#0d0d12] border-gray-200 dark:border-gray-900/50">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* App Icon matching header */}
            <div className="relative w-14 h-14 rounded-xl bg-[#0096fa] flex items-center justify-center shadow-lg shadow-[#0096fa]/30">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="7" y="25" fill="white" fontSize="24" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
                <path d="M24 18L24 24M24 24L21 21M24 24L27 21" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Pixivloader</span>
          </div>
          <CardDescription className="text-base text-gray-600 dark:text-gray-400">Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6 bg-gray-100 dark:bg-[#16161d]">
              <TabsTrigger value="signin" className="text-base data-[state=active]:bg-[#0096fa] data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-base data-[state=active]:bg-[#0096fa] data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-base text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base bg-gray-100 dark:bg-[#16161d] border-gray-300 dark:border-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-[#0096fa]/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-base text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base bg-gray-100 dark:bg-[#16161d] border-gray-300 dark:border-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-[#0096fa]/50"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base mt-6 bg-[#0096fa] hover:bg-[#0084d6] text-white font-semibold" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-base text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base bg-gray-100 dark:bg-[#16161d] border-gray-300 dark:border-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-[#0096fa]/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-base text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base bg-gray-100 dark:bg-[#16161d] border-gray-300 dark:border-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-[#0096fa]/50"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base mt-6 bg-[#0096fa] hover:bg-[#0084d6] text-white font-semibold" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
