import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TDS_I18N, vi_VN } from 'tds-ui/i18n';
import { RemoteEntryComponent } from './app/remote-entry/entry.component';
import { remoteRoutes } from './app/remote-entry/entry.routes';
import { provideRouter } from '@angular/router';

registerLocaleData(localeVi);

bootstrapApplication(RemoteEntryComponent, {
  providers: [
    provideRouter(remoteRoutes),
    provideAnimations(),
    { provide: TDS_I18N, useValue: vi_VN }
  ]
}).catch((err) => console.error(err));
