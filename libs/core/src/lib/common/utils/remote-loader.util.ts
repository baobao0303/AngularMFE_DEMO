import { loadRemote } from '@module-federation/enhanced/runtime';

export interface RemoteModuleExports<T = unknown> {
  appRoutes?: T;
  default?: T;
  ProjectsComponent?: T;
  CalendarComponent?: T;
  [key: string]: unknown;
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
    const m = (await loadRemote<RemoteModuleExports<T>>(remoteSpecifier)) as RemoteModuleExports<T> | undefined;
    if (m) {
      const resolved = m.appRoutes ?? m.default ?? m.ProjectsComponent ?? m.CalendarComponent ?? m;
      return resolved as T;
    }
  } catch (err: unknown) {
    console.warn(`[loadRemoteModule] Remote module ${remoteSpecifier} not reachable:`, err);
  }

  return [] as unknown as T;
};
