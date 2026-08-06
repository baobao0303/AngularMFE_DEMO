import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BaseStorageService } from './base/base-storage.service';
import { StorageService } from './infrastructure/storage.service';
import { BaseEventBusService } from './base/base-event-bus.service';
import { EventBusService } from './infrastructure/event-bus.service';
import { BaseApiService } from './base/base-api.service';
import { ApiService } from './infrastructure/api.service';
import { BaseLoadingService } from './base/base-loading.service';
import { LoadingService } from './infrastructure/loading.service';
import { authorizationTokenInterceptorFn } from './infrastructure/authorization-token.interceptor';
import { mockApiInterceptor } from './infrastructure/mock-api.interceptor';

/**
 * Single, centralized provider function for all core application services and HTTP interceptors across Micro-Frontends.
 */
export function provideCore(): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(withInterceptors([authorizationTokenInterceptorFn, mockApiInterceptor])),
    StorageService,
    EventBusService,
    ApiService,
    LoadingService,
    { provide: BaseStorageService, useExisting: StorageService },
    { provide: BaseEventBusService, useExisting: EventBusService },
    { provide: BaseApiService, useExisting: ApiService },
    { provide: BaseLoadingService, useExisting: LoadingService }
  ];
}
