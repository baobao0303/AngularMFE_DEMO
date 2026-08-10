import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { BaseView, AuthService } from '@microfrontend/core';
import { SpinnerComponent } from '@microfrontend/ui';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSFormInputModule } from 'tds-ui/input';
import { TDSInputPasswordModule } from 'tds-ui/input-password';
import { TDSFormFieldModule } from 'tds-ui/form-field';
import { TDSCardModule } from 'tds-ui/card';
import { TDSDividerModule } from 'tds-ui/divider';
import { TDSCheckBoxModule } from 'tds-ui/tds-checkbox';

import { AuthStore } from './stores/auth.api.store';
import { AuthApiService } from './services/auth.api.service';

@Component({
  selector: 'mfe-auth-login',
  standalone: true,
  providers: [AuthStore, AuthApiService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SpinnerComponent,
    TDSTagModule,
    TDSFormInputModule,
    TDSInputPasswordModule,
    TDSFormFieldModule,
    TDSCardModule,
    TDSDividerModule,
    TDSCheckBoxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseView {
  public readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  // Private Writable Signals
  private readonly _email = signal('name@company.com');
  private readonly _password = signal('123456');
  private readonly _rememberMe = signal(true);
  private readonly _showPassword = signal(false);

  // Public Computed Signals for Reading
  public readonly email = computed(() => this._email());
  public readonly password = computed(() => this._password());
  public readonly rememberMe = computed(() => this._rememberMe());
  public readonly showPassword = computed(() => this._showPassword());

  // Store State Signals
  public readonly loading = this.authStore.loginLoading;
  public readonly errorMessage = computed(() =>
    this.authStore.loginError() ? 'Invalid credentials. Please try again.' : null
  );

  constructor() {
    super();

    // Auto-redirect if user is already logged in
    if (this.authService.getToken() || this.storage.getItem('mfe_jwt_token')) {
      this.navigateToDashboard();
    }

    // Reaction for successful login / SSO login
    effect(() => {
      const res = this.authStore.loginResponse();
      if (res?.user && res?.token) {
        this.authService.setToken(res.token, res.user);
        this.storage.setItem('mfe_mock_user', res.user);
        this.storage.setItem('mfe_jwt_token', res.token);
        this.eventBus.emit({
          type: 'USER_LOGGED_IN',
          payload: res.user,
          sourceRemote: 'mfe-auth',
          timestamp: Date.now()
        });
        this.navigateToDashboard();
      }
    });
  }

  // Update / Setters for Private Signals
  public setEmail(val: string): void {
    this._email.set(val);
  }

  public setPassword(val: string): void {
    this._password.set(val);
  }

  public setRememberMe(val: boolean): void {
    this._rememberMe.set(val);
  }

  private navigateToDashboard(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl).catch(() => {
      if (typeof window !== 'undefined') {
        window.location.href = returnUrl;
      }
    });
  }

  public togglePasswordVisibility(): void {
    this._showPassword.update(v => !v);
  }

  public onLogin(): void {
    if (this.loading()) {
      return;
    }
    this.authStore.login({ email: this._email(), pass: this._password() });
  }

  public onSsoLogin(): void {
    this.authStore.ssoLogin(undefined);
  }

  public async onLogout(): Promise<void> {
    this.authService.logout();
    this.storage.removeItem('mfe_mock_user');
    this.storage.removeItem('mfe_jwt_token');
    this.eventBus.emit({
      type: 'USER_LOGGED_OUT',
      payload: null,
      sourceRemote: 'mfe-auth',
      timestamp: Date.now()
    });
  }
}
