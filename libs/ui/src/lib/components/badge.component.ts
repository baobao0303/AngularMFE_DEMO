import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="'tds-badge tds-badge-' + type">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .tds-badge {
      display: inline-block;
      padding: var(--tds-spacing-5) var(--tds-spacing-7);
      font-size: var(--tds-font-size-3);
      font-weight: 600;
      border-radius: var(--tds-border-radius-s);
    }
    .tds-badge-success {
      background-color: var(--tds-color-secondary-500);
      color: var(--tds-color-neutral-10);
    }
    .tds-badge-info {
      background-color: var(--tds-color-primary-500);
      color: var(--tds-color-neutral-10);
    }
    .tds-badge-neutral {
      background-color: var(--tds-color-neutral-200);
      color: var(--tds-color-neutral-900);
    }
  `]
})
export class BadgeComponent {
  @Input() public type: 'success' | 'info' | 'neutral' = 'info';
}
