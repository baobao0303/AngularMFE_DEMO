import { Routes } from '@angular/router';
import { authGuard } from '@core/authorization';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('../../../mfe-auth/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('../../../mfe-dashboard/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
  },
  {
    path: 'reporting',
    canActivate: [authGuard],
    loadChildren: () => import('../../../mfe-reporting/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
  }
];
