import { init } from '@module-federation/enhanced/runtime';
import { getModuleFederationRemotes } from '@core/lib/mfe/remote-endpoints.config';
import manifestJson from '../../app-shell/src/assets/federation.manifest.json';

// Polyfill Angular & Webpack globals for Module Federation
if (typeof (globalThis as any).ngDevMode === 'undefined') {
  (globalThis as any).ngDevMode = {};
}
if (typeof (globalThis as any).ngJitMode === 'undefined') {
  (globalThis as any).ngJitMode = false;
}

init({
  name: 'mfe-reporting',
  remotes: getModuleFederationRemotes(manifestJson as any, 'mfe-reporting')
});

// Async boundary — ALL shared packages must be imported AFTER this point
import('./bootstrap');
