// backend/src/routes/refereesRoutes.ts
import express from 'express';
import {
  getAllReferees,
  getRefereeById,
  createReferee,
  updateReferee,
  updateRefereePartial,
  deleteReferee,
  healthCheckController,
  syncController,
} from '../controllers/refereesController';   // ← path fixed
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/health',  healthCheckController);

// All routes below this middleware require authentication
router.use(authenticateToken);
router.post('/sync',    syncController);

router.get('/',         getAllReferees);
router.get('/:id',      getRefereeById);
router.post('/',        createReferee);
router.put('/:id',      updateReferee);
router.patch('/:id',    updateRefereePartial);
router.delete('/:id',   deleteReferee);

export default router;
