// backend/src/controllers/gamesController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Game } from '../entities/Game';
import { Referee } from '../entities/Referee';
import { performOperation } from '../index';
import { broadcastEvent } from '../websocket/websocketServer';

const repo = AppDataSource.getRepository(Game);

// ──────────────────────────────────────────────────────────────────────────────
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const page  = parseInt((req.query.page  as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);

    const { date, location, status, referee, sortBy = 'date', order = 'asc' } =
      req.query as Record<string, string>;

    const qb = repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.referee', 'r');

    // filters
    if (date)      qb.andWhere('CONVERT(date, g.date) = :d', { d: date });
    if (location)  qb.andWhere('g.location = :loc', { loc: location });
    if (status)    qb.andWhere('g.status = :st', { st: status });
    if (referee)   qb.andWhere('g.refereeId = :rid', { rid: +referee });

    // sorting
    const allowed = new Map([
      ['date', 'g.date'],
      ['location', 'g.location'],
      ['status', 'g.status'],
    ]);
    qb.orderBy(allowed.get(sortBy) ?? 'g.date', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

    // pagination
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    res.json({ data, total, hasMore: page * limit < total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// New controller method to get games by referee ID
// ──────────────────────────────────────────────────────────────────────────────
export const getGamesByRefereeId = async (req: Request, res: Response) => {
  try {
    const refereeId = +req.params.refereeId;
    
    // First check if the referee exists
    const refRepo = AppDataSource.getRepository(Referee);
    const refereeExists = await refRepo.findOneBy({ id: refereeId });
    
    if (!refereeExists) {
      return res.status(404).json({ error: 'Referee not found' });
    }
    
    // Then get their games
    const games = await repo.find({
      where: { referee: { id: refereeId } },
      order: { date: 'DESC' },
      relations: ['referee']
    });
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games by referee ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const getGameById = async (req: Request, res: Response) => {
  try {
    const game = await repo.findOne({
      where: { id: +req.params.id },
      relations: ['referee'],
    });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const createGame = async (req: Request, res: Response) => {
  try {
    const saved = await performOperation(async () => {
      // ensure referee exists
      const refRepo = AppDataSource.getRepository(Referee);
      const ref = await refRepo.findOneBy({ id: req.body.refereeId });
      if (!ref) throw new Error('Referee not found');

      const entity = repo.create({ ...req.body, referee: ref });
      const result = await repo.save(entity);
      broadcastEvent('gameCreated', result);
      return result;
    });
    res.status(201).json(saved);
  } catch (err: any) {
    if (err.message === 'Referee not found')
      return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const updateGame = async (req: Request, res: Response) => {
  try {
    const updated = await performOperation(async () => {
      const game = await repo.findOneBy({ id: +req.params.id });
      if (!game) throw new Error('Game not found');

      // if refereeId changed, validate
      if (req.body.refereeId && req.body.refereeId !== game.referee?.id) {
        const ref = await AppDataSource
          .getRepository(Referee)
          .findOneBy({ id: req.body.refereeId });
        if (!ref) throw new Error('Referee not found');
        game.referee = ref;
      }

      repo.merge(game, req.body);
      const saved = await repo.save(game);
      broadcastEvent('gameUpdated', saved);
      return saved;
    });
    res.json(updated);
  } catch (err: any) {
    if (err.message === 'Game not found' || err.message === 'Referee not found')
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const deleteGame = async (req: Request, res: Response) => {
  try {
    await performOperation(async () => {
      const game = await repo.findOneBy({ id: +req.params.id });
      if (!game) throw new Error('Game not found');
      await repo.remove(game);
      broadcastEvent('gameDeleted', game);
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'Game not found')
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
