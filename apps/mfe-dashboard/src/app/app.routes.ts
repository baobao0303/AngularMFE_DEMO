import { Route } from '@angular/router';
import { authGuard } from '@microfrontend/core';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';

export { ProjectsComponent, DashboardComponent };

export const appRoutes: Route[] = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] }
];
