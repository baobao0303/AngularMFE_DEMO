import { InjectionToken, Provider } from '@angular/core';
import { MfeRemoteConfig, MfeRemoteEndpoints } from './remote-endpoints.config';

/** Angular InjectionToken for Remote Endpoints */
export const REMOTE_ENDPOINTS_TOKEN = new InjectionToken<MfeRemoteEndpoints>(
  'REMOTE_ENDPOINTS_TOKEN',
  {
    providedIn: 'root',
    factory: () => ({}),
  }
);

/** Angular Provider function to inject custom remote endpoints */
export function provideRemoteEndpoints(customRemotes?: MfeRemoteEndpoints): Provider {
  return {
    provide: REMOTE_ENDPOINTS_TOKEN,
    useValue: customRemotes || {},
  };
}
