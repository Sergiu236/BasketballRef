// backend/src/routes/gamesRoutes.ts
import express from 'express';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getGamesByRefereeId
} from '../controllers/gamesController';

const router = express.Router();

router.get('/', getAllGames);

// The more specific route must come BEFORE the '/:id' route
router.get('/referee/:refereeId', getGamesByRefereeId);

router.get('/:id', getGameById);
router.post('/', createGame);
router.put('/:id', updateGame);
router.delete('/:id', deleteGame);

export default router;
