// Master SCSS Bundle Exporter & Loader for mfe-dashboard
import { StyleRegistryItem, injectStyleElement, removeStyleElement } from '@core';
import './shared-theme.scss';
import './dark-glass.scss';
import './neon-cyan.scss';
import './corporate-blue.scss';

export const STYLE_REGISTRY: Record<string, StyleRegistryItem> = {
  'mfe-shared-card': {
    className: 'mfe-shared-card',
    themeName: 'Crimson Master Theme',
    cssContent: `.mfe-shared-card { background: #FFF5F6 !important; color: #131B2E !important; } .mfe-shared-card .mfe-styled-card { background: #FFFFFF !important; border: 1px solid #FAD0D6 !important; border-left: 4px solid #800A20 !important; color: #131B2E !important; box-shadow: 0 4px 20px -2px rgba(128, 10, 32, 0.1) !important; } .mfe-shared-card .mfe-styled-btn { background: #800A20 !important; color: #FFFFFF !important; font-weight: 700 !important; box-shadow: 0 4px 12px rgba(128, 10, 32, 0.3) !important; }`
  },
  'mfe-theme-dark-glass': {
    className: 'mfe-theme-dark-glass',
    themeName: 'Dark Glassmorphism Theme',
    cssContent: `.mfe-theme-dark-glass { background: #0F172A !important; color: #F8FAFC !important; } .mfe-theme-dark-glass .mfe-styled-card { background: rgba(30, 41, 59, 0.75) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; color: #F8FAFC !important; } .mfe-theme-dark-glass .mfe-styled-btn { background: linear-gradient(135deg, #38BDF8 0%, #0284C7 100%) !important; color: #0F172A !important; font-weight: 700 !important; }`
  },
  'mfe-theme-neon-cyan': {
    className: 'mfe-theme-neon-cyan',
    themeName: 'Cyberpunk Neon Cyan Theme',
    cssContent: `.mfe-theme-neon-cyan { background: #050B14 !important; color: #FFFFFF !important; } .mfe-theme-neon-cyan .mfe-styled-card { background: #0A1628 !important; border: 1px solid #00F0FF !important; color: #FFFFFF !important; } .mfe-theme-neon-cyan .mfe-styled-btn { background: #00F0FF !important; color: #050B14 !important; font-weight: 800 !important; }`
  },
  'mfe-theme-corporate-blue': {
    className: 'mfe-theme-corporate-blue',
    themeName: 'Corporate Royal Blue Theme',
    cssContent: `.mfe-theme-corporate-blue { background: #F0F4F8 !important; color: #1E293B !important; } .mfe-theme-corporate-blue .mfe-styled-card { background: #FFFFFF !important; border: 1px solid #CBD5E1 !important; border-top: 4px solid #2563EB !important; color: #1E293B !important; } .mfe-theme-corporate-blue .mfe-styled-btn { background: #2563EB !important; color: #FFFFFF !important; font-weight: 600 !important; }`
  }
};

export const styleLoaded = true;

/**
 * Explicit Load Style API using shared library helper from @microfrontend/core
 */
export async function loadStyle(targetClass?: string): Promise<void> {
  if (typeof document === 'undefined') return;
  const key = targetClass || 'mfe-shared-card';
  const item = STYLE_REGISTRY[key];
  if (item) {
    injectStyleElement(key, item.cssContent);
  }
}

/**
 * Explicit Unload Style API using shared library helper from @microfrontend/core
 */
export function unloadStyle(targetClass?: string): void {
  if (typeof document === 'undefined') return;
  const key = targetClass || 'mfe-shared-card';
  removeStyleElement(key);
}
