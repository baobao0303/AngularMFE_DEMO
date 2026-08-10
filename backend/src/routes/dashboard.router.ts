import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  initialProjects,
  initialBenchmarks,
  initialTeamPerformance,
  initialActivityLogs,
  initialKanbanTasks
} from '../data/db.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticateToken);

dashboardRouter.get('/projects', (_req: Request, res: Response) => {
  res.json(initialProjects);
});

dashboardRouter.get('/benchmarks', (_req: Request, res: Response) => {
  res.json(initialBenchmarks);
});

dashboardRouter.get('/team-performance', (_req: Request, res: Response) => {
  res.json(initialTeamPerformance);
});

dashboardRouter.get('/activity-logs', (req: Request, res: Response) => {
  const filterType = req.query['type'] as string | undefined;
  let items = [...initialActivityLogs];
  if (filterType && filterType !== 'All') {
    items = items.filter(item => item.type === filterType);
  }
  res.json(items);
});

dashboardRouter.get('/kanban-tasks', (req: Request, res: Response) => {
  const priority = req.query['priority'] as string | undefined;
  const tab = req.query['tab'] as string | undefined;
  const q = req.query['q'] as string | undefined;
  const sort = req.query['sort'] as string | undefined;

  let tasks = [...initialKanbanTasks];

  if (priority && priority !== 'all') {
    tasks = tasks.filter(t => t.priority === priority);
  }

  if (tab && tab !== 'all') {
    if (tab === 'active') tasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
    else if (tab === 'completed') tasks = tasks.filter(t => t.status === 'completed');
    else if (tab === 'on_hold') tasks = tasks.filter(t => t.status === 'in_review');
  }

  if (q) {
    const search = q.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
  }

  if (sort === 'title') {
    tasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'priority') {
    const pOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    tasks.sort((a, b) => (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2));
  }

  res.json(tasks);
});
