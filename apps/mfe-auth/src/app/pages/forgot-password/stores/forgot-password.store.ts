import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { BaseStoreState, buildKey, StoreHelper } from '@microfrontend/core';
import { ForgotPasswordApiService } from '../services/forgot-password.api.service';
import { ResetPasswordReq, ResetPasswordRes } from '../models/forgot-password.model';

type ForgotPasswordState = BaseStoreState<ResetPasswordRes>;

const initialState: ForgotPasswordState = {
  loading: {},
  error: {},
  data: {}
};

export const FORGOT_PASSWORD_KEY_STORE = {
  RESET_PASSWORD: buildKey({ feature: 'forgot-password', scope: 'reset-password', device: 'all' })
};

export const ForgotPasswordStore = signalStore(
  { providedIn: 'root' },
  withState<ForgotPasswordState>(initialState),
  withComputed((store) => ({
    resetLoading: computed(() => !!store.loading()[FORGOT_PASSWORD_KEY_STORE.RESET_PASSWORD]),
    resetResponse: computed(() => store.data()[FORGOT_PASSWORD_KEY_STORE.RESET_PASSWORD] as ResetPasswordRes | undefined),
    resetError: computed(() => store.error()[FORGOT_PASSWORD_KEY_STORE.RESET_PASSWORD])
  })),
  withMethods((
    store,
    api = inject(ForgotPasswordApiService)
  ) => ({
    sendPasswordReset: StoreHelper.createRxMethod(
      store,
      FORGOT_PASSWORD_KEY_STORE.RESET_PASSWORD,
      (request: ResetPasswordReq) => api.sendPasswordReset(request)
    )
  })),
  withHooks({
    // onInit() {},
    // onDestroy() {}
  })
);
