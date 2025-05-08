import express from 'express';
import { getRefereeGameStatistics, getLocationMonthlyReport } from '../controllers/statisticsController';

const router = express.Router();

// Optimized statistical endpoints
router.get('/referees/games', getRefereeGameStatistics);
router.get('/locations/monthly', getLocationMonthlyReport);

export default router; 