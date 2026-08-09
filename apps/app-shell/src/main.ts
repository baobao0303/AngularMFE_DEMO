// Polyfill Angular & Webpack globals for Module Federation
if (typeof (globalThis as any).ngDevMode === 'undefined') {
  (globalThis as any).ngDevMode = {};
}
if (typeof (globalThis as any).ngJitMode === 'undefined') {
  (globalThis as any).ngJitMode = false;
}

import { init } from '@module-federation/enhanced/runtime';

init({
  name: 'app-shell',
  remotes: [
    { name: 'mfe-auth', entry: '/mfe-auth/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_auth' },
    { name: 'mfe-dashboard', entry: '/mfe-dashboard/mf-manifest.json' },
    { name: 'mfe-reporting', entry: '/mfe-reporting/mf-manifest.json' }
  ]
});

import('./bootstrap').catch((err) => console.error(err));
