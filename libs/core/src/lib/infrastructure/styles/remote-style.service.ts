import { Injectable } from '@angular/core';
import { RemoteStyleOptions, RemoteStyleContract } from './remote-style.model';

/**
 * Utility helper to safely add a CSS scope class to document body or target container,
 * preventing global CSS pollution across Micro-Frontends.
 */
export function applyCssScope(scopeClass?: string, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined' || !scopeClass) return;
  const container = targetElement || document.body;
  if (!container.classList.contains(scopeClass)) {
    container.classList.add(scopeClass);
  }
}

/**
 * Utility helper to safely remove a CSS scope class from document body or target container.
 */
export function removeCssScope(scopeClass?: string, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined' || !scopeClass) return;
  const container = targetElement || document.body;
  if (container.classList.contains(scopeClass)) {
    container.classList.remove(scopeClass);
  }
}

/**
 * 1-Way Cross-Domain Stylesheet Injector.
 * Dynamically injects a remote CSS stylesheet URL into document head.
 */
export function injectRemoteStylesheet(url: string, elementId = 'remote-master-shell-theme'): void {
  if (typeof document === 'undefined' || !url) return;
  let linkEl = document.getElementById(elementId) as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = elementId;
    linkEl.rel = 'stylesheet';
    linkEl.type = 'text/css';
    document.head.appendChild(linkEl);
  }
  if (linkEl.href !== url) {
    linkEl.href = url;
  }
}

/**
 * 1-Way Dynamic CSS Variables Applier.
 */
export function applyCssVariables(variables: Record<string, string>, targetElement?: HTMLElement): void {
  if (typeof document === 'undefined' || !variables) return;
  const container = targetElement || document.documentElement;
  Object.keys(variables).forEach((key) => {
    const propertyName = key.startsWith('--') ? key : `--${key}`;
    container.style.setProperty(propertyName, String(variables[key]));
  });
}

/**
 * DOM Stylesheet Scanner Utility.
 */
export function extractCssByScopeClass(scopeClass: string): string {
  if (typeof document === 'undefined' || !scopeClass) return '';
  const cssRules: string[] = [];
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        Array.from(rules).forEach((rule) => {
          if (rule.cssText && rule.cssText.includes(scopeClass)) {
            cssRules.push(rule.cssText);
          }
        });
      }
    } catch {
      // Ignore cross-origin stylesheet CORS restrictions
    }
  });
  return cssRules.join('\n');
}

/**
 * Abstract Base Loader Service defining contracts for loading MFE styles dynamically.
 */
@Injectable({ providedIn: 'root' })
export abstract class BaseRemoteStyleLoader {
  public abstract loadModuleStyle(
    remoteName: string,
    exportName?: string,
    scopeClass?: string,
    exposedModule?: string,
    remoteUrl?: string
  ): Promise<void>;

  public async loadMultipleStyles(remotes: RemoteStyleOptions[]): Promise<void> {
    await Promise.all(
      remotes.map((opt) =>
        this.loadModuleStyle(opt.remoteName, opt.exportName, opt.scopeClass, opt.exposedModule, opt.remoteUrl)
      )
    );
  }

  public abstract isLoaded(remoteName: string, exposedModule?: string): boolean;
}
