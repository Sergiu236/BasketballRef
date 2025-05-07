// backend/src/routes/gamesRoutes.ts
import express from 'express';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
} from '../controllers/gamesController';

const router = express.Router();

router.get('/',       getAllGames);
router.get('/:id',    getGameById);
router.post('/',      createGame);
router.put('/:id',    updateGame);
router.delete('/:id', deleteGame);

export default router;
