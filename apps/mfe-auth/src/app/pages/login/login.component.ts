import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BaseStorageService, BaseEventBusService } from '@core';
import { timer, finalize } from 'rxjs';
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

import { AuthApiService } from '../../services/auth-api.service';

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
  public readonly storage = inject(BaseStorageService);
  public readonly eventBus = inject(BaseEventBusService);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);

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
    console.log('[mfe-auth] Emitted USER_LOGGED_IN, navigating to /dashboard');
    this.router.navigate(['/dashboard']);
  }

  public ngOnInit(): void {
    // Standalone check or optional auto-redirect
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

  public onSendResetLink(): void {
    if (!this.resetEmail()) return;
    this.resetLoading.set(true);
    this.authApi.sendPasswordReset(this.resetEmail()).subscribe(() => {
      this.resetLoading.set(false);
      this.resetSubmitted.set(true);
    });
  }

  public onLogin(): void {
    this.errorMessage.set(null);
    this.loading.set(true);
    this.authApi.login(this.email(), this.password()).subscribe({
      next: (res) => {
        this.storage.setItem('mfe_mock_user', res.user);
        this.storage.setItem('mfe_jwt_token', res.token);
        this.eventBus.emit({
          type: 'USER_LOGGED_IN',
          payload: res.user,
          sourceRemote: 'mfe-auth',
          timestamp: Date.now()
        });
        this.loading.set(false);
        this.navigateToDashboard();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid credentials. Please try again.');
      }
    });
  }

  public onSsoLogin(): void {
    this.loading.set(true);
    this.authApi.ssoLogin().subscribe({
      next: (res) => {
        this.storage.setItem('mfe_mock_user', res.user);
        this.storage.setItem('mfe_jwt_token', res.token);
        this.eventBus.emit({
          type: 'USER_LOGGED_IN',
          payload: res.user,
          sourceRemote: 'mfe-auth',
          timestamp: Date.now()
        });
        this.loading.set(false);
        this.navigateToDashboard();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  public async onLogout(): Promise<void> {
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
