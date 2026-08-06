import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  Observable,
  switchMap,
  take,
  throwError
} from 'rxjs';
import { BaseStorageService } from '../base/base-storage.service';
import { BaseLoadingService } from '../base/base-loading.service';

const TOKEN_KEY = 'mfe_jwt_token';
const REFRESH_TOKEN_KEY = 'mfe_refresh_token';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationTokenInterceptor implements HttpInterceptor {
  private readonly _storage = inject(BaseStorageService);
  private readonly _loading = inject(BaseLoadingService);
  private readonly _router = inject(Router);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this._loading.show();
    const token = this._getToken();
    const clonedRequest = token ? this._addTokenHeader(req, token) : req;

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          this._isUnauthorized(error) &&
          this._shouldIntercept(req)
        ) {
          return this._handleUnauthorized(req, next);
        }
        return throwError(() => error);
      }),
      finalize(() => this._loading.hide())
    );
  }

  private _getToken(): string | null {
    return this._storage.getItem<string>(TOKEN_KEY);
  }

  private _isUnauthorized(response: HttpErrorResponse): boolean {
    return response.status === HttpStatusCode.Unauthorized;
  }

  private _shouldIntercept(req: HttpRequest<any>): boolean {
    const blacklist = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token'
    ];
    return blacklist.every((path) => !req.url.includes(path));
  }

  private _addTokenHeader(
    req: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private _handleUnauthorized(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this._storage.getItem<string>(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return this._redirectToSignIn();
      }

      // Mock token refresh
      const newToken = `mock_refreshed_jwt_${Date.now()}`;
      this._storage.setItem(TOKEN_KEY, newToken);
      this.refreshTokenSubject.next(newToken);
      this.isRefreshing = false;
      return next.handle(this._addTokenHeader(req, newToken));
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this._addTokenHeader(req, token!)))
    );
  }

  private _redirectToSignIn(): Observable<never> {
    this._storage.removeItem(TOKEN_KEY);
    this._storage.removeItem(REFRESH_TOKEN_KEY);
    this._storage.removeItem('mfe_mock_user');
    this._router.navigateByUrl('/auth/login');
    return throwError(() => null);
  }
}

export const authorizationTokenInterceptorFn: HttpInterceptorFn = (req, next) => {
  const interceptor = inject(AuthorizationTokenInterceptor);
  return interceptor.intercept(req, {
    handle: (r) => next(r)
  });
};
