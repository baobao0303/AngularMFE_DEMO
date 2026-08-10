import { Injectable } from '@angular/core';
import { loadRemoteModule, AbstractRemoteStyleLoader } from '../shared/utils/remote-loader.util';
import { RemoteStyleConfig } from './remote-style.model';
import { injectStyleElement, removeStyleElement } from './style-registry.util';

export function applyCssScope(scopeClass?: string, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined' || !scopeClass || !targetElement) return;
  if (!targetElement.classList.contains(scopeClass)) {
    targetElement.classList.add(scopeClass);
  }
}

export function removeCssScope(scopeClass?: string, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined' || !scopeClass || !targetElement) return;
  if (targetElement.classList.contains(scopeClass)) {
    targetElement.classList.remove(scopeClass);
  }
}

/**
 * Concrete RemoteStyleService implementing AbstractRemoteStyleLoader contract.
 * Cleaned: No hardcoded fallback class names or exposed modules for reliable testing.
 */
@Injectable({ providedIn: 'root' })
export class RemoteStyleService extends AbstractRemoteStyleLoader {
  private readonly loadedStyles = new Map<string, { unloadStyle?: (className?: string) => void }>();

  public async loadRemoteStyle(config: RemoteStyleConfig): Promise<void> {
    if (!config || !config.mfeName) {
      console.warn('[RemoteStyleService] Cannot load style: Missing required mfeName in RemoteStyleConfig');
      return;
    }

    const remoteName = config.mfeName;
    const exposedModule = config.exposedModule || './SharedStyle';
    const targetClass = config.className;
    const key = targetClass ? `${remoteName}:${exposedModule}:${targetClass}` : `${remoteName}:${exposedModule}`;

    console.log(`[RemoteStyleService] 🎨 Requesting remote style load for key "${key}":`, config);

    if (this.loadedStyles.has(key)) {
      console.log(`[RemoteStyleService] ℹ️ Style key "${key}" already loaded in cache.`);
      return;
    }

    try {
      const styleModule = await loadRemoteModule<Record<string, unknown>>(remoteName, exposedModule);

      const loadFn = typeof styleModule['loadStyle'] === 'function'
        ? (styleModule['loadStyle'] as (cls?: string) => Promise<void>)
        : typeof (styleModule['default'] as any)?.loadStyle === 'function'
        ? ((styleModule['default'] as any).loadStyle as (cls?: string) => Promise<void>)
        : undefined;

      const unloadFn = typeof styleModule['unloadStyle'] === 'function'
        ? (styleModule['unloadStyle'] as (cls?: string) => void)
        : typeof (styleModule['default'] as any)?.unloadStyle === 'function'
        ? ((styleModule['default'] as any).unloadStyle as (cls?: string) => void)
        : undefined;

      if (loadFn) {
        console.log(`[RemoteStyleService] 💉 Executing loadStyle('${targetClass || ''}') on styleModule from "${remoteName}/${exposedModule}"`);
        await loadFn(targetClass);
        this.loadedStyles.set(key, { unloadStyle: unloadFn });
      } else {
        console.log(`[RemoteStyleService] ℹ️ styleModule from "${remoteName}/${exposedModule}" loaded without explicit loadStyle function.`);
        this.loadedStyles.set(key, {});
      }
    } catch (err) {
      console.warn(`[RemoteStyleService] ⚠️ Error loading remote style for ${remoteName}/${exposedModule}:`, err);
    }
  }

  public unloadRemoteStyle(config: RemoteStyleConfig): void {
    if (!config || !config.mfeName) return;

    const remoteName = config.mfeName;
    const exposedModule = config.exposedModule || './SharedStyle';
    const targetClass = config.className;
    const key = targetClass ? `${remoteName}:${exposedModule}:${targetClass}` : `${remoteName}:${exposedModule}`;

    console.log(`[RemoteStyleService] 🗑️ Unloading remote style for key "${key}":`, config);

    const loaded = this.loadedStyles.get(key);
    if (loaded) {
      if (loaded.unloadStyle) {
        console.log(`[RemoteStyleService] 🧹 Executing unloadStyle('${targetClass || ''}') for key "${key}"`);
        loaded.unloadStyle(targetClass);
      }
      this.loadedStyles.delete(key);
    }
  }

  public isStyleLoaded(config: RemoteStyleConfig): boolean {
    if (!config || !config.mfeName) return false;
    const remoteName = config.mfeName;
    const exposedModule = config.exposedModule || './SharedStyle';
    const targetClass = config.className;
    const key = targetClass ? `${remoteName}:${exposedModule}:${targetClass}` : `${remoteName}:${exposedModule}`;
    return this.loadedStyles.has(key);
  }

  // Backward compatibility method for legacy callers
  public async loadModuleStyle(
    remoteName: string,
    _exportName?: string,
    scopeClass?: string,
    exposedModule = './SharedStyle'
  ): Promise<void> {
    return this.loadRemoteStyle({
      mfeName: remoteName,
      exposedModule,
      className: scopeClass,
      styleType: 'js-module'
    });
  }

  public unloadModuleStyle(remoteName: string, exposedModule = './SharedStyle'): void {
    this.unloadRemoteStyle({
      mfeName: remoteName,
      exposedModule
    });
  }

  public isLoaded(remoteName: string, exposedModule = './SharedStyle'): boolean {
    return this.isStyleLoaded({
      mfeName: remoteName,
      exposedModule
    });
  }
}
