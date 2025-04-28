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
import { UserCircle, Lock, User, KeyRound, MessageSquare, Shield, Zap, Smile } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  displayName: z.string().min(1, "Display name is required").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    try {
      setIsLoading(true);
      await register({
        username: data.username,
        displayName: data.displayName,
        password: data.password,
        status: "Hey there! I'm using Gallan",
      });
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Registration form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 lg:px-16 xl:px-20 bg-white dark:bg-gray-900 transition-all duration-500">
        <div className="absolute top-4 right-4 md:left-4 md:right-auto z-10">
          <ThemeToggle />
        </div>
        
        <div className={`w-full max-w-md transform transition-all duration-500 ease-out ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-primary rounded-full flex items-center justify-center shadow-lg pop-in" style={{animationDelay: '0.3s'}}>
              <UserCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <Card className="w-full border-none shadow-2xl card-pop-in bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-4xl text-center font-bold">
                <span className="gradient-text">Join Gallan</span>
              </CardTitle>
              <CardDescription className="text-center text-base">
                Create your account to start chatting
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
                              placeholder="Choose a username" 
                              className="pl-10 py-5 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
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
                    name="displayName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-medium">Display Name</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="Enter your display name" 
                              className="pl-10 py-5 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
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
                              placeholder="Create a strong password" 
                              className="pl-10 py-5 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-medium">Confirm Password</FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <KeyRound className="h-5 w-5" />
                          </div>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              className="pl-10 py-5 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
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
                    className="w-full py-6 mt-2 bg-gradient-to-r from-teal-500 to-primary hover:opacity-90 transition-all animate-button shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="ml-2">Creating account...</span>
                      </div>
                    ) : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="gradient-text font-medium hover:opacity-80 transition-all"
                >
                  Sign in
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
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-bl from-teal-500/90 to-primary/90 items-center justify-center relative">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        <div className="max-w-md p-8 text-white relative z-10">
          <div className="mb-8 pop-in" style={{animationDelay: '0.5s'}}>
            <h2 className="text-4xl font-bold mb-4">Create Your Account</h2>
            <p className="text-lg opacity-90">Join Gallan today and connect with friends, family, and colleagues!</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '0.7s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Privacy First</h3>
                <p className="opacity-80">Your conversations are private and secure</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '0.9s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Lightning Fast</h3>
                <p className="opacity-80">Quick message delivery and responsive interface</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 pop-in" style={{animationDelay: '1.1s'}}>
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Smile className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Express Yourself</h3>
                <p className="opacity-80">Share photos, videos, and more with your contacts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;