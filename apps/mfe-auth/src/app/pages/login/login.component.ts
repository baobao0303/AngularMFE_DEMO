import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class LoginComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);



  public readonly email = signal('name@company.com');
  public readonly password = signal('123456');
  public readonly rememberMe = signal(true);
  public readonly showPassword = signal(false);
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  // Forgot Password Drawer State
  public readonly forgotDrawerVisible = signal(false);
  public readonly resetEmail = signal('name@company.com');
  public readonly resetSubmitted = signal(false);
  public readonly resetLoading = signal(false);

  private navigateToDashboard(): void {
    if (typeof window !== 'undefined' && window.location.port === '4201') {
      window.location.assign('http://localhost:4200/dashboard');
    } else {
      window.location.assign('/dashboard');
    }
  }

  public ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.navigateToDashboard();
    }
  }

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
    const passVal = this.password() || '123456';
    const emailVal = this.email() || 'name@company.com';
    this.loading.set(true);

    let user;
    try {
      user = await this.authService.login({ email: emailVal, pass: passVal });
    } catch (err) {
      console.error('[Login] Auth failed:', err);
      this.errorMessage.set('Invalid credentials, please try again.');
      this.loading.set(false);
      return;
    }

    this.eventBus.emit({
      type: 'USER_LOGGED_IN',
      payload: user,
      sourceRemote: 'mfe-auth',
      timestamp: Date.now()
    });

    this.loading.set(false);
    this.navigateToDashboard();
  }

  public async onSsoLogin(): Promise<void> {
    this.loading.set(true);
    let user;
    try {
      user = await this.authService.login({ email: 'sso.admin@mfe.com', pass: 'sso' });
    } catch (err) {
      console.error('[SSO Login] Auth failed:', err);
      this.loading.set(false);
      return;
    }

    this.eventBus.emit({
      type: 'USER_LOGGED_IN',
      payload: user,
      sourceRemote: 'mfe-auth',
      timestamp: Date.now()
    });

    this.loading.set(false);
    this.navigateToDashboard();
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
