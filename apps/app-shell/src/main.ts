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
    { name: 'mfe-auth', entry: 'http://localhost:4201/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_auth' },
    { name: 'mfe-dashboard', entry: 'http://localhost:4202/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_dashboard' },
    { name: 'mfe-reporting', entry: 'http://localhost:4203/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_reporting' }
  ]
});

import('./bootstrap').catch((err) => console.error(err));
