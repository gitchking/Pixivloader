import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Database, Server, Globe, Download, User, Lock, Zap } from "lucide-react";
import type { User as UserType } from "@supabase/supabase-js";

const Features = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System Architecture</h1>
          <p className="text-muted-foreground text-base">Visual blueprint of Pixivloader</p>
        </div>

        {/* Architecture Diagram */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Architecture Overview</CardTitle>
                <CardDescription className="text-base">
                  Hierarchical structure of the application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative py-8">
              {/* Level 1: Frontend */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-full max-w-md p-6 bg-primary/5 border-2 border-primary rounded-lg transition-all hover:shadow-lg hover:scale-105 hover:border-primary/80 cursor-pointer text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Globe className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Frontend Layer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">React + TypeScript + Vite</p>
                </div>
                
                {/* Connection Point */}
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 my-2"></div>
                <div className="w-0.5 h-8 bg-muted-foreground/30 transition-all hover:bg-primary hover:w-1"></div>
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50 my-2"></div>
              </div>

              {/* Level 2: Core Features */}
              <div className="relative mb-4">
                {/* Branch Lines */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="relative w-full max-w-5xl h-20">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-auto" viewBox="0 0 1000 100" preserveAspectRatio="none">
                      <g className="group">
                        <path d="M 500 0 Q 400 50, 166 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 400 50, 166 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 L 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 L 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 Q 600 50, 834 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 600 50, 834 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-blue-500/5 border-2 border-blue-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <User className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">Authentication</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">User login & signup</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-purple-500/5 border-2 border-purple-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold">Archive Manager</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Download Pixiv profiles</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-green-500/5 border-2 border-green-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-green-500" />
                        <h4 className="font-semibold">History Tracker</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Track download tasks</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Merge Point */}
              <div className="relative flex flex-col items-center mb-4">
                {/* Merge Lines */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="relative w-full max-w-5xl h-20">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-auto" viewBox="0 0 1000 100" preserveAspectRatio="none">
                      <g className="group">
                        <path d="M 166 0 Q 400 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 166 0 Q 400 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 L 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 L 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 834 0 Q 600 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 834 0 Q 600 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                    </svg>
                  </div>
                </div>
                
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50 mt-20 mb-2"></div>
                <div className="w-0.5 h-8 bg-muted-foreground/30 transition-all hover:bg-primary hover:w-1"></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 my-2"></div>
              </div>

              {/* Level 3: Backend API */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-full max-w-md p-6 bg-orange-500/5 border-2 border-orange-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Server className="w-6 h-6 text-orange-500" />
                    <h3 className="text-xl font-bold">Backend API</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Flask REST API</p>
                </div>
                
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 my-2"></div>
                <div className="w-0.5 h-8 bg-muted-foreground/30 transition-all hover:bg-primary hover:w-1"></div>
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50 my-2"></div>
              </div>

              {/* Level 4: Backend Services */}
              <div className="relative mb-4">
                {/* Branch Lines for Services */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="relative w-full max-w-6xl h-20">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-auto" viewBox="0 0 1000 100" preserveAspectRatio="none">
                      <g className="group">
                        <path d="M 500 0 Q 350 50, 125 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 350 50, 125 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 Q 450 50, 375 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 450 50, 375 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 Q 550 50, 625 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 550 50, 625 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 500 0 Q 650 50, 875 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 500 0 Q 650 50, 875 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-20 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-cyan-500/5 border-2 border-cyan-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-cyan-500" />
                        <h4 className="font-semibold">Cookie Auth</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Pixiv session</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-pink-500/5 border-2 border-pink-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-pink-500" />
                        <h4 className="font-semibold">Scraper</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Extract URLs</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-amber-500/5 border-2 border-amber-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-amber-500" />
                        <h4 className="font-semibold">Downloader</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Image proxy</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                    <div className="p-5 bg-violet-500/5 border-2 border-violet-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer w-full text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-violet-500" />
                        <h4 className="font-semibold">DB Client</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Supabase SDK</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Merge Point for Services */}
              <div className="relative flex flex-col items-center">
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="relative w-full max-w-6xl h-20">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-auto" viewBox="0 0 1000 100" preserveAspectRatio="none">
                      <g className="group">
                        <path d="M 125 0 Q 350 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 125 0 Q 350 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 375 0 Q 450 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 375 0 Q 450 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 625 0 Q 550 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 625 0 Q 550 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                      
                      <g className="group">
                        <path d="M 875 0 Q 650 50, 500 100" stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                        <path d="M 875 0 Q 650 50, 500 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30 transition-all group-hover:text-white group-hover:opacity-100 group-hover:stroke-[4] pointer-events-none" />
                      </g>
                    </svg>
                  </div>
                </div>
                
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50 mt-20"></div>
                <div className="w-0.5 h-8 bg-muted-foreground/30 transition-all hover:bg-primary hover:w-1"></div>
              </div>

              {/* Level 5: Database */}
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mb-2"></div>
                <div className="w-full max-w-md p-6 bg-indigo-500/5 border-2 border-indigo-500 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Database className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-xl font-bold">Database</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Row Level Security (RLS) policies</li>
                <li>• User authentication via Supabase Auth</li>
                <li>• Secure API endpoints</li>
                <li>• Data isolation per user</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fast React rendering with Vite</li>
                <li>• Optimized database queries</li>
                <li>• Real-time updates</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Features;
