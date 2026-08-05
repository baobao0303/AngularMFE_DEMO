import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, EventBusService } from '@core';
import { CardComponent, ButtonComponent, InputComponent, BadgeComponent, SpinnerComponent } from '@ui';

@Component({
  selector: 'mfe-auth-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent, BadgeComponent, SpinnerComponent],
  template: `
    <div class="mfe-auth-container">
      <ui-card title="🔑 Authentication MFE (Port 4201)">
        <div class="tds-auth-box">
          <p class="tds-desc">Phase 1 Standalone Authentication Remote App</p>

          @if (authService.isAuthenticated()) {
            <div class="tds-logged-in">
              <ui-badge type="success">Active Session</ui-badge>
              <h4>Welcome back, {{ authService.currentUser()?.name }}!</h4>
              <p>Email: {{ authService.currentUser()?.email }}</p>
              <p>Role: {{ authService.currentUser()?.role }}</p>
              <ui-button variant="outline" (btnClick)="onLogout()">Sign Out</ui-button>
            </div>
          } @else {
            <div class="tds-form">
              <ui-input label="Email Address" placeholder="admin@example.com" [value]="email()" (valueChange)="email.set($event)" />
              <ui-input label="Password" type="password" placeholder="••••••••" [value]="password()" (valueChange)="password.set($event)" />

              @if (loading()) {
                <ui-spinner></ui-spinner>
              } @else {
                <div class="tds-actions">
                  <ui-button variant="primary" (btnClick)="onLogin()">Sign In</ui-button>
                  <ui-button variant="secondary" (btnClick)="onRegister()">Create Account</ui-button>
                </div>
              }
            </div>
          }
        </div>
      </ui-card>
    </div>
  `,
  styles: [`
    .mfe-auth-container {
      max-width: 480px;
      margin: 0 auto;
      padding: var(--tds-spacing-9);
    }
    .tds-auth-box {
      display: flex;
      flex-direction: column;
      gap: var(--tds-spacing-7);
    }
    .tds-desc {
      color: var(--tds-color-neutral-500);
      font-size: var(--tds-font-size-3);
    }
    .tds-actions {
      display: flex;
      gap: var(--tds-spacing-7);
      margin-top: var(--tds-spacing-5);
    }
    .tds-logged-in {
      display: flex;
      flex-direction: column;
      gap: var(--tds-spacing-5);
    }
  `]
})
export class RemoteEntryComponent {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);

  public readonly email = signal('admin@mfe.com');
  public readonly password = signal('password123');
  public readonly loading = signal(false);

  public async onLogin(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.authService.login({ email: this.email(), pass: this.password() });
      this.eventBus.emit({
        type: 'USER_LOGGED_IN',
        payload: user,
        sourceRemote: 'mfe-auth',
        timestamp: Date.now()
      });
    } finally {
      this.loading.set(false);
    }
  }

  public async onRegister(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.authService.register({ email: this.email(), pass: this.password(), name: 'New User' });
      this.eventBus.emit({
        type: 'USER_REGISTERED',
        payload: user,
        sourceRemote: 'mfe-auth',
        timestamp: Date.now()
      });
    } finally {
      this.loading.set(false);
    }
  }

  public async onLogout(): Promise<void> {
    await this.authService.logout();
    this.eventBus.emit({
      type: 'USER_LOGGED_OUT',
      payload: null,
      sourceRemote: 'mfe-auth',
      timestamp: Date.now()
    });
  }
}
