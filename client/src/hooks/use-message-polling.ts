import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function useMessagePolling(chatId: number | null, enabled: boolean = true) {
  // Use a polling interval
  const pollingInterval = 3000; // 3 seconds

  // The key features for message polling:
  // 1. Regular polling for new messages in the active chat
  // 2. Update message statuses (delivered, read)
  useEffect(() => {
    if (!chatId || !enabled) return;

    // Setup interval for polling
    const interval = setInterval(() => {
      // Invalidate and refetch both message list and chat list
      queryClient.invalidateQueries({ queryKey: ["/api/messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [chatId, enabled]);

  return null;
}