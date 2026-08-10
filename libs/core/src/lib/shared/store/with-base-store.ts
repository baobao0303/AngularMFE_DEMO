import { withState } from '@ngrx/signals';
import { BaseStoreState } from './base-store.state';

export function withBaseStore<T = any>(initialState?: BaseStoreState<T>) {
  return withState<BaseStoreState<T>>(
    initialState ?? {
      loading: {},
      error: {},
      data: {}
    }
  );
}

