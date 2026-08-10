import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteStyleService, RemoteStyleConfig } from '@core';

export interface ThemeOption {
  id: string;
  title: string;
  scopeClass: string;
  badgeBg: string;
  badgeText: string;
}

@Component({
  selector: 'mfe-reporting-shared-styles-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-styles.component.html',
  styleUrl: './shared-styles.component.scss'
})
export class SharedStylesComponent implements OnInit, OnDestroy {
  private readonly styleService = inject(RemoteStyleService);

  public readonly activeClass = signal<string>('mfe-shared-card');

  public readonly themeOptions: ThemeOption[] = [
    {
      id: 'crimson',
      title: '1. Crimson Master Theme',
      scopeClass: 'mfe-shared-card',
      badgeBg: 'bg-[#800A20]',
      badgeText: 'text-white'
    },
    {
      id: 'dark-glass',
      title: '2. Dark Glassmorphism',
      scopeClass: 'mfe-theme-dark-glass',
      badgeBg: 'bg-[#38BDF8]/20',
      badgeText: 'text-[#38BDF8]'
    },
    {
      id: 'neon-cyan',
      title: '3. Cyberpunk Neon Cyan',
      scopeClass: 'mfe-theme-neon-cyan',
      badgeBg: 'bg-[#00F0FF]/20',
      badgeText: 'text-[#00F0FF]'
    },
    {
      id: 'corporate-blue',
      title: '4. Corporate Royal Blue',
      scopeClass: 'mfe-theme-corporate-blue',
      badgeBg: 'bg-[#2563EB]/20',
      badgeText: 'text-[#2563EB]'
    }
  ];

  public ngOnInit(): void {
    this.selectStyleClass('mfe-shared-card');
  }

  public ngOnDestroy(): void {
    this.styleService.unloadRemoteStyle({
      mfeName: 'mfe-dashboard',
      exposedModule: './SharedStyle',
      className: this.activeClass()
    });
  }

  public selectStyleClass(className: string): void {
    if (this.activeClass()) {
      this.styleService.unloadRemoteStyle({
        mfeName: 'mfe-dashboard',
        exposedModule: './SharedStyle',
        className: this.activeClass()
      });
    }

    this.activeClass.set(className);

    const config: RemoteStyleConfig = {
      mfeName: 'mfe-dashboard',
      exposedModule: './SharedStyle',
      className,
      styleType: 'js-module'
    };

    this.styleService.loadRemoteStyle(config);
  }
}
