// src/api/eventStream.ts
export type EventStreamHandler = (event: any) => void;

export function subscribeToEvents(
  onEvent: EventStreamHandler,
  options?: {
    reconnect?: boolean;
    onError?: (err: any) => void;
    onOpen?: () => void;
  }
): () => void {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  const reconnectDelay = 3000;

  const connect = () => {
    eventSource = new EventSource("/api/sensitivity-labels/events/stream");
    if (options?.onOpen) {
      eventSource.onopen = options.onOpen;
    }
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        // Optionally log parse errors
      }
    };
    eventSource.onerror = (err) => {
      if (options?.onError) options.onError(err);
      if (options?.reconnect !== false) {
        if (eventSource) eventSource.close();
        reconnectTimeout = setTimeout(connect, reconnectDelay);
      }
    };
  };

  connect();

  return () => {
    if (eventSource) eventSource.close();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
  };
}
