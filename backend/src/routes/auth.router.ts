import { Router, Request, Response } from 'express';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const emailVal = email || 'admin@company.com';
  const nameVal = emailVal.split('@')[0];

  const user = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    email: emailVal,
    name: nameVal,
    role: 'Administrator'
  };

  res.json({
    user,
    token: `express_jwt_${user.id}_${Date.now()}`
  });
});

authRouter.post('/sso-login', (_req: Request, res: Response) => {
  const user = {
    id: 'usr_sso_' + Math.random().toString(36).substring(2, 9),
    email: 'sso.admin@mfe.com',
    name: 'sso.admin',
    role: 'Administrator'
  };

  res.json({
    user,
    token: `express_sso_jwt_${user.id}_${Date.now()}`
  });
});

authRouter.post('/reset-password', (req: Request, res: Response) => {
  const { email } = req.body || {};
  res.json({
    success: true,
    message: `Password reset instructions have been sent to ${email || 'your email'}.`
  });
});
