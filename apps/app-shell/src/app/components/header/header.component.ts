import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSButtonModule } from 'tds-ui/button';
import { BaseStorageService, BaseEventBusService, AuthService } from '@core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TDSTagModule, TDSButtonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly _storage = inject(BaseStorageService);
  private readonly _eventBus = inject(BaseEventBusService);
  private readonly _authService = inject(AuthService);

  public readonly toggleSidebar = output<void>();
  public readonly logout = output<void>();

  public readonly currentUser = signal(this._storage.getItem<any>('mfe_mock_user'));

  public onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  public onLogout(): void {
    this._authService.logout();
    this._eventBus.emit({
      type: 'USER_LOGGED_OUT',
      payload: null,
      sourceRemote: 'app-shell',
      timestamp: Date.now()
    });
    this.currentUser.set(null);
    this.logout.emit();
  }
}
