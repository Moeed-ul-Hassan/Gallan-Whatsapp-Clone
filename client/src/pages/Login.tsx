import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Lock, User, Shield, Globe, CheckCheck, FileBarChart } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#111b21] text-white">
      {/* WhatsApp-style header */}
      <header className="bg-[#202c33] py-4 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-[#00a884] mr-2" />
            <h1 className="text-xl font-semibold">GALLAN WEB</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main content */}
        <div className="w-full md:w-7/12 flex flex-col items-center justify-center p-6 md:p-12 pop-in" style={{animationDelay: '0.3s'}}>
          <Card className="w-full max-w-md border-none bg-[#222e35] shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-white">
                Use Gallan on your computer
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to start messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-gray-300">Username</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <User className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="pl-10 py-5 bg-[#2a3942] border-[#2a3942] text-white focus:ring-[#00a884] focus:border-[#00a884]"
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-gray-300">Password</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Lock className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="pl-10 py-5 bg-[#2a3942] border-[#2a3942] text-white focus:ring-[#00a884] focus:border-[#00a884]"
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full py-6 mt-4 bg-[#00a884] hover:bg-[#00a884]/90 text-white transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="ml-2">Signing in...</span>
                      </div>
                    ) : "LOGIN"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <p className="text-sm text-center text-gray-400 mb-2">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-[#00a884] font-medium hover:underline"
                >
                  Create a new account
                </a>
              </p>
            </CardFooter>
          </Card>
          
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>
              <span>Made by</span> <span className="text-[#00a884] font-medium">Zylox</span>, 
              <span> Coded by</span> <span className="text-[#00a884] font-medium">Moeed Mirza</span>
            </p>
          </div>
        </div>
        
        {/* Tutorial Panel */}
        <div className="hidden md:flex md:w-5/12 bg-[#222e35] flex-col items-center justify-center p-8 border-l border-[#394045]">
          <div className="max-w-md space-y-12 pop-in" style={{animationDelay: '0.5s'}}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to Gallan Web</h2>
              <p className="text-gray-400">A simple, reliable way to text chat with friends</p>
            </div>
            
            <div className="space-y-8">
              <div className="flex flex-col items-center space-y-3 pop-in" style={{animationDelay: '0.7s'}}>
                <div className="bg-[#00a884] p-3 rounded-full">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-medium text-lg">End-to-end encrypted</h3>
                <p className="text-gray-400 text-center">Your personal messages are secured</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 pop-in" style={{animationDelay: '0.9s'}}>
                <div className="bg-[#00a884] p-3 rounded-full">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-medium text-lg">Works on all devices</h3>
                <p className="text-gray-400 text-center">Compatible with smartphones and computers</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 pop-in" style={{animationDelay: '1.1s'}}>
                <div className="bg-[#00a884] p-3 rounded-full">
                  <CheckCheck className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-medium text-lg">Reliable messaging</h3>
                <p className="text-gray-400 text-center">Fast message delivery with read receipts</p>
              </div>
              
              {/* Flow Diagram Link */}
              <div className="mt-8 flex justify-center pop-in" style={{animationDelay: '1.3s'}}>
                <a 
                  href="/flow-diagram" 
                  target="_blank" 
                  className="text-[#00a884] hover:text-[#00cf9f] transition-colors flex items-center gap-2"
                >
                  <FileBarChart className="h-5 w-5" />
                  <span>View Flow Diagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;