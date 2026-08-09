import { createConfig } from '@ng-rsbuild/plugin-angular';
import moduleFederationConfig from './module-federation.config';
import { sharedMappings } from '../../shared/federation.shared';
import * as path from 'path';

const appDir = path.resolve(process.cwd(), 'apps/mfe-auth');

export default await createConfig({
  options: {
    root: process.cwd(),
    browser: 'apps/mfe-auth/src/main.ts',
    index: 'apps/mfe-auth/src/index.html',
    tsConfig: 'apps/mfe-auth/tsconfig.app.json',
    styles: ['apps/mfe-auth/src/styles.scss'],
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
      port: 4201,
      proxy: {
        '/api': {
          target: 'http://localhost:4200',
          changeOrigin: true,
        },
      },
    },
    output: {
      assetPrefix: '/mfe-auth/',
    },
    tools: {
      rspack: {
        output: {
          uniqueName: 'mfe_auth',
          publicPath: '/mfe-auth/',
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
        name: 'mfe-auth',
        library: { type: 'global', name: 'mfe_auth' },
        filename: 'remoteEntry.js',
        shared: sharedMappings,
      },
    },
  },
});
