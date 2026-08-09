import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Reusable Auth Guard Factory for protecting routes that require authentication.
 */
export function createAuthGuard(loginUrl = '/auth/login'): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getToken() || authService.currentUser()) {
      return true;
    }

    router.navigate([loginUrl], { queryParams: { returnUrl: state.url } });
    return false;
  };
}

/** Default Auth Guard instance defaulting to '/auth/login' */
export const authGuard: CanActivateFn = createAuthGuard('/auth/login');

/**
 * Guest Guard Factory to prevent logged-in users from viewing login/register pages.
 */
export function createGuestGuard(defaultUrl = '/dashboard'): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getToken() || authService.currentUser()) {
      router.navigate([defaultUrl]);
      return false;
    }

    return true;
  };
}

/** Default Guest Guard instance defaulting to '/dashboard' */
export const guestGuard: CanActivateFn = createGuestGuard('/dashboard');
