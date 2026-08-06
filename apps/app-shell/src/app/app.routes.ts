import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';

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
      loadRemoteModule('mfe-auth', './Routes')
        .then((m) => m.appRoutes)
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-auth remote module:', err);
          return [];
        })
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('mfe-dashboard', './Routes')
        .then((m) => m.appRoutes)
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-dashboard remote module:', err);
          return [];
        })
  },
  {
    path: 'reporting',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('mfe-reporting', './Routes')
        .then((m) => m.appRoutes)
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-reporting remote module:', err);
          return [];
        })
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      loadRemoteModule('mfe-dashboard', './Projects')
        .then((m) => m.ProjectsComponent)
        .catch((err) => {
          console.error('[App Shell] Failed to load ProjectsComponent from mfe-dashboard:', err);
          return null as any;
        })
  }
];
