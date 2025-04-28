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
import { insertUserSchema } from "@shared/schema";
import { MessageSquare, Lock, User, UserCircle, KeyRound } from "lucide-react";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm Password is required"),
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
      password: "",
      confirmPassword: "",
      displayName: "",
      status: "Hey there! I am using WhatsApp Clone",
      avatar: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = data;
      await register(userData);
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      navigate("/login");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className={`transform transition-all duration-500 ease-out ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-primary rounded-full flex items-center justify-center shadow-lg">
            <UserCircle className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl text-center font-bold">
              <span className="gradient-text">Join Gallan</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to sign up
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
  );
}

export default Register;
