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
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError
} from 'rxjs';
import { BaseStorageService } from '../../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationTokenInterceptor implements HttpInterceptor {
  private readonly _storageService = inject(BaseStorageService);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this._storageService.getAccessToken();
    let clonedRequest = token ? this._addTokenHeader(req, token) : req;

    if (clonedRequest.url.startsWith('/api') && typeof window !== 'undefined' && window.location.port !== '4200') {
      clonedRequest = clonedRequest.clone({ url: `http://localhost:4200${clonedRequest.url}` });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          this._isUnauthorized(error) &&
          this._shouldIntercept(req)
        ) {
          return this._handleUnauthorized(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private _isUnauthorized(response: HttpErrorResponse): boolean {
    return response.status === HttpStatusCode.Unauthorized;
  }

  private _shouldIntercept(req: HttpRequest<unknown>): boolean {
    const blacklist = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token'
    ];
    return blacklist.every((path) => !req.url.includes(path));
  }

  private _addTokenHeader(
    req: HttpRequest<unknown>,
    token: string
  ): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private _handleUnauthorized(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this._storageService.getRefreshToken();
      if (!refreshToken) {
        this._storageService.removeAccessToken();
        this._storageService.removeRefreshToken();
        return throwError(() => null);
      }

      // Refresh token handling
      const newToken = `mock_refreshed_jwt_${Date.now()}`;
      this._storageService.setAccessToken(newToken);
      this.refreshTokenSubject.next(newToken);
      this.isRefreshing = false;
      return next.handle(this._addTokenHeader(req, newToken));
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this._addTokenHeader(req, token)))
    );
  }
}

export const authorizationTokenInterceptorFn: HttpInterceptorFn = (req, next) => {
  const interceptor = inject(AuthorizationTokenInterceptor);
  return interceptor.intercept(req, {
    handle: (r) => next(r)
  });
};
