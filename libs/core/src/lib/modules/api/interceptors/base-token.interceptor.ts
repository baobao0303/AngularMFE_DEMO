import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
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
import { BaseStorageService } from '../../../shared/storage/storage.service';
import { API_BASE_URL } from '../di-tokens/api-url.token';

/**
 * Abstract Base Interceptor to allow custom projects to override token header format,
 * custom URL blacklists, or refresh token handlers.
 */
@Injectable()
export abstract class BaseTokenInterceptor implements HttpInterceptor {
  protected readonly _storageService = inject(BaseStorageService);
  protected readonly _apiBaseUrl = inject(API_BASE_URL, { optional: true });

  protected isRefreshing = false;
  protected refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.getToken();
    let clonedRequest = token ? this.addTokenHeader(req, token) : req;

    if (clonedRequest.url.startsWith('/api') && !clonedRequest.url.startsWith('http') && this._apiBaseUrl) {
      const cleanBaseUrl = this._apiBaseUrl.replace(/\/+$/, '');
      clonedRequest = clonedRequest.clone({ url: `${cleanBaseUrl}${clonedRequest.url}` });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          this.isUnauthorized(error) &&
          this.shouldIntercept(req)
        ) {
          return this.handleUnauthorized(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  protected getToken(): string | null {
    return this._storageService.getAccessToken();
  }

  protected addTokenHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  protected isUnauthorized(response: HttpErrorResponse): boolean {
    return response.status === HttpStatusCode.Unauthorized;
  }

  /** Blacklist URLs that should not trigger auto-refresh */
  protected getBlacklistedUrls(): string[] {
    return ['/auth/login', '/auth/register', '/auth/refresh-token'];
  }

  protected shouldIntercept(req: HttpRequest<unknown>): boolean {
    return this.getBlacklistedUrls().every((path) => !req.url.includes(path));
  }

  protected handleUnauthorized(
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
      return next.handle(this.addTokenHeader(req, newToken));
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(req, token)))
    );
  }
}
