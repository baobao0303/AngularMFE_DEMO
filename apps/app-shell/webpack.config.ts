import { withModuleFederation } from '@nx/module-federation/angular';
import moduleFederationConfig from './module-federation.config';
import * as webpack from 'webpack';

export default async function (config: any) {
  const wmf = await withModuleFederation(moduleFederationConfig, { dts: false });
  const updated = wmf(config);

  // Workaround for Nx bug: @nx/module-federation/angular accidentally includes an Rspack plugin.
  // We convert it back to a Webpack plugin here.
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
      hot: false,
      // Reverse proxy: hide actual remote URLs from the browser
      proxy: [
        {
          context: ['/mfe-auth'],
          target: 'http://localhost:4201',
          pathRewrite: { '^/mfe-auth': '' },
          changeOrigin: true
        },
        {
          context: ['/mfe-dashboard'],
          target: 'http://localhost:4202',
          pathRewrite: { '^/mfe-dashboard': '' },
          changeOrigin: true
        },
        {
          context: ['/mfe-reporting'],
          target: 'http://localhost:4203',
          pathRewrite: { '^/mfe-reporting': '' },
          changeOrigin: true
        }
      ]
    }
  };
}
