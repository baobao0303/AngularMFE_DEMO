import { Router, Request, Response } from 'express';

export const configRouter = Router();

export interface MfeRemoteConfig {
  name: string;
  port: number;
  url: string;
  entry: string;
  entryGlobalName: string;
}

export type MfeRemoteEndpoints = Record<string, MfeRemoteConfig>;

const DEFAULT_REMOTES: MfeRemoteEndpoints = {
  'app-shell': {
    name: 'app-shell',
    port: 4200,
    url: process.env.MFE_APP_SHELL_URL || 'http://localhost:4200',
    entry: process.env.MFE_APP_SHELL_ENTRY || 'http://localhost:4200/remoteEntry.js',
    entryGlobalName: 'app_shell',
  },
  'mfe-auth': {
    name: 'mfe-auth',
    port: 4201,
    url: process.env.MFE_AUTH_URL || 'http://localhost:4201',
    entry: process.env.MFE_AUTH_ENTRY || 'http://localhost:4201/remoteEntry.js',
    entryGlobalName: 'mfe_auth',
  },
  'mfe-dashboard': {
    name: 'mfe-dashboard',
    port: 4202,
    url: process.env.MFE_DASHBOARD_URL || 'http://localhost:4202',
    entry: process.env.MFE_DASHBOARD_ENTRY || 'http://localhost:4202/remoteEntry.js',
    entryGlobalName: 'mfe_dashboard',
  },
  'mfe-reporting': {
    name: 'mfe-reporting',
    port: 4203,
    url: process.env.MFE_REPORTING_URL || 'http://localhost:4203',
    entry: process.env.MFE_REPORTING_ENTRY || 'http://localhost:4203/remoteEntry.js',
    entryGlobalName: 'mfe_reporting',
  },
};

/**
 * GET /api/config/remotes
 * Dynamic MFE Remote Manifest Service
 */
configRouter.get('/remotes', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEFAULT_REMOTES,
    timestamp: new Date().toISOString()
  });
});
