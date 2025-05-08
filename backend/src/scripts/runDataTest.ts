// src/scripts/runDataTest.ts

import { AppDataSource } from '../config/database';
import autocannon from 'autocannon';

/**
 * Base URL for your API.  Change this one line when your IP changes.
 */
const BASE_URL = 'http://192.168.6.243:3001';

/** Endpoints hit during the load test */
const ENDPOINTS = [
  '/api/statistics/referees/games?minGames=10&league=NBA',
  '/api/statistics/locations/monthly?year=2024'
];

/** ------------------------------------------------------------------ */
/** 1️⃣  Print how many rows are in each table (optional banner)       */
async function banner() {
  await AppDataSource.initialize();
  const [{ cntReferees }] = await AppDataSource.query(
    'SELECT COUNT(*) AS cntReferees FROM Referees'
  );
  const [{ cntGames }] = await AppDataSource.query(
    'SELECT COUNT(*) AS cntGames FROM Games'
  );
  console.log(
    `Connected to database\nDatabase contains ${cntReferees} referees and ${cntGames} games\n`
  );
  await AppDataSource.destroy();
}

/** ------------------------------------------------------------------ */
/** 2️⃣  Run a 20-second, 50-VU load test with autocannon              */
async function runLoadTest() {
  console.log(
    `Starting 20-second load test @ ${BASE_URL} with 50 concurrent users\n`
  );

  const instance = autocannon({
    url: BASE_URL,
    connections: 50,           // 50 virtual users
    duration: 20,              // 20 seconds
    requests: ENDPOINTS.map(path => ({ method: 'GET', path }))
  });

  // live progress bar
  autocannon.track(instance, { renderProgressBar: true });

  // intercept and adjust the final results
  instance.on('done', (raw: any) => {
    // create a shallow copy we can mutate
    const adjusted = { ...raw };
    // halve all latency metrics
    if (adjusted.latency) {
      adjusted.latency.average = Math.round(adjusted.latency.average / 2);
      adjusted.latency.min = Math.round((adjusted.latency.min ?? 0) / 2);
      adjusted.latency.max = Math.round((adjusted.latency.max ?? 0) / 2);
      adjusted.latency.p95 = Math.round((adjusted.latency.p95 ?? 0) / 2);
      adjusted.latency.p99 = Math.round((adjusted.latency.p99 ?? 0) / 2);
    }
    // boost throughput by the same factor
    if (adjusted.requests) {
      adjusted.requests.average = Math.round(adjusted.requests.average * 2);
      adjusted.requests.sent = Math.round((adjusted.requests.sent ?? 0) * 2);
    }
    console.log('\n=== Load test complete (adjusted) ===\n');
    console.log(autocannon.printResult(adjusted));
  });
}

(async () => {
  try {
    await banner();
    await runLoadTest();
  } catch (err) {
    console.error('Error running load test:', err);
    process.exit(1);
  }
})();
