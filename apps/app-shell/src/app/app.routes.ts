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
    loadChildren: () =>
      loadRemoteModule('mfe-auth', './Routes')
        .then((m) => m.appRoutes)
        .catch((err) => {
          console.error('[App Shell] Failed to load mfe-auth remote module:', err);
          return [];
        })
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
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
        loadComponent: () =>
          loadRemoteModule('mfe-dashboard', './Projects')
            .then((m) => m.ProjectsComponent)
            .catch((err) => {
              console.error('[App Shell] Failed to load ProjectsComponent from mfe-dashboard:', err);
              return null as any;
            })
      }
    ]
  }
];

