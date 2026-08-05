import { composePlugins, withNx, withWeb } from '@nx/rspack';
import { withModuleFederation } from '@nx/module-federation/rspack';
import moduleFederationConfig from './module-federation.config';

export default composePlugins(
  withNx(),
  withWeb(),
  withModuleFederation(moduleFederationConfig)
);
