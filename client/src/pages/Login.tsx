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
import { MessageSquare, Lock, User, MessageCircle, Send, Users } from "lucide-react";

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
    <div className="flex min-h-screen">
      {/* Left panel - Login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 lg:px-16 xl:px-20 bg-white dark:bg-gray-900 transition-all duration-500">
        <div className="absolute top-4 right-4 md:left-4 md:right-auto z-10">
          <ThemeToggle />
        </div>
        
        <div className={`w-full max-w-md transform transition-all duration-500 ease-out ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-teal-500 rounded-full flex items-center justify-center shadow-lg pop-in" style={{animationDelay: '0.3s'}}>
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <Card className="w-full border-none shadow-2xl card-pop-in bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-4xl text-center font-bold">
                <span className="gradient-text">Gallan</span>
              </CardTitle>
              <CardDescription className="text-center text-base">
                Connect and chat with friends instantly
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
                        <FormLabel className="font-medium">Username</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <User className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="pl-10 py-6 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-medium">Password</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Lock className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="pl-10 py-6 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full py-6 mt-2 bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 transition-all animate-button shadow-md"
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
                    ) : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="gradient-text font-medium hover:opacity-80 transition-all"
                >
                  Sign up
                </a>
              </p>
              <div className="credits mt-6">
                <p>
                  <span>Made by</span> <span className="gradient-text font-medium">Zylox</span>, 
                  <span> Coded by</span> <span className="gradient-text font-medium">Moeed Mirza</span>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Right panel - Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-teal-500/90 items-center justify-center relative">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        <div className="max-w-md p-8 text-white relative z-10">
          <div className="mb-8 pop-in" style={{animationDelay: '0.5s'}}>
            <h2 className="text-4xl font-bold mb-4">Welcome to Gallan</h2>
            <p className="text-lg opacity-90">Your modern messaging platform for seamless communication</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '0.7s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Real-time Messaging</h3>
                <p className="opacity-80">Send and receive messages instantly with friends and family</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '0.9s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Easy Contact Management</h3>
                <p className="opacity-80">Organize and manage your contacts efficiently</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '1.1s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Media Sharing</h3>
                <p className="opacity-80">Share photos, videos, and files with your contacts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;