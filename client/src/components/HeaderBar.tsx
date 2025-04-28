import { Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderBarProps {
  onOpenMenu: () => void;
  onStartNewChat: () => void;
}

function HeaderBar({ onOpenMenu, onStartNewChat }: HeaderBarProps) {
  return (
    <header className="bg-secondary-light dark:bg-secondary-dark h-16 flex items-center px-4 md:hidden">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-white text-xl font-semibold">WhatsApp Clone</h1>
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon" className="text-white">
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-white" onClick={onOpenMenu}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;
