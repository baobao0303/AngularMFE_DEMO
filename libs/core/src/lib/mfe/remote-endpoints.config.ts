export interface MfeRemoteConfig {
  name: string;
  port: number;
  url: string;
  entry: string;
  entryGlobalName: string;
}

export type MfeRemoteEndpoints = Record<string, MfeRemoteConfig>;

export const DEFAULT_MFE_REMOTES: MfeRemoteEndpoints = {
  'app-shell': {
    name: 'app-shell',
    port: 4200,
    url: 'http://localhost:4200',
    entry: 'http://localhost:4200/remoteEntry.js',
    entryGlobalName: 'app_shell',
  },
  'mfe-auth': {
    name: 'mfe-auth',
    port: 4201,
    url: 'http://localhost:4201',
    entry: 'http://localhost:4201/remoteEntry.js',
    entryGlobalName: 'mfe_auth',
  },
  'mfe-dashboard': {
    name: 'mfe-dashboard',
    port: 4202,
    url: 'http://localhost:4202',
    entry: 'http://localhost:4202/remoteEntry.js',
    entryGlobalName: 'mfe_dashboard',
  },
  'mfe-reporting': {
    name: 'mfe-reporting',
    port: 4203,
    url: 'http://localhost:4203',
    entry: 'http://localhost:4203/remoteEntry.js',
    entryGlobalName: 'mfe_reporting',
  },
};

export const MFE_REMOTES: MfeRemoteEndpoints = DEFAULT_MFE_REMOTES;

/** Helper to convert MFE Manifest Record into Module Federation init() remotes array */
export const getModuleFederationRemotes = (
  manifest?: MfeRemoteEndpoints,
  excludeAppName?: string
) =>
  Object.values(manifest || DEFAULT_MFE_REMOTES)
    .filter(r => r.name !== excludeAppName && r.name !== 'app-shell')
    .map(r => ({
      name: r.name,
      entry: r.entry,
      type: 'global' as const,
      entryGlobalName: r.entryGlobalName,
    }));
