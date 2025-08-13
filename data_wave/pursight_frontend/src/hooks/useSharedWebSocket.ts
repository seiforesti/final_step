import { useEffect, useState } from "react";

const CHANNEL_NAME = "realtime-updates";

export function useSharedWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    // Listen for messages from the leader tab
    channel.onmessage = (event) => {
      setLastMessage(event.data);
    };

    // Only one tab (the "leader") should open the WebSocket
    let ws: WebSocket | null = null;
    let isLeader = false;

    function tryBecomeLeader() {
      // Try to acquire leadership
      if (!localStorage.getItem("ws-leader")) {
        localStorage.setItem("ws-leader", String(Date.now()));
        isLeader = true;
        ws = new WebSocket(url);

        ws.onmessage = (event) => {
          channel.postMessage(event.data); // Broadcast to all tabs
        };

        ws.onclose = () => {
          // Release leadership on close
          localStorage.removeItem("ws-leader");
          setTimeout(tryBecomeLeader, 1000); // Try to become leader again
        };
      } else {
        // Not leader, check again later
        setTimeout(tryBecomeLeader, 1000);
      }
    }

    tryBecomeLeader();

    // On unload, release leadership if this tab is the leader
    window.addEventListener("beforeunload", () => {
      if (isLeader) {
        localStorage.removeItem("ws-leader");
        ws?.close();
      }
    });

    return () => {
      channel.close();
      if (isLeader) {
        localStorage.removeItem("ws-leader");
        ws?.close();
      }
    };
  }, [url]);

  return { lastMessage };
}
