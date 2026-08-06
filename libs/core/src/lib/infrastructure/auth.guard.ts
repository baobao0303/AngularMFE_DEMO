import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check signal first
  if (authService.isAuthenticated()) {
    return true;
  }

  // Cross-MFE fallback: mfe-auth wrote to localStorage but shell's
  // AuthService signal hasn't been updated (separate DI instances)
  const saved = localStorage.getItem('mfe_mock_user');
  if (saved) {
    try {
      JSON.parse(saved);
      return true;
    } catch { /* invalid */ }
  }

  return router.createUrlTree(['/auth']);
};
