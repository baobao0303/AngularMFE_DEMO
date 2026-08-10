import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { BaseStoreState, buildKey, StoreHelper } from '@microfrontend/core';
import { AuthApiService } from '../services/auth.api.service';
import { AuthResponse, LoginReq } from '../models/auth.model';

type AuthState = BaseStoreState<AuthResponse>;

const initialState: AuthState = {
  loading: {},
  error: {},
  data: {}
};

export const AUTH_KEY_STORE = {
  LOGIN: buildKey({ feature: 'auth', scope: 'login', device: 'all' }),
  SSO_LOGIN: buildKey({ feature: 'auth', scope: 'sso-login', device: 'all' })
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed((store) => ({
    loginLoading: computed(() => !!store.loading()[AUTH_KEY_STORE.LOGIN] || !!store.loading()[AUTH_KEY_STORE.SSO_LOGIN]),
    loginResponse: computed(() => (store.data()[AUTH_KEY_STORE.LOGIN] || store.data()[AUTH_KEY_STORE.SSO_LOGIN]) as AuthResponse | undefined),
    loginError: computed(() => store.error()[AUTH_KEY_STORE.LOGIN] || store.error()[AUTH_KEY_STORE.SSO_LOGIN])
  })),
  withMethods((
    store,
    authApi = inject(AuthApiService)
  ) => ({
    login: StoreHelper.createRxMethod(
      store,
      AUTH_KEY_STORE.LOGIN,
      (request: LoginReq) => authApi.login(request)
    ),

    ssoLogin: StoreHelper.createRxMethod(
      store,
      AUTH_KEY_STORE.SSO_LOGIN,
      () => authApi.ssoLogin()
    )
  })),
  withHooks({
    // onInit() {},
    // onDestroy() {}
  })
);
