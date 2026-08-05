import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const mockToken = localStorage.getItem('mfe_jwt_token') || 'mock_jwt_token_demo';
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${mockToken}`
    }
  });
  return next(authReq);
};
