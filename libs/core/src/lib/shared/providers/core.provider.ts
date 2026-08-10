import { EnvironmentProviders, Provider, makeEnvironmentProviders, importProvidersFrom, provideAppInitializer, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TDS_I18N, vi_VN } from 'tds-ui/i18n';
import { OverlayModule } from '@angular/cdk/overlay';
import { BidiModule } from '@angular/cdk/bidi';
import { A11yModule } from '@angular/cdk/a11y';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authorizationTokenInterceptorFn } from '../../modules/api/interceptors/authorization-token.interceptor';
import { MfeRemoteConfig } from '../../mfe/remote-endpoints.config';
import { provideRemoteEndpoints } from '../../mfe/remote-endpoints.provider';
import { MfeManifestService } from '../../mfe/remote-endpoints.service';

registerLocaleData(localeVi);

export interface CoreOptions {
  routes?: Routes;
  remoteEndpoints?: Record<string, MfeRemoteConfig>;
  enableDynamicRemotes?: boolean;
  manifestApiUrl?: string;
}

export function provideCore(options?: CoreOptions): EnvironmentProviders {
  const providers: Array<Provider | EnvironmentProviders> = [
    importProvidersFrom(OverlayModule, BidiModule, A11yModule),
    provideHttpClient(withInterceptors([authorizationTokenInterceptorFn])),
    provideAnimations(),
    provideRemoteEndpoints(options?.remoteEndpoints),
    { provide: TDS_I18N, useValue: vi_VN }
  ];

  if (options?.enableDynamicRemotes !== false) {
    providers.push(
      provideAppInitializer(() => {
        const manifestService = inject(MfeManifestService);
        return manifestService.loadRemoteManifest(options?.manifestApiUrl);
      })
    );
  }

  if (options?.routes) {
    providers.push(provideRouter(options.routes, withComponentInputBinding()));
  }

  return makeEnvironmentProviders(providers);
}
