import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

declare const __dirname: string;
declare const process: any;

/**
 * Module Federation Shared Configuration (Bundle Optimization)
 * Strict singleton versioning to prevent library duplication between Shell & Remote MFEs.
 *
 * Usage: Used in module-federation.config.ts for Shell & Remotes
 */

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

let pkg: PackageJson = {};
try {
  // Resolve __dirname safely for both CJS and ESM contexts
  let dir: string;
  try {
    // ESM: use import.meta.url
    dir = path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // CJS fallback
    dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
  const pkgPath = path.resolve(dir, dir.endsWith('shared') ? '../package.json' : 'package.json');
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as PackageJson;
  }
} catch {
  // fallback
}
const dependencies: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

function getPackageName(key: string): string {
  if (key.startsWith('@')) {
    const parts = key.split('/');
    return `${parts[0]}/${parts[1]}`;
  }
  return key.split('/')[0];
}

function getRequiredVersion(key: string, defaultValue: string | boolean = 'auto'): string | boolean {
  const pkgName = getPackageName(key);
  const version = dependencies[pkgName];
  if (version) {
    return version;
  }
  return defaultValue;
}

const rawSharedMappings: Record<string, { singleton: boolean; strictVersion: boolean; requiredVersion: boolean | string; eager?: boolean }> = {
  // Angular Framework Core
  '@angular/core': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/core/primitives/signals': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/common': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/common/http': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/common/locales/vi': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/router': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/forms': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/forms/signals': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/animations': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/animations/browser': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/platform-browser': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/platform-browser/animations': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },

  // RxJS
  'rxjs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  'rxjs/operators': { singleton: true, strictVersion: false, requiredVersion: 'auto' },

  // UI Frameworks & Components
  'tds-ui': { singleton: true, strictVersion: false, requiredVersion: false },
  'ng-zorro-antd': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/overlay': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/portal': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/drag-drop': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/a11y': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/coercion': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/keycodes': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/platform': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/scrolling': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/collections': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/cdk/bidi': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/material': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  'ngx-toastr': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@ngx-loading-bar/core': { singleton: true, strictVersion: false, requiredVersion: 'auto' },

  // State Management & Auth
  '@ngrx/store': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@ngrx/effects': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@ngrx/entity': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@ngrx/signals': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@auth0/angular-jwt': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@ngx-translate/core': { singleton: true, strictVersion: false, requiredVersion: 'auto' },

  // Utility & Chart Libraries
  'apexcharts': { singleton: true, strictVersion: false, requiredVersion: false },
  'ng-apexcharts': { singleton: true, strictVersion: false, requiredVersion: false },
  'moment': { singleton: true, strictVersion: false, requiredVersion: false },
  'crypto-js': { singleton: true, strictVersion: false, requiredVersion: false },
  'swiper': { singleton: true, strictVersion: false, requiredVersion: false },
  'leaflet': { singleton: true, strictVersion: false, requiredVersion: false }
};

export const sharedMappings = new Proxy(rawSharedMappings, {
  has(target, key) {
    if (typeof key === 'string') {
      if (
        key.startsWith('@angular/cdk/') ||
        key.startsWith('@angular/material/') ||
        key.startsWith('@angular/') ||
        key.startsWith('@ngrx/signals/') ||
        key === '@ngrx/signals' ||
        key.startsWith('tds-ui/') ||
        key === 'tds-ui' ||
        key.startsWith('rxjs/') ||
        key === 'rxjs'
      ) {
        return true;
      }
    }
    return Reflect.has(target, key);
  },
  get(target, key) {
    if (typeof key === 'string') {
      if (
        key.startsWith('@angular/cdk/') ||
        key.startsWith('@angular/material/') ||
        key.startsWith('@angular/') ||
        key.startsWith('@ngrx/signals/') ||
        key === '@ngrx/signals' ||
        key.startsWith('tds-ui/') ||
        key === 'tds-ui' ||
        key.startsWith('rxjs/') ||
        key === 'rxjs'
      ) {
        return { singleton: true, strictVersion: false, requiredVersion: false };
      }
      if (Reflect.has(target, key)) {
        const item = Reflect.get(target, key);
        return {
          ...item,
          requiredVersion: false
        };
      }
    }
    return Reflect.get(target, key);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    return {
      enumerable: true,
      configurable: true,
      value: (sharedMappings as any)[prop]
    };
  }
// Cast to 'any' so it is assignable to Module Federation's `Shared` type,
// which accepts both array and object forms but is typed as array-only.
}) as unknown as any;

export interface SharedConfigItem {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string | boolean;
  eager?: boolean;
  [key: string]: unknown;
}

export const getSharedConfig = (libraryName: string, defaultConfig: SharedConfigItem) => {
  if (libraryName in sharedMappings) {
    const mapping = sharedMappings[libraryName];
    return {
      ...defaultConfig,
      ...mapping,
      requiredVersion: (mapping.requiredVersion === 'auto' && defaultConfig?.requiredVersion)
        ? defaultConfig.requiredVersion
        : mapping.requiredVersion
    };
  }
  return defaultConfig;
};

