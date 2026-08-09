/**
 * Centralized configuration for Micro-frontend Ports and URLs.
 * Avoids duplication of hardcoded URLs across app-shell and MFEs.
 */
export const MFE_PORTS = {
  SHELL: 4200,
  AUTH: 4201,
  DASHBOARD: 4202,
  REPORTING: 4203,
  BACKEND: 3000,
} as const;

export const MFE_URLS = {
  SHELL: `http://localhost:${MFE_PORTS.SHELL}`,
  AUTH: `http://localhost:${MFE_PORTS.AUTH}`,
  DASHBOARD: `http://localhost:${MFE_PORTS.DASHBOARD}`,
  REPORTING: `http://localhost:${MFE_PORTS.REPORTING}`,
  BACKEND: `http://localhost:${MFE_PORTS.BACKEND}`,
} as const;

export const MFE_MANIFESTS = {
  AUTH: `${MFE_URLS.AUTH}/mf-manifest.json`,
  DASHBOARD: `${MFE_URLS.DASHBOARD}/mf-manifest.json`,
  REPORTING: `${MFE_URLS.REPORTING}/mf-manifest.json`,
} as const;
