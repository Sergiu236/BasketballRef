import { io, Socket } from 'socket.io-client';
import config from '../config';
import { getCurrentUser } from '../services/authService';

let socket: Socket | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// 1) Keep a list of callbacks for generationStatus events
// ─────────────────────────────────────────────────────────────────────────────
const generationStatusCallbacks: Array<(status: boolean) => void> = [];

/**
 * Initialize (or re-initialize) the Socket.io connection.
 * Call this once (e.g. in your top-level App) to set up the client socket.
 */
export function connectWebSocket() {
  if (!socket) {
    socket = io(config.API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2) When we receive the "generationStatus" event from the server,
    //    notify all registered callbacks.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('generationStatus', (status: boolean) => {
      generationStatusCallbacks.forEach((cb) => cb(status));
    });
  }
}

// Optional getter if other components need raw socket
export function getSocket(): Socket {
  if (!socket) {
    socket = io(config.API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socket;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Export a function to subscribe to generationStatus updates
// ─────────────────────────────────────────────────────────────────────────────
export function onGenerationStatus(callback: (status: boolean) => void) {
  generationStatusCallbacks.push(callback);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Export start/stop generation methods that emit to the server
// ─────────────────────────────────────────────────────────────────────────────
export function startGeneration() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id) {
    socket?.emit('startGeneration', currentUser.id);
  } else {
    console.error('Cannot start generation: No authenticated user found');
  }
}

export function stopGeneration() {
  socket?.emit('stopGeneration');
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
