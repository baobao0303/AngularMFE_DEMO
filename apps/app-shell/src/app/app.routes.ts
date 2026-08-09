import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@core';

const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasToken = typeof window !== 'undefined' && (!!localStorage.getItem('mfe_jwt_token') || !!localStorage.getItem('mfe_mock_user'));
  return hasToken || router.createUrlTree(['/auth/login']);
};

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => loadRemoteModule<any>('mfe-auth', './Routes')
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule<any>('mfe-dashboard', './Routes')
  },
  {
    path: 'reporting',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule<any>('mfe-reporting', './Routes')
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => loadRemoteModule<any>('mfe-dashboard', './Projects')
  },
  {
    path: 'page-403',
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent)
  },
  {
    path: 'page-404',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: 'page-404'
  }
];
