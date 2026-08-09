import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

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
    loadChildren: () =>
      loadRemote<any>('mfe-auth/Routes')
        .then((m) => m ? m.appRoutes : [])
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-auth remote module:', err);
          return [];
        })
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemote<any>('mfe-dashboard/Routes')
        .then((m) => m ? m.appRoutes : [])
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-dashboard remote module:', err);
          return [];
        })
  },
  {
    path: 'reporting',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemote<any>('mfe-reporting/Routes')
        .then((m) => m ? m.appRoutes : [])
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-reporting remote module:', err);
          return [];
        })
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      loadRemote<any>('mfe-dashboard/Projects')
        .then((m) => m ? m.ProjectsComponent : null)
        .catch((err) => {
          console.error('[App Shell] Failed to load ProjectsComponent from mfe-dashboard:', err);
          return null as any;
        })
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
