import { Route } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authorizationTokenInterceptorFn } from '@microfrontend/core';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

export const appRoutes: Route[] = [
  {
    path: '',
    providers: [provideHttpClient(withInterceptors([authorizationTokenInterceptorFn]))],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent }
    ]
  }
];
