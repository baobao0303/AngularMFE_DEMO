import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@microfrontend/core';
import { loadRemoteModule } from '@core';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
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
    path: 'shared-styles',
    canActivate: [authGuard],
    loadComponent: () => loadRemoteModule<any>('mfe-reporting', './SharedStyles')
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
