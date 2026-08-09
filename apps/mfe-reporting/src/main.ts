import { init } from '@module-federation/enhanced/runtime';

// Polyfill Angular & Webpack globals for Module Federation
if (typeof (globalThis as any).ngDevMode === 'undefined') {
  (globalThis as any).ngDevMode = {};
}
if (typeof (globalThis as any).ngJitMode === 'undefined') {
  (globalThis as any).ngJitMode = false;
}

init({
  name: 'mfe-reporting',
  remotes: [
    { name: 'mfe-dashboard', entry: 'http://localhost:4202/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_dashboard' }
  ]
});

// Async boundary — ALL shared packages must be imported AFTER this point
import('./bootstrap');
