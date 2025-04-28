import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Camera } from "lucide-react";
import { Label } from "@/components/ui/label";
import { User } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [name, setName] = useState(user.displayName);
  const [about, setAbout] = useState(user.status);
  const { toast } = useToast();
  
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: { displayName: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    updateProfileMutation.mutate({ displayName: name, status: about });
  };
  
  const handleChangeProfilePic = () => {
    toast({
      description: "Profile picture upload is not implemented yet",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#202C33] rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Profile</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <Button 
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 rounded-full p-2 text-white" 
                size="icon"
                onClick={handleChangeProfilePic}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 text-center">
              <h4 className="font-medium text-lg">{user.displayName}</h4>
              <p className="text-sm text-muted-foreground">{user.status}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm text-muted-foreground mb-1">Name</Label>
              <Input 
                id="name"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2A3942]"
              />
            </div>
            <div>
              <Label htmlFor="about" className="block text-sm text-muted-foreground mb-1">About</Label>
              <Input 
                id="about"
                type="text" 
                value={about} 
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2A3942]"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="block text-sm text-muted-foreground mb-1">Username</Label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#182229] text-muted-foreground">
                {user.username}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
