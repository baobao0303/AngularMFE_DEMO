import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export type KeyResolver<TReq = any> = string | ((arg: TReq) => string);

export class StoreHelper {
  static createRxMethod<TReq = any, TRes = any>(
    store: any,
    keyOrResolver: KeyResolver<TReq>,
    project: (arg: TReq) => Observable<TRes>
  ) {
    return rxMethod<TReq>(
      switchMap((arg) => {
        const key =
          typeof keyOrResolver === 'function'
            ? keyOrResolver(arg)
            : keyOrResolver;

        patchState(store, (state: any) => ({
          loading: { ...state?.loading, [key]: true },
          error: { ...state?.error, [key]: null }
        }));

        return project(arg).pipe(
          tap((response) => {
            patchState(store, (state: any) => ({
              loading: { ...state?.loading, [key]: false },
              data: { ...state?.data, [key]: response },
              error: { ...state?.error, [key]: null }
            }));
          }),
          catchError((err) => {
            patchState(store, (state: any) => ({
              loading: { ...state?.loading, [key]: false },
              error: { ...state?.error, [key]: err }
            }));
            return of(null);
          })
        );
      })
    );
  }
}
