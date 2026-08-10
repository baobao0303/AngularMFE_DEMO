import { ModuleFederationConfig } from '@nx/module-federation';
import manifestJson from './src/assets/federation.manifest.json';

const MFE_REMOTES = manifestJson as Record<string, any>;

const config: ModuleFederationConfig = {
  name: 'app-shell',
  remotes: Object.values(MFE_REMOTES)
    .filter(r => r.name !== 'app-shell')
    .map(r => [r.name, r.entry])
};

export default config;
