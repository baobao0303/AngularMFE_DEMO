// Polyfill Angular & Webpack globals for Module Federation
if (typeof (globalThis as any).ngDevMode === 'undefined') {
  (globalThis as any).ngDevMode = {};
}
if (typeof (globalThis as any).ngJitMode === 'undefined') {
  (globalThis as any).ngJitMode = false;
}

import { init } from '@module-federation/enhanced/runtime';
import { getModuleFederationRemotes } from '@core/lib/mfe/remote-endpoints.config';
import manifestJson from './assets/federation.manifest.json';

init({
  name: 'app-shell',
  remotes: getModuleFederationRemotes(manifestJson as any, 'app-shell')
});

import('./bootstrap').catch((err) => console.error(err));
