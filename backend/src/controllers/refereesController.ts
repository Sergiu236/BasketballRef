// backend/src/controllers/refereesController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Referee } from '../entities/Referee';
import { performOperation } from '../index';
import { broadcastEvent } from '../websocket/websocketServer';

const repo = AppDataSource.getRepository(Referee);

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/referees     ?page=1&limit=10
//                       ?league=Pro&age=35&grade=2&name=John
//                       ?sortBy=age&order=desc
// ──────────────────────────────────────────────────────────────────────────────
export const getAllReferees = async (req: Request, res: Response) => {
  try {
    const page  = parseInt((req.query.page  as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);

    const {
      league,
      age,
      grade,
      name,
      sortBy = 'id',
      order = 'asc',
    } = req.query as Record<string, string>;

    const qb = repo.createQueryBuilder('r');

    // ───── filtering ─────
    if (league) qb.andWhere('r.league = :league', { league });
    if (age)    qb.andWhere('r.age = :age',       { age: +age });
    if (grade)  qb.andWhere('r.grade = :grade',   { grade: +grade });
    if (name) {
      qb.andWhere(
        '(LOWER(r.firstName) LIKE :n OR LOWER(r.lastName) LIKE :n)',
        { n: `%${name.toLowerCase()}%` },
      );
    }

    // ───── sorting ─────
    const allowedSort = new Map([
      ['firstName', 'r.firstName'],
      ['lastName',  'r.lastName'],
      ['age',       'r.age'],
      ['grade',     'r.grade'],
      ['refereedGames', 'r.refereedGames'],
    ]);
    const sortColumn = allowedSort.get(sortBy) ?? 'r.id';
    qb.orderBy(sortColumn, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

    // ───── pagination ─────
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    res.json({
      data,
      total,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const getRefereeById = async (req: Request, res: Response) => {
  try {
    const ref = await repo.findOne({
      where: { id: +req.params.id },
      relations: ['games'],
    });
    if (!ref) return res.status(404).json({ error: 'Referee not found' });
    res.json(ref);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const createReferee = async (req: Request, res: Response) => {
  try {
    const numericFields = ['age', 'grade', 'refereedGames'];
    const negatives = numericFields.filter(
      (f) => typeof req.body[f] === 'number' && req.body[f] < 0,
    );
    if (negatives.length) {
      return res
        .status(400)
        .json({ error: 'Negative values are not allowed', fields: negatives });
    }

    const saved = await performOperation(async () => {
      const entity = repo.create(req.body as Partial<Referee>);
      const result = await repo.save(entity);
      broadcastEvent('refereeCreated', result);
      return result;
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const updateReferee = async (req: Request, res: Response) => {
  try {
    const updated = await performOperation(async () => {
      const pre = await repo.findOneBy({ id: +req.params.id });
      if (!pre) throw new Error('Referee not found');
      repo.merge(pre, req.body);
      const result = await repo.save(pre);
      broadcastEvent('refereeUpdated', result);
      return result;
    });
    res.json(updated);
  } catch (err: any) {
    if (err.message === 'Referee not found')
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const updateRefereePartial = updateReferee; // identical semantics

// ──────────────────────────────────────────────────────────────────────────────
export const deleteReferee = async (req: Request, res: Response) => {
  try {
    await performOperation(async () => {
      const ref = await repo.findOneBy({ id: +req.params.id });
      if (!ref) throw new Error('Referee not found');
      
      // Store the ID before removal since TypeORM's remove() clears the ID
      const refToEmit = { ...ref };
      
      await repo.remove(ref);
      
      // Broadcast using the copy with preserved ID
      broadcastEvent('refereeDeleted', refToEmit);
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'Referee not found')
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
export const healthCheckController = (_: Request, res: Response) =>
  res.json({ status: 'ok' });

// ──────────────────────────────────────────────────────────────────────────────
// Sync endpoint kept (offline batching). Each operation now hits the DB.
export const syncController = async (req: Request, res: Response) => {
  const { operations } = req.body;
  if (!Array.isArray(operations))
    return res.status(400).json({ error: 'Invalid operations array' });

  try {
    await performOperation(async () => {
      for (const op of operations) {
        const { type, payload } = op;
        if (type === 'create') {
          const created = await repo.save(repo.create(payload));
          broadcastEvent('refereeCreated', created);
        } else if (type === 'delete') {
          const existing = await repo.findOneBy({ id: payload.id });
          if (existing) {
            // Store a copy before deletion to preserve ID
            const existingCopy = { ...existing };
            await repo.remove(existing);
            broadcastEvent('refereeDeleted', existingCopy);
          }
        } else if (type === 'update' || type === 'patch') {
          const existing = await repo.findOneBy({ id: payload.id });
          if (existing) {
            repo.merge(existing, type === 'patch' ? payload.partialData : payload);
            const saved = await repo.save(existing);
            broadcastEvent('refereeUpdated', saved);
          }
        }
      }
    });
    res.json({ message: 'Sync processed', count: operations.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing sync' });
  }
};
