import { EnvironmentProviders, Provider, makeEnvironmentProviders, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TDS_I18N, vi_VN } from 'tds-ui/i18n';
import { OverlayModule } from '@angular/cdk/overlay';
import { BidiModule } from '@angular/cdk/bidi';
import { A11yModule } from '@angular/cdk/a11y';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authorizationTokenInterceptorFn } from './infrastructure/http/interceptors/authorization-token.interceptor';

registerLocaleData(localeVi);

export interface CoreOptions {
  routes?: Routes;
}

export function provideCore(options?: CoreOptions): EnvironmentProviders {
  const providers: Array<Provider | EnvironmentProviders> = [
    importProvidersFrom(OverlayModule, BidiModule, A11yModule),
    provideHttpClient(withInterceptors([authorizationTokenInterceptorFn])),
    provideAnimations(),
    { provide: TDS_I18N, useValue: vi_VN }
  ];

  if (options?.routes) {
    providers.push(provideRouter(options.routes, withComponentInputBinding()));
  }

  return makeEnvironmentProviders(providers);
}
