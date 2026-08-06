import { withModuleFederation } from '@nx/module-federation/angular';
import moduleFederationConfig from './module-federation.config';

export default async function (config: any) {
  const wmf = await withModuleFederation(moduleFederationConfig, { dts: false });
  const updated = wmf(config);
  return {
    ...updated,
    devServer: {
      ...(updated.devServer || {}),
      liveReload: false,
      hot: false
    }
  };
}
