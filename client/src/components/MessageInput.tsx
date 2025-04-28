import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Mic, Send } from "lucide-react";
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
  const { toast } = useToast();

  const handleAttachFile = () => {
    toast({
      description: "File attachment is not implemented yet",
    });
  };

  const handleRecordVoice = () => {
    toast({
      description: "Voice recording is not implemented yet",
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-[#202C33] p-3 flex items-center">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-zinc-500 dark:text-zinc-400 mr-2"
      >
        <Smile className="h-5 w-5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleAttachFile}
        className="text-zinc-500 dark:text-zinc-400 mr-2"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-full px-4 py-2 flex items-center">
        <Input
          type="text"
          placeholder="Type a message"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
      </div>
      {value.trim() ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSend}
          className="ml-2 bg-primary text-white rounded-full h-10 w-10 hover:bg-primary/90"
          disabled={isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRecordVoice}
          className="text-zinc-500 dark:text-zinc-400 ml-2"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default MessageInput;
