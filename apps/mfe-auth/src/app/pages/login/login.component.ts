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
    this.router.navigateByUrl('/dashboard').catch(() => {
      if (typeof window !== 'undefined') {
        window.location.href = 'http://localhost:4200/dashboard';
      }
    });
  }

  public ngOnInit(): void {
    if (this.storage.getItem('mfe_mock_user')) {
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

  public onSendResetLink(): void {
    if (!this.resetEmail()) return;
    this.resetLoading.set(true);
    timer(800).pipe(
      finalize(() => this.resetLoading.set(false))
    ).subscribe(() => {
      this.resetSubmitted.set(true);
    });
  }

  public async onLogin(): Promise<void> {
    this.errorMessage.set(null);
    const passVal = this.password() || '123456';
    const emailVal = this.email() || 'name@company.com';
    this.loading.set(true);

    const user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: emailVal,
      name: emailVal.split('@')[0],
      role: 'Administrator'
    };

    this.storage.setItem('mfe_mock_user', user);
    this.storage.setItem('mfe_jwt_token', `mock_jwt_${user.id}`);

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
    const user = {
      id: 'usr_sso_' + Math.random().toString(36).substring(2, 9),
      email: 'sso.admin@mfe.com',
      name: 'sso.admin',
      role: 'Administrator'
    };

    this.storage.setItem('mfe_mock_user', user);
    this.storage.setItem('mfe_jwt_token', `mock_jwt_${user.id}`);

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
