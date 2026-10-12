import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const users = storage.getUsers();
  const activeUser = storage.getActiveUser();
  res.json({ users, activeUser });
});

router.get('/active', (_req: Request, res: Response) => {
  res.json({ activeUser: storage.getActiveUser() });
});

router.post('/active', (req: Request, res: Response) => {
  const user = storage.setActiveUser(req.body.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ activeUser: user });
});

router.post('/', (req: Request, res: Response) => {
  const newUser = storage.createUser(req.body);
  res.status(201).json({ user: newUser });
});

export default router;
