import { createConfig } from '@ng-rsbuild/plugin-angular';
import moduleFederationConfig from './module-federation.config';
import { sharedMappings } from '../../shared/federation.shared';
import manifestJson from '../app-shell/src/assets/federation.manifest.json';
import * as path from 'path';

const MFE_REMOTES = ((manifestJson as any)?.default || manifestJson) as Record<string, any>;
const mfeConfig = MFE_REMOTES['mfe-reporting'];

export default await createConfig({
  options: {
    root: process.cwd(),
    browser: 'apps/mfe-reporting/src/main.ts',
    index: 'apps/mfe-reporting/src/index.html',
    tsConfig: 'apps/mfe-reporting/tsconfig.app.json',
    styles: ['apps/mfe-reporting/src/styles.scss'],
    inlineStyleLanguage: 'scss',
    assets: [],
    outputHashing: 'none',
    define: {
      ngJitMode: 'false',
    },
    stylePreprocessorOptions: {
      includePaths: [path.resolve(process.cwd(), 'node_modules'), path.resolve(process.cwd(), 'node_modules/tds-ui')],
    },
  },
  rsbuildConfigOverrides: {
    dev: {
      hmr: true,
      liveReload: true,
    },
    server: {
      port: mfeConfig.port,
      proxy: {
        '/api': {
          target: MFE_REMOTES['app-shell'].url,
          changeOrigin: true,
        },
      },
    },
    output: {
      assetPrefix: `${mfeConfig.url}/`,
    },
    tools: {
      rspack: {
        output: {
          uniqueName: mfeConfig.entryGlobalName,
          publicPath: `${mfeConfig.url}/`,
        },
        optimization: {
          splitChunks: {
            chunks: 'async',
            minSize: 50000,
            maxSize: 500000,
            minChunks: 1,
            maxAsyncRequests: 10,
            cacheGroups: {
              angularVendor: {
                test: /[\\/]node_modules[\\/]@angular[\\/]/,
                name: 'vendors-angular',
                chunks: 'async',
                priority: 20,
                reuseExistingChunk: true,
              },
              cdkVendor: {
                test: /[\\/]node_modules[\\/]@angular[\\/]cdk[\\/]/,
                name: 'vendors-angular-cdk',
                chunks: 'async',
                priority: 25,
                reuseExistingChunk: true,
              },
              rxjsVendor: {
                test: /[\\/]node_modules[\\/]rxjs[\\/]/,
                name: 'vendors-rxjs',
                chunks: 'async',
                priority: 20,
                reuseExistingChunk: true,
              },
              ngrxVendor: {
                test: /[\\/]node_modules[\\/]@ngrx[\\/]/,
                name: 'vendors-ngrx',
                chunks: 'async',
                priority: 20,
                reuseExistingChunk: true,
              },
              uiVendor: {
                test: /[\\/]node_modules[\\/](ng-zorro-antd|ngx-toastr|@ngx-loading-bar)[\\/]/,
                name: 'vendors-ui',
                chunks: 'async',
                priority: 15,
                reuseExistingChunk: true,
              },
              defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors-common',
                chunks: 'async',
                priority: 10,
                reuseExistingChunk: true,
                minSize: 20000,
              },
            },
          },
        },
      },
    },
    moduleFederation: {
      options: {
        ...moduleFederationConfig,
        name: 'mfe-reporting',
        library: { type: 'global', name: 'mfe_reporting' },
        filename: 'remoteEntry.js',
        shared: sharedMappings,
      },
    },
  },
});
