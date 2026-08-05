import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'ui-shell-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="tds-sidebar">
      <nav class="tds-nav">
        <a routerLink="/auth" routerLinkActive="active" class="tds-nav-item">
          🔑 Authentication MFE (4201)
        </a>
        <a routerLink="/dashboard" routerLinkActive="active" class="tds-nav-item">
          📊 Dashboard MFE (4202)
        </a>
        <a routerLink="/reporting" routerLinkActive="active" class="tds-nav-item">
          📈 Reporting MFE (4203)
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .tds-sidebar {
      width: 260px;
      background-color: var(--tds-color-neutral-50);
      border-right: 1px solid var(--tds-color-neutral-200);
      padding: var(--tds-spacing-9);
      min-height: calc(100vh - 65px);
    }
    .tds-nav {
      display: flex;
      flex-direction: column;
      gap: var(--tds-spacing-5);
    }
    .tds-nav-item {
      display: flex;
      align-items: center;
      padding: var(--tds-spacing-7) var(--tds-spacing-9);
      border-radius: var(--tds-border-radius-m);
      color: var(--tds-color-neutral-900);
      text-decoration: none;
      font-size: var(--tds-font-size-4);
      font-weight: 500;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .tds-nav-item:hover {
      background-color: var(--tds-color-neutral-200);
    }
    .tds-nav-item.active {
      background-color: var(--tds-color-primary-500);
      color: var(--tds-color-neutral-10);
      font-weight: 600;
    }
  `]
})
export class ShellSidebarComponent {}
