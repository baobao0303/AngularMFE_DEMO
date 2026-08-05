import { HttpInterceptorFn } from '@angular/common/http';

export const bffInterceptor: HttpInterceptorFn = (req, next) => {
  const bffReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  return next(bffReq);
};
