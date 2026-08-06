import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';

export { ProjectsComponent, DashboardComponent };

export const appRoutes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent }
];
