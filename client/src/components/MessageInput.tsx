import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Mic, Send, Image, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

function MessageInput({ value, onChange, onSend, onKeyDown, isLoading }: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const { toast } = useToast();
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Close attachment options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAttachOptions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleAttachFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the outside click handler
    setShowAttachOptions(!showAttachOptions);
  };

  const handleImageAttach = () => {
    toast({
      description: "Image attachment is not implemented yet",
    });
    setShowAttachOptions(false);
  };

  const handleFileAttach = () => {
    toast({
      description: "File attachment is not implemented yet",
    });
    setShowAttachOptions(false);
  };

  const handleCameraAttach = () => {
    toast({
      description: "Camera attachment is not implemented yet",
    });
    setShowAttachOptions(false);
  };

  const handleRecordVoice = () => {
    toast({
      description: "Voice recording is not implemented yet",
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-[#202C33] p-3 flex items-center relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-zinc-500 dark:text-zinc-400 mr-2 animate-button hover:text-primary hover:bg-transparent"
      >
        <Smile className="h-5 w-5 transition-all hover:scale-110" />
      </Button>
      
      {/* Attach Button with Options */}
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAttachFile}
          className="text-zinc-500 dark:text-zinc-400 mr-2 animate-button hover:text-primary hover:bg-transparent"
        >
          <Paperclip className="h-5 w-5 transition-all hover:scale-110" />
        </Button>
        
        {/* Attachment options popup */}
        {showAttachOptions && (
          <div className="absolute bottom-12 left-0 bg-white dark:bg-[#2A3942] rounded-lg shadow-lg p-2 z-10 flex flex-col gap-2 pop-in">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleImageAttach}
              className="text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#374248] animate-button"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCameraAttach}
              className="text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#374248] animate-button"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleFileAttach}
              className="text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#374248] animate-button"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Message Input Field */}
      <div className={`flex-1 bg-white dark:bg-[#2A3942] rounded-full px-4 py-2 flex items-center transition-all message-input ${isInputFocused ? 'shadow-md' : ''}`}>
        <Input
          type="text"
          placeholder="Type a message"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
      </div>
      
      {/* Send or Mic Button */}
      {value.trim() ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSend}
          className="ml-2 bg-gradient-to-r from-primary to-teal-500 text-white rounded-full h-10 w-10 hover:opacity-90 transition-all shadow-sm animate-button"
          disabled={isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRecordVoice}
          className="text-zinc-500 dark:text-zinc-400 ml-2 hover:text-primary hover:bg-transparent animate-button"
        >
          <Mic className="h-5 w-5 transition-all hover:scale-110" />
        </Button>
      )}
      
      {/* Credits - Made by Zylox, Coded by Moeed Mirza */}
      <div className="absolute -bottom-5 right-0 left-0 mx-auto text-center">
        <p className="credits text-xs">
          <span>Made by</span> <span className="gradient-text font-medium">Zylox</span>, 
          <span> Coded by</span> <span className="gradient-text font-medium">Moeed Mirza</span>
        </p>
      </div>
    </div>
  );
}

export default MessageInput;
