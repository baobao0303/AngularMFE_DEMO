import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, EventBusService } from '@core';
import { CardComponent, ButtonComponent, InputComponent, BadgeComponent, SpinnerComponent } from '@ui';

@Component({
  selector: 'mfe-auth-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    SpinnerComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);
  private readonly router = inject(Router);

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
      await this.router.navigate(['/dashboard']);
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
