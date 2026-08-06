import '@angular/compiler';
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { TDS_I18N, vi_VN } from 'tds-ui/i18n';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import localeVi from '@angular/common/locales/vi';

registerLocaleData(localeVi);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    { provide: TDS_I18N, useValue: vi_VN }

  ]
}).catch((err) => console.error(err));
