import manifestJson from '../app-shell/src/assets/federation.manifest.json';

const MFE_REMOTES = ((manifestJson as any)?.default || manifestJson) as Record<string, any>;

export default {
  name: 'mfe-reporting',
  remotes: {
    'mfe-dashboard': `${MFE_REMOTES['mfe-dashboard'].entryGlobalName}@${MFE_REMOTES['mfe-dashboard'].entry}`,
  },
  exposes: {
    './Routes': './apps/mfe-reporting/src/app/app.routes.ts',
    './SharedStyles': './apps/mfe-reporting/src/app/pages/shared-styles/shared-styles.component.ts',
  }
};
