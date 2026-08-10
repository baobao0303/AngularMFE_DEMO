import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TDS_I18N, vi_VN } from 'tds-ui/i18n';
import { provideCore } from '@core';
import { appRoutes } from './app.routes';
import manifestJson from '../assets/federation.manifest.json';

registerLocaleData(localeVi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    provideCore({ remoteEndpoints: manifestJson as any }),
    { provide: TDS_I18N, useValue: vi_VN }
  ]
};
