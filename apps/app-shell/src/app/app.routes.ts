import { Routes } from '@angular/router';
import { authGuard } from '@core/authorization';
import { MainLayoutComponent } from './layout/main-layout.component';
import { loadRemoteModule } from '@nx/angular/mf';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => loadRemoteModule('mfe-auth', './Routes').then(m => m.appRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => loadRemoteModule('mfe-dashboard', './Routes').then(m => m.appRoutes)
      },
      {
        path: 'reporting',
        loadChildren: () => loadRemoteModule('mfe-reporting', './Routes').then(m => m.appRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
