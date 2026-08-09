import { withModuleFederation } from '@nx/module-federation/angular';
import moduleFederationConfig from './module-federation.config';
import * as webpack from 'webpack';

export default async function (config: any) {
  const wmf = await withModuleFederation(moduleFederationConfig, { dts: false });
  const updated = wmf(config);

  updated.plugins = updated.plugins.map((plugin: any) => {
    if (plugin?.name === 'NormalModuleReplacementPlugin' && plugin._args) {
      return new webpack.NormalModuleReplacementPlugin(plugin._args[0], plugin._args[1]);
    }
    return plugin;
  });

  return {
    ...updated,
    devServer: {
      ...(updated.devServer || {}),
      liveReload: false,
      hot: false
    }
  };
}
