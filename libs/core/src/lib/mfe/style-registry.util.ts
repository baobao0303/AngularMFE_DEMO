import { StyleRegistryItem } from './remote-style.model';

const activeDynamicStyles = new Map<string, HTMLStyleElement>();

/**
 * Shared Library DOM Helper: Inject a dynamic style element into the document head.
 */
export function injectStyleElement(key: string, cssContent: string): void {
  if (typeof document === 'undefined') return;
  if (activeDynamicStyles.has(key)) return;

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-mfe-style-key', key);
  styleEl.textContent = cssContent;
  document.head.appendChild(styleEl);
  activeDynamicStyles.set(key, styleEl);
}

/**
 * Shared Library DOM Helper: Remove a dynamic style element cleanly from the document head.
 */
export function removeStyleElement(key: string): void {
  if (typeof document === 'undefined') return;
  const styleEl = activeDynamicStyles.get(key);
  if (styleEl) {
    styleEl.remove();
    activeDynamicStyles.delete(key);
  }
}

/**
 * Helper to execute loadStyle on a remote module or registry item.
 */
export async function executeRemoteLoadStyle(
  styleRegistry: Record<string, StyleRegistryItem>,
  targetClass?: string
): Promise<void> {
  if (typeof document === 'undefined') return;
  const key = targetClass || Object.keys(styleRegistry)[0];
  if (!key) return;

  const item = styleRegistry[key];
  if (item) {
    injectStyleElement(key, item.cssContent);
  }
}

/**
 * Helper to execute unloadStyle on a remote module or registry item.
 */
export function executeRemoteUnloadStyle(
  styleRegistry: Record<string, StyleRegistryItem>,
  targetClass?: string
): void {
  if (typeof document === 'undefined') return;
  const key = targetClass || Object.keys(styleRegistry)[0];
  if (key) {
    removeStyleElement(key);
  }
}
