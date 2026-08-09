export default {
  name: 'mfe-reporting',
  remotes: {
    'mfe-dashboard': 'http://localhost:4202/mfe-dashboard/mf-manifest.json',
  },
  exposes: {
    './Routes': './apps/mfe-reporting/src/app/app.routes.ts',
    './SharedStyles': './apps/mfe-reporting/src/app/pages/shared-styles/shared-styles.component.ts',
  }
};
