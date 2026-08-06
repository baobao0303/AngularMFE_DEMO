import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TDSIllustrationModule } from 'tds-ui/illustration';
import { TDSButtonModule } from 'tds-ui/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, TDSIllustrationModule, TDSButtonModule],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent {
  private readonly router = inject(Router);

  public goToDashboard(): void {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('mfe_mock_user') && !localStorage.getItem('mfe_jwt_token')) {
        const user = { id: 'usr_default', email: 'name@company.com', name: 'name', role: 'Administrator' };
        localStorage.setItem('mfe_mock_user', JSON.stringify(user));
        localStorage.setItem('mfe_jwt_token', `mock_jwt_${user.id}`);
      }
    }
    this.router.navigateByUrl('/dashboard').catch(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    });
  }
}
