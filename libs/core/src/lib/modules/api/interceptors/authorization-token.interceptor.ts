import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseTokenInterceptor } from './base-token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationTokenInterceptor extends BaseTokenInterceptor {}

export const authorizationTokenInterceptorFn: HttpInterceptorFn = (req, next) => {
  const interceptor = inject(AuthorizationTokenInterceptor);
  return interceptor.intercept(req, {
    handle: (r) => next(r)
  });
};
