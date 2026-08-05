import { Routes } from '@angular/router';
import { authGuard } from '@core/authorization';
import { MainLayoutComponent } from './layout/main-layout.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadChildren: () => import('../../../mfe-auth/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../../../mfe-dashboard/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
      },
      {
        path: 'reporting',
        loadChildren: () => import('../../../mfe-reporting/src/app/remote-entry/entry.routes').then(m => m.remoteRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
