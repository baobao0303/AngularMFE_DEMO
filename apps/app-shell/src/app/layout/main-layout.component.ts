import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TDSLayoutModule } from 'tds-ui/layout';
import { TDSHeaderModule } from 'tds-ui/header';
import { AuthService, EventBusService } from '@core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    TDSLayoutModule,
    TDSHeaderModule
  ],
  template: `
    <tds-layout class="min-h-screen">
      <tds-header class="!bg-white dark:!bg-neutral-800 border-b flex justify-between items-center px-6">
        <div class="flex items-center gap-3 font-semibold text-lg">
          <span>🚀 Monorepo Micro-Frontend</span>
        </div>
        <div class="flex items-center gap-4">
          @if (authService.currentUser(); as user) {
            <span class="text-sm text-gray-600">👤 {{ user.name }} ({{ user.role }})</span>
          }
          <button (click)="logout()" class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition">
            Sign Out
          </button>
        </div>
      </tds-header>

      <tds-layout>
        <tds-layout-sider class="!bg-neutral-900 text-white p-4">
          <div class="flex flex-col gap-2">
            <a routerLink="/dashboard" class="px-4 py-2 rounded hover:bg-neutral-800 transition">
              📊 Dashboard
            </a>
            <a routerLink="/reporting" class="px-4 py-2 rounded hover:bg-neutral-800 transition">
              📈 Reporting
            </a>
          </div>
        </tds-layout-sider>

        <tds-layout-content class="p-6 bg-neutral-100 dark:bg-neutral-900">
          <router-outlet></router-outlet>
        </tds-layout-content>
      </tds-layout>

      <tds-layout-footer class="!bg-neutral-800 text-neutral-400 text-center py-3 text-sm">
        Micro-Frontend Architecture &copy; 2026
      </tds-layout-footer>
    </tds-layout>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);
  private readonly router = inject(Router);

  public async logout(): Promise<void> {
    await this.authService.logout();
    this.eventBus.emit({
      type: 'USER_LOGGED_OUT',
      payload: null,
      sourceRemote: 'app-shell',
      timestamp: Date.now()
    });
    await this.router.navigate(['/auth/login']);
  }
}
