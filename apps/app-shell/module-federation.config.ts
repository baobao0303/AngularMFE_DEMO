import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'app-shell',
  remotes: [
    ['mfe-auth', 'http://localhost:4201/mf-manifest.json'],
    ['mfe-dashboard', 'http://localhost:4202/mf-manifest.json'],
    ['mfe-reporting', 'http://localhost:4203/mf-manifest.json']
  ]
};

export default config;
