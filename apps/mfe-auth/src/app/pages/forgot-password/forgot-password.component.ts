import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '@microfrontend/ui';
import { TDSFormInputModule } from 'tds-ui/input';
import { ForgotPasswordStore } from './stores/forgot-password.store';

@Component({
  selector: 'mfe-auth-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SpinnerComponent,
    TDSFormInputModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  public readonly forgotPasswordStore = inject(ForgotPasswordStore);
  public readonly email = signal('name@company.com');
  public readonly submitted = signal(false);

  public onSubmit(): void {
    if (!this.email()) return;
    this.forgotPasswordStore.sendPasswordReset({ email: this.email() });
    this.submitted.set(true);
  }
}
