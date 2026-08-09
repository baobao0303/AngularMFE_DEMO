export default {
  name: 'mfe-reporting',
  remotes: {
    'mfe-dashboard': 'mfe_dashboard@http://localhost:4202/remoteEntry.js',
  },
  exposes: {
    './Routes': './apps/mfe-reporting/src/app/app.routes.ts',
    './SharedStyles': './apps/mfe-reporting/src/app/pages/shared-styles/shared-styles.component.ts',
  }
};
