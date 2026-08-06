export default {
  name: 'mfe-dashboard',
  exposes: {
    './Routes': './apps/mfe-dashboard/src/app/app.routes.ts',
    './Projects': './apps/mfe-dashboard/src/app/pages/projects/projects.component.ts',
  }
};
