import { InjectionToken } from '@angular/core';

/**
 * InjectionToken for global API Base URL configuration.
 * Allows apps/MFEs to provide custom API endpoints dynamically.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});
