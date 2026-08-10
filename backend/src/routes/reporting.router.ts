import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { initialDetailedReports } from '../data/db.js';

export const reportingRouter = Router();
reportingRouter.use(authenticateToken);

reportingRouter.get('/detailed-reports', (req: Request, res: Response) => {
  const statusParam = req.query['status'] as string | undefined;
  let reports = [...initialDetailedReports];

  if (statusParam && statusParam !== 'All') {
    reports = reports.filter(item => item.status === statusParam);
  }

  res.json(reports);
});
