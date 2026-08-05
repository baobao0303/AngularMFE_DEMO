import { Component, inject } from '@angular/core';
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
  template: `
    <tds-layout class="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <!-- Top Navigation Header -->
      <tds-header class="!bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex justify-between items-center px-6 h-16 sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
            M
          </div>
          <div>
            <h1 class="font-bold text-base tracking-tight text-white m-0 leading-none">Enterprise Platform</h1>
            <span class="text-[11px] text-slate-400 font-medium tracking-wide">Nx Angular Micro-Frontend</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <tds-tag class="!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20 font-medium text-xs px-2.5 py-1 rounded-full">
            ● System Operational
          </tds-tag>

          @if (authService.currentUser(); as user) {
            <div class="flex items-center gap-3 pl-3 border-l border-slate-800">
              <tds-avatar [text]="user.name[0]" size="sm" class="!bg-indigo-600 !text-white font-semibold"></tds-avatar>
              <div class="hidden sm:block text-left">
                <div class="text-xs font-semibold text-slate-200 leading-tight">{{ user.name }}</div>
                <div class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{{ user.role }}</div>
              </div>
              <button tds-button tdsType="flat" color="primary" size="sm" (click)="logout()" class="!bg-slate-800 hover:!bg-slate-700 !text-slate-300 !border-slate-700 text-xs rounded-lg transition ml-2">
                Sign Out
              </button>
            </div>
          } @else {
            <a routerLink="/auth/login" tds-button tdsType="default" color="primary" size="sm" class="!bg-blue-600 hover:!bg-blue-500 !text-white font-medium text-xs rounded-lg shadow-sm">
              Sign In
            </a>
          }
        </div>
      </tds-header>

      <tds-layout class="flex-1">
        <!-- Sidebar Navigation -->
        <tds-layout-sider class="!bg-slate-900/60 border-r border-slate-800/80 w-64 p-4 flex flex-col justify-between">
          <div class="space-y-1">
            <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</div>
            <a routerLink="/dashboard" routerLinkActive="!bg-blue-600/20 !text-blue-400 !border-blue-500/40" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent transition-all group">
              <span class="text-base group-hover:scale-110 transition-transform">📊</span>
              Dashboard
            </a>
            <a routerLink="/reporting" routerLinkActive="!bg-blue-600/20 !text-blue-400 !border-blue-500/40" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent transition-all group">
              <span class="text-base group-hover:scale-110 transition-transform">📈</span>
              Reporting
            </a>
          </div>

          <div class="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 mt-auto">
            <div class="font-semibold text-slate-300 flex items-center justify-between">
              <span>Architecture</span>
              <span class="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Nx v23</span>
            </div>
            <p class="text-[11px] leading-relaxed text-slate-400 m-0">Module Federation with Angular 18 & TDS UI.</p>
          </div>
        </tds-layout-sider>

        <!-- Main Content Area -->
        <tds-layout-content class="p-6 bg-slate-950 min-h-[calc(100vh-4rem)]">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </tds-layout-content>
      </tds-layout>

      <!-- Footer -->
      <tds-layout-footer class="!bg-slate-900 border-t border-slate-800/80 text-slate-500 text-center py-3 text-xs">
        Micro-Frontend Architecture &copy; 2026 Enterprise Solutions. Built with TDS-UI.
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
