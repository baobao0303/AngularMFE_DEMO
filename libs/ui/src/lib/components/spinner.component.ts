import { Component } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  template: `
    <div class="tds-spinner"></div>
  `,
  styles: [`
    .tds-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--tds-color-neutral-200);
      border-top-color: var(--tds-color-primary-500);
      border-radius: var(--tds-border-radius-circle);
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {}
