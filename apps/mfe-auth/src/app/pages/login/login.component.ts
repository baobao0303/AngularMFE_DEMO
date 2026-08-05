import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, EventBusService } from '@core';
import { SpinnerComponent } from '@ui';
import { TDSButtonModule } from 'tds-ui/button';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSDrawerModule } from 'tds-ui/drawer';
import { TDSInputModule } from 'tds-ui/tds-input';
import { TDSInputPasswordModule } from 'tds-ui/input-password';
import { TDSFormFieldModule } from 'tds-ui/form-field';
import { TDSCardModule } from 'tds-ui/card';
import { TDSDividerModule } from 'tds-ui/divider';
import { TDSCheckBoxModule } from 'tds-ui/tds-checkbox';

@Component({
  selector: 'mfe-auth-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    TDSButtonModule,
    TDSTagModule,
    TDSDrawerModule,
    TDSInputModule,
    TDSInputPasswordModule,
    TDSFormFieldModule,
    TDSCardModule,
    TDSDividerModule,
    TDSCheckBoxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);
  private readonly router = inject(Router);

  public readonly email = signal('name@company.com');
  public readonly password = signal('');
  public readonly rememberMe = signal(true);
  public readonly showPassword = signal(false);
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  // Forgot Password Drawer State
  public readonly forgotDrawerVisible = signal(false);
  public readonly resetEmail = signal('name@company.com');
  public readonly resetSubmitted = signal(false);
  public readonly resetLoading = signal(false);

  public togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  public openForgotDrawer(): void {
    this.resetEmail.set(this.email());
    this.resetSubmitted.set(false);
    this.forgotDrawerVisible.set(true);
  }

  public closeForgotDrawer(): void {
    this.forgotDrawerVisible.set(false);
  }

  public async onSendResetLink(): Promise<void> {
    if (!this.resetEmail()) return;
    this.resetLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    this.resetLoading.set(false);
    this.resetSubmitted.set(true);
  }

  public async onLogin(): Promise<void> {
    this.errorMessage.set(null);
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Invalid credentials, please try again.');
      return;
    }
    this.loading.set(true);
    try {
      const user = await this.authService.login({ email: this.email(), pass: this.password() });
      this.eventBus.emit({
        type: 'USER_LOGGED_IN',
        payload: user,
        sourceRemote: 'mfe-auth',
        timestamp: Date.now()
      });
      await this.router.navigate(['/dashboard']);
    } catch {
      this.errorMessage.set('Invalid credentials, please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  public async onSsoLogin(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.authService.login({ email: 'sso.admin@mfe.com', pass: 'sso' });
      this.eventBus.emit({
        type: 'USER_LOGGED_IN',
        payload: user,
        sourceRemote: 'mfe-auth',
        timestamp: Date.now()
      });
      await this.router.navigate(['/dashboard']);
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
