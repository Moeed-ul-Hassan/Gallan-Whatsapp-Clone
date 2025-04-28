import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, UserPlus, Users } from "lucide-react";
import { Contact } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewChatModalProps {
  contacts: Contact[];
  isLoading: boolean;
  onClose: () => void;
  onSelectContact: (contactId: number) => void;
}

function NewChatModal({ contacts, isLoading, onClose, onSelectContact }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const filteredContacts = contacts.filter(contact => 
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const createChatMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest("POST", "/api/chats", { contactId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      onSelectContact(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create chat",
        variant: "destructive",
      });
    },
  });
  
  const handleSelectContact = (contactId: number) => {
    createChatMutation.mutate(contactId);
  };
  
  const handleCreateNewGroup = () => {
    toast({
      description: "Group creation is not implemented yet",
    });
  };
  
  const handleAddNewContact = () => {
    toast({
      description: "Adding new contacts is not implemented yet",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#202C33] rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">New Chat</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-2">
          <div className="flex items-center bg-gray-100 dark:bg-[#202C33] rounded-lg px-3 py-1 mb-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 bg-transparent border-none w-full focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-2">
            <Button
              variant="ghost"
              className="flex items-center w-full px-3 py-2 justify-start"
              onClick={handleCreateNewGroup}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
              <span className="ml-3">New group</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center w-full px-3 py-2 justify-start"
              onClick={handleAddNewContact}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="ml-3">New contact</span>
            </Button>
          </div>
          <div className="pt-2 px-4 pb-1 text-sm text-muted-foreground">
            Contacts
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <p className="text-muted-foreground">Loading contacts...</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="px-2">
              {filteredContacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2A3942] rounded-lg cursor-pointer"
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <Avatar>
                    <AvatarImage src={contact.avatar} alt={contact.displayName} />
                    <AvatarFallback>{contact.displayName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h4 className="font-medium">{contact.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{contact.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center p-4">
              <p className="text-muted-foreground">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
