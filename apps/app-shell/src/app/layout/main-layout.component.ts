import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TDSLayoutModule } from 'tds-ui/layout';
import { TDSHeaderModule } from 'tds-ui/header';
import { TDSButtonModule } from 'tds-ui/button';
import { TDSAvatarModule } from 'tds-ui/avatar';
import { TDSTagModule } from 'tds-ui/tag';
import { AuthService, EventBusService } from '@core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TDSLayoutModule,
    TDSHeaderModule,
    TDSButtonModule,
    TDSAvatarModule,
    TDSTagModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);
  private readonly router = inject(Router);

  public readonly collapsed = signal(false);

  public toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
    this.eventBus.emit({
      type: 'USER_LOGGED_OUT',
      sourceRemote: 'app-shell',
      payload: null,
      timestamp: Date.now()
    });
    this.router.navigate(['/auth/login']);
  }
}
