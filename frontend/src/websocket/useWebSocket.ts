// src/websocket/useWebSocket.ts
import { useEffect, useState } from 'react';
import { connectWebSocket, getSocket } from './websocketClient';

interface UseWebSocketOptions<T> {
  eventName: string;
  onMessage: (data: T) => void;
}

/**
 * useWebSocket
 * A simple hook that ensures the Socket.io client is connected,
 * and sets up a listener for the specified event.
 */
export function useWebSocket<T = any>(options: UseWebSocketOptions<T>) {
  const { eventName, onMessage } = options;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectWebSocket();
    const socket = getSocket();
    if (!socket) return;

    // Update connection state
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(eventName, onMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(eventName, onMessage);
    };
  }, [eventName, onMessage]);

  return { isConnected };
}
