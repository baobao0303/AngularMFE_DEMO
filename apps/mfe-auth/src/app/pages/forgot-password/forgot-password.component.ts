import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '@ui';
import { TDSButtonModule } from 'tds-ui/button';
import { TDSInputModule } from 'tds-ui/tds-input';
import { timer, finalize } from 'rxjs';

@Component({
  selector: 'mfe-auth-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SpinnerComponent,
    TDSButtonModule,
    TDSInputModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  public readonly email = signal('name@company.com');
  public readonly loading = signal(false);
  public readonly submitted = signal(false);

  public onSubmit(): void {
    if (!this.email()) return;
    this.loading.set(true);

    timer(800).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe(() => {
      this.submitted.set(true);
    });
  }
}
