import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Worker } from 'worker_threads';

let io: Server | null = null;
let generatorWorker: Worker | null = null;

/**
 * initWebSocket
 * Call this once from your main server file to set up Socket.io on the given HTTP server.
 */
export function initWebSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected via Socket.io:', socket.id);

    // ─────────────────────────────────────────────────────────────────────────
    // 1) start/stop handlers
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('startGeneration', (userId) => {
      console.log('Client requests start generation:', socket.id, 'User ID:', userId);
      if (generatorWorker) {
        generatorWorker.postMessage({
          type: 'START_GENERATOR',
          userId: userId
        });
      }
    });

    socket.on('stopGeneration', () => {
      console.log('Client requests stop generation:', socket.id);
      if (generatorWorker) {
        generatorWorker.postMessage('STOP_GENERATOR');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

/**
 * attachGeneratorWorker
 * So we can capture messages from the entityGenerator Worker and broadcast them to clients.
 */
export function attachGeneratorWorker(worker: Worker) {
  generatorWorker = worker;

  worker.on('message', (msg: any) => {
    if (!io) return;
    // ─────────────────────────────────────────────────────────────────────────
    // 2) When the worker reports a generation status change,
    //    broadcast that to all connected Socket.io clients.
    // ─────────────────────────────────────────────────────────────────────────
    if (msg.type === 'GENERATION_STATUS') {
      io.emit('generationStatus', msg.payload.isGenerating);
    }

    // You might handle 'GENERATED_REFEREE' elsewhere, or also broadcast it here
    // e.g. if (msg.type === 'GENERATED_REFEREE') { io.emit('refereeCreated', msg.payload); }
  });
}

/**
 * broadcastEvent
 * Simple helper to push an event to all connected clients.
 */
export function broadcastEvent(eventName: string, payload: any) {
  if (!io) return;
  io.emit(eventName, payload);
}
