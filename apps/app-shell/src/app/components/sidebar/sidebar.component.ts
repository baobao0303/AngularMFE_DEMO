import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BaseStorageService, BaseEventBusService } from '@core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly _storage = inject(BaseStorageService);
  private readonly _eventBus = inject(BaseEventBusService);

  public readonly collapsed = input<boolean>(false);
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
