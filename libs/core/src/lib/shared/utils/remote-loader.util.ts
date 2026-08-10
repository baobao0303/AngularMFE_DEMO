import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';
import { RemoteStyleConfig } from '../../mfe/remote-style.model';
import { MFE_REMOTES } from '../../mfe/remote-endpoints.config';

export interface RemoteModuleExports<T = unknown> {
  appRoutes?: T;
  default?: T;
  ProjectsComponent?: T;
  CalendarComponent?: T;
  SharedStylesComponent?: T;
  [key: string]: unknown;
}

/**
 * Abstract Base Class defining the contract for Remote Style Loading.
 */
export abstract class AbstractRemoteStyleLoader {
  public abstract loadRemoteStyle(config: RemoteStyleConfig): Promise<void>;
  public abstract unloadRemoteStyle(config: RemoteStyleConfig): void;
  public abstract isStyleLoaded(config: RemoteStyleConfig): boolean;
}

export const loadRemoteModule = async <T = unknown>(
  remoteName: string,
  exposedModule = './Routes'
): Promise<T> => {
  const isBrowser =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement === 'function';

  if (!isBrowser) {
    return [] as unknown as T;
  }

  const modulePath = exposedModule.startsWith('./') ? exposedModule.substring(2) : exposedModule;
  const remoteSpecifier = `${remoteName}/${modulePath}`;

  console.log(`[loadRemoteModule] 🚀 Loading remote module: "${remoteSpecifier}" (remoteName: "${remoteName}", exposedModule: "${exposedModule}")`);

  if (MFE_REMOTES[remoteName]) {
    try {
      registerRemotes([
        {
          name: remoteName,
          entry: MFE_REMOTES[remoteName].entry,
          type: 'global',
          entryGlobalName: MFE_REMOTES[remoteName].entryGlobalName
        }
      ]);
    } catch {
      // Ignore if already registered
    }
  }

  try {
    const m = (await loadRemote<Record<string, unknown>>(remoteSpecifier)) as Record<string, unknown> | undefined;
    if (m) {
      console.log(`[loadRemoteModule] ✅ Successfully fetched remote module "${remoteSpecifier}":`, m);

      if (typeof m['loadStyle'] === 'function' || typeof (m['default'] as any)?.loadStyle === 'function' || m['STYLE_REGISTRY']) {
        console.log(`[loadRemoteModule] 📦 Resolved style module for "${remoteSpecifier}"`);
        return m as T;
      }

      if (m['appRoutes']) {
        console.log(`[loadRemoteModule] 📦 Resolved export 'appRoutes' for "${remoteSpecifier}"`);
        return m['appRoutes'] as T;
      }
      if (m['default']) {
        console.log(`[loadRemoteModule] 📦 Resolved export 'default' for "${remoteSpecifier}"`);
        return m['default'] as T;
      }

      const exportKeys = Object.keys(m);
      for (const key of exportKeys) {
        const exportedVal = m[key];
        if (typeof exportedVal === 'function' && (exportedVal as any).ɵcmp) {
          console.log(`[loadRemoteModule] 📦 Resolved Angular component export '${key}' for "${remoteSpecifier}"`);
          return exportedVal as T;
        }
      }

      const resolved = m['ProjectsComponent'] ?? m['SharedStylesComponent'] ?? m['CalendarComponent'] ?? (exportKeys.length > 0 ? m[exportKeys[0]] : m);
      console.log(`[loadRemoteModule] 📦 Resolved fallback export for "${remoteSpecifier}":`, resolved);
      return resolved as T;
    }
  } catch (err: unknown) {
    console.warn(`[loadRemoteModule] ⚠️ Remote module ${remoteSpecifier} not reachable:`, err);
  }

  return [] as unknown as T;
};
