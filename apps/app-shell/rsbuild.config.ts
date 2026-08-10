import { createConfig } from '@ng-rsbuild/plugin-angular';
import moduleFederationConfig from './module-federation.config';
import { sharedMappings } from '../../shared/federation.shared';
import manifestJson from './src/assets/federation.manifest.json';
import * as path from 'path';

const MFE_REMOTES = ((manifestJson as any)?.default || manifestJson) as Record<string, any>;
const mfeConfig = MFE_REMOTES['app-shell'];

const appDir = path.resolve(process.cwd(), 'apps/app-shell');

export default await createConfig({
  options: {
    root: process.cwd(),
    browser: 'apps/app-shell/src/main.ts',
    index: 'apps/app-shell/src/index.html',
    tsConfig: 'apps/app-shell/tsconfig.app.json',
    styles: ['apps/app-shell/src/styles.scss'],
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
      port: MFE_REMOTES['app-shell'].port,
      proxy: {
        '/mfe-auth': {
          target: MFE_REMOTES['mfe-auth'].url,
          pathRewrite: { '^/mfe-auth': '' },
          changeOrigin: true,
        },
        '/mfe-dashboard': {
          target: MFE_REMOTES['mfe-dashboard'].url,
          pathRewrite: { '^/mfe-dashboard': '' },
          changeOrigin: true,
        },
        '/mfe-reporting': {
          target: MFE_REMOTES['mfe-reporting'].url,
          pathRewrite: { '^/mfe-reporting': '' },
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    tools: {
      rspack: {
        resolve: {
          fallback: {
            path: false,
            'node:path': false,
          },
        },
        output: {
          uniqueName: 'app_shell',
          publicPath: '/',
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
        name: 'app-shell',
        shared: sharedMappings,
      },
    },
  },
});
