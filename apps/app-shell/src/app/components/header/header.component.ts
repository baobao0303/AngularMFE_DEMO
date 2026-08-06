import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSButtonModule } from 'tds-ui/button';
import { BaseStorageService, BaseEventBusService } from '@core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TDSTagModule, TDSButtonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly _storage = inject(BaseStorageService);
  private readonly _eventBus = inject(BaseEventBusService);

  public readonly toggleSidebar = output<void>();
  public readonly logout = output<void>();

  public readonly currentUser = signal(this._storage.getItem<any>('mfe_mock_user'));

  public onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  public onLogout(): void {
    this._eventBus.emit({
      type: 'USER_LOGGED_OUT',
      payload: null,
      sourceRemote: 'app-shell',
      timestamp: Date.now()
    });
    this._storage.removeItem('mfe_mock_user');
    this._storage.removeItem('mfe_jwt_token');
    this.currentUser.set(null);
    this.logout.emit();
  }
}
