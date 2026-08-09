import { Route } from '@angular/router';
import { authGuard } from '@microfrontend/core';
import { ReportingComponent } from './pages/reporting/reporting.component';

export const appRoutes: Route[] = [
  { path: '', component: ReportingComponent, canActivate: [authGuard] }
];
