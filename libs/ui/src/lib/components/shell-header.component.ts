import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core';
import { ButtonComponent } from './button.component';
import { BadgeComponent } from './badge.component';

@Component({
  selector: 'ui-shell-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  template: `
    <header class="tds-header">
      <div class="tds-brand">
        <span class="tds-logo">⚡ Nx MFE Platform</span>
        <ui-badge type="info">Phase 1: Core</ui-badge>
      </div>

      <div class="tds-user-menu">
        @if (authService.isAuthenticated()) {
          <span class="tds-user-name">👋 {{ authService.currentUser()?.name }}</span>
          <ui-button variant="outline" (btnClick)="onLogout()">Logout</ui-button>
        } @else {
          <span class="tds-guest">Guest User</span>
        }
      </div>
    </header>
  `,
  styles: [`
    .tds-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--tds-spacing-7) var(--tds-spacing-11);
      background-color: var(--tds-color-neutral-10);
      border-bottom: 1px solid var(--tds-color-neutral-200);
      box-shadow: var(--tds-shadow-s);
    }
    .tds-brand {
      display: flex;
      align-items: center;
      gap: var(--tds-spacing-7);
    }
    .tds-logo {
      font-size: var(--tds-font-size-7);
      font-weight: 800;
      color: var(--tds-color-primary-500);
    }
    .tds-user-menu {
      display: flex;
      align-items: center;
      gap: var(--tds-spacing-9);
    }
    .tds-user-name {
      font-size: var(--tds-font-size-4);
      font-weight: 600;
      color: var(--tds-color-neutral-900);
    }
    .tds-guest {
      color: var(--tds-color-neutral-500);
      font-size: var(--tds-font-size-4);
    }
  `]
})
export class ShellHeaderComponent {
  public readonly authService = inject(AuthService);

  public async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
