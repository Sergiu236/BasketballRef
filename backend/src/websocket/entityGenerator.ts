import { parentPort } from 'worker_threads';
import { generateRandomReferee } from '../utils/generateReferee';

if (!parentPort) {
  throw new Error('entityGenerator.ts must be run as a Worker thread!');
}

let shouldStop = false;    // Full worker shutdown
let isGenerating = false; // Indicates whether we are currently generating

/**
 * Sets isGenerating and notifies the parent about the new status.
 */
function setGenerating(enabled: boolean) {
  isGenerating = enabled;
  parentPort?.postMessage({
    type: 'GENERATION_STATUS',
    payload: { isGenerating },
  });
}

/**
 * Main loop: if isGenerating is true, produce a new Referee every 5s.
 * If isGenerating is false, wait briefly and check again.
 * If shouldStop is true, the loop ends entirely.
 */
async function runGeneratorLoop() {
  while (!shouldStop) {
    if (isGenerating) {
      const newRef = generateRandomReferee([]);
      parentPort?.postMessage({
        type: 'GENERATED_REFEREE',
        payload: newRef,
      });
      // Generate one referee every 5 seconds
      await sleep(5000);
    } else {
      // If not generating, just wait 1 second and check again
      await sleep(1000);
    }
  }
}

/** Listen for commands from the parent. */
parentPort.on('message', (msg) => {
  if (msg === 'START_GENERATOR') {
    setGenerating(true);
  } else if (msg === 'STOP_GENERATOR') {
    setGenerating(false);
  } else if (msg === 'STOP_WORKER') {
    // For graceful shutdown when the server is closing:
    shouldStop = true;
  }
});

/** Helper to sleep for given ms. */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start
runGeneratorLoop().catch((err) => {
  console.error('Error in entityGenerator worker:', err);
});
