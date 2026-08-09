import { loadRemote } from '@module-federation/enhanced/runtime';
import { RemoteStyleConfig } from '../../mfe/remote-style.model';

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

  try {
    const m = (await loadRemote<Record<string, unknown>>(remoteSpecifier)) as Record<string, unknown> | undefined;
    if (m) {
      if (m['appRoutes']) return m['appRoutes'] as T;
      if (m['default']) return m['default'] as T;

      const exportKeys = Object.keys(m);
      for (const key of exportKeys) {
        const exportedVal = m[key];
        if (typeof exportedVal === 'function' && (exportedVal as any).ɵcmp) {
          return exportedVal as T;
        }
      }

      const resolved = m['ProjectsComponent'] ?? m['SharedStylesComponent'] ?? m['CalendarComponent'] ?? (exportKeys.length > 0 ? m[exportKeys[0]] : m);
      return resolved as T;
    }
  } catch (err: unknown) {
    console.warn(`[loadRemoteModule] Remote module ${remoteSpecifier} not reachable:`, err);
  }

  return [] as unknown as T;
};
