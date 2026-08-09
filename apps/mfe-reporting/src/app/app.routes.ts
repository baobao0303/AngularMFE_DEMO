import { Route } from '@angular/router';
import { authGuard } from '@microfrontend/core';
import { ReportingComponent } from './pages/reporting/reporting.component';
import { SharedStylesComponent } from './pages/shared-styles/shared-styles.component';

export { ReportingComponent, SharedStylesComponent };

export const appRoutes: Route[] = [
  { path: '', component: ReportingComponent, canActivate: [authGuard] },
  { path: 'shared-styles', component: SharedStylesComponent, canActivate: [authGuard] }
];
