import { Button } from "@/components/ui/button";
import { MessageSquare, PhoneCall, PieChart } from "lucide-react";

interface MobileNavProps {
  onStartNewChat: () => void;
}

function MobileNav({ onStartNewChat }: MobileNavProps) {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#202C33] border-t border-gray-200 dark:border-gray-700 md:hidden z-10">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className="flex-1 py-3 px-4 flex flex-col items-center text-primary hover:bg-transparent"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs block mt-1">Chats</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-3 px-4 flex flex-col items-center text-muted-foreground hover:bg-transparent"
          >
            <PieChart className="h-5 w-5" />
            <span className="text-xs block mt-1">Status</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-3 px-4 flex flex-col items-center text-muted-foreground hover:bg-transparent"
          >
            <PhoneCall className="h-5 w-5" />
            <span className="text-xs block mt-1">Calls</span>
          </Button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-5 z-20 md:hidden">
        <Button
          className="bg-primary hover:bg-primary/90 rounded-full w-14 h-14 shadow-lg"
          onClick={onStartNewChat}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}

export default MobileNav;
