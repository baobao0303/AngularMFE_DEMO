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
    loadChildren: () => import('mfe-auth/Routes').then(m => m.appRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('mfe-dashboard/Routes').then(m => m.appRoutes)
      },
      {
        path: 'reporting',
        loadChildren: () => import('mfe-reporting/Routes').then(m => m.appRoutes)
      },
      {
        path: 'projects',
        loadComponent: () => import('mfe-dashboard/Projects').then(m => m.ProjectsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
