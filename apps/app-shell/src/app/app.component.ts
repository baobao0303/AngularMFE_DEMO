import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, NavigationStart, NavigationError, NavigationCancel, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { BaseEventBusService, BaseStorageService, BaseLoadingService } from '@core';
import { TDSSpinnerModule } from 'tds-ui/progress-spinner';
import { SidebarComponent, HeaderComponent } from './components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TDSSpinnerModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  public readonly storage = inject(BaseStorageService);
  public readonly eventBus = inject(BaseEventBusService);
  public readonly loadingService = inject(BaseLoadingService);
  private readonly router = inject(Router);

  public readonly collapsed = signal(false);

  private readonly routeLoading = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationStart | NavigationEnd | NavigationError | NavigationCancel =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationError ||
        e instanceof NavigationCancel
      ),
      map(e => {
        if (e instanceof NavigationStart) {
          // Prevent screen flicker when clicking on the current active route
          return this.router.url !== e.url;
        }
        return false;
      }),
      startWith(false)
    ),
    { initialValue: false }
  );

  public readonly isLoading = computed(() => this.routeLoading() || this.loadingService.isLoading());

  private isStandaloneUrl(url: string): boolean {
    const layoutPrefixes = ['/dashboard', '/reporting', '/projects'];
    return !layoutPrefixes.some(prefix => url.startsWith(prefix));
  }

  public readonly isAuthRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => this.isStandaloneUrl(e.urlAfterRedirects)),
      startWith(typeof window !== 'undefined' ? this.isStandaloneUrl(window.location.pathname) : true)
    ),
    { initialValue: typeof window !== 'undefined' ? this.isStandaloneUrl(window.location.pathname) : true }
  );

  public ngOnInit(): void {
    this.eventBus.on('USER_LOGGED_OUT').subscribe(() => {
      this.storage.removeItem('mfe_mock_user');
      this.storage.removeItem('mfe_jwt_token');
      this.router.navigate(['/auth/login']);
    });
  }

  public toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  public async logout(): Promise<void> {
    this.storage.removeItem('mfe_mock_user');
    this.storage.removeItem('mfe_jwt_token');
    this.eventBus.emit({
      type: 'USER_LOGGED_OUT',
      sourceRemote: 'app-shell',
      payload: null,
      timestamp: Date.now()
    });
    this.router.navigate(['/auth/login']);
  }
}
