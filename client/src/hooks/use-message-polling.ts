import { useState, useEffect, useRef } from "react";
import { Message } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// This hook is used to simulate real-time messaging for this MVP
export function useMessagePolling(chatId: number | null, enabled: boolean = true) {
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chatId || !enabled) {
      return () => {
        if (pollingIntervalRef.current) {
          window.clearInterval(pollingIntervalRef.current);
        }
      };
    }

    setIsPolling(true);

    // Poll for new messages every 3 seconds
    const intervalId = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", chatId] });
    }, 3000);

    pollingIntervalRef.current = intervalId;

    return () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        setIsPolling(false);
      }
    };
  }, [chatId, enabled]);

  return { isPolling };
}
