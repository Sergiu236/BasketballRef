// src/index.ts
import 'reflect-metadata';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { Worker } from 'worker_threads';

import { AppDataSource } from './config/database';
import { initWebSocket, broadcastEvent, attachGeneratorWorker } from './websocket/websocketServer';
import fileRoutes from './routes/fileRoutes';
import config from './config';

// ──────────────────────────────────────────────────────────────────────────────
// 1) Express instance (exported for tests / other modules)
// ──────────────────────────────────────────────────────────────────────────────
export const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ──────────────────────────────────────────────────────────────────────────────
// 2) Concurrency queue (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
type QueueTask<T> = {
  fn: () => T;
  resolve: (val: T) => void;
  reject: (err: any) => void;
};

const taskQueue: Array<QueueTask<any>> = [];
let isProcessing = false;

export function performOperation<T>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    taskQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (taskQueue.length > 0) {
    const { fn, resolve, reject } = taskQueue.shift()!;
    try {
      const res = fn();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }
  isProcessing = false;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3) Start AFTER database is ready
// ──────────────────────────────────────────────────────────────────────────────
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ DataSource initialized');

    // 3a) Routes (imported late so controllers see a ready DataSource)
    const [{ default: refereesRouter }] = await Promise.all([
      import('./routes/refereesRoutes'),
    ]);
    app.use('/api/referees', refereesRouter);
    app.use('/api/files',     fileRoutes);   // already imported above

    // 3b) HTTP + Socket.io server
    const httpServer = http.createServer(app);
    initWebSocket(httpServer);

    const server = httpServer.listen(config.PORT, '0.0.0.0', () => {
      console.log(`Server + Socket.io running at ${config.API_URL}`);
      console.log(
        `Local network access: http://${config.API_URL.replace('http://', '')}`,
      );
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3c) Background worker
    // ──────────────────────────────────────────────────────────────────────────
    const workerPath = path.resolve(
      process.cwd(),
      'src',
      'websocket',
      'entityGenerator.ts',
    );

    const generatorWorker = new Worker(workerPath, {
      execArgv: ['-r', 'ts-node/register'],
    });
    attachGeneratorWorker(generatorWorker);

    generatorWorker.on('message', async (msg: any) => {
      if (msg.type === 'GENERATED_REFEREE') {
        try {
          const { Referee } = await import('./entities/Referee');
          const repo = AppDataSource.getRepository(Referee);
          // Create a new referee entity from the payload without an ID
          const newRef = repo.create(msg.payload);

          performOperation(async () => {
            try {
              const saved = await repo.save(newRef);
              broadcastEvent('refereeCreated', saved);
            } catch (error) {
              console.error('Error saving generated referee:', error);
            }
          });
        } catch (error) {
          console.error('Error processing generated referee:', error);
        }
      }
    });

    generatorWorker.on('error', (err) => {
      console.error('Worker thread error:', err);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3d) Graceful shutdown
    // ────────────────────────────────────────────────────────────────────────
    function shutdown() {
      console.log('\nGraceful shutdown initiated...');

      generatorWorker.postMessage('STOP_GENERATOR');
      generatorWorker.terminate().then(() => {
        console.log('Background worker terminated.');
      });

      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize DataSource', err);
    process.exit(1);
  });
