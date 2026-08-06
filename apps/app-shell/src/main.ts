// Polyfill Angular & Webpack globals for Module Federation
if (typeof (globalThis as any).ngDevMode === 'undefined') {
  (globalThis as any).ngDevMode = {};
}
if (typeof (globalThis as any).ngJitMode === 'undefined') {
  (globalThis as any).ngJitMode = false;
}

// Async boundary — ALL shared packages must be imported AFTER this point
import('@nx/angular/mf').then(({ setRemoteDefinitions }) => {
  // Remote definitions use relative paths — proxied through shell's dev server
  // so actual remote URLs are never exposed to the browser
  setRemoteDefinitions({
    'mfe-auth': '/mfe-auth',
    'mfe-dashboard': '/mfe-dashboard',
    'mfe-reporting': '/mfe-reporting'
  });

  return import('./bootstrap');
}).catch((err) => console.error(err));
