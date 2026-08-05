import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tds-stats-widget">
      <span class="tds-stats-label">{{ label }}</span>
      <span class="tds-stats-val">{{ value }}</span>
      @if (change) {
        <span class="tds-stats-change" [class.positive]="change.startsWith('+')">{{ change }}</span>
      }
    </div>
  `,
  styles: [`
    .tds-stats-widget {
      background-color: var(--tds-color-neutral-10);
      border: 1px solid var(--tds-color-neutral-200);
      border-radius: var(--tds-border-radius-m);
      padding: var(--tds-spacing-7);
      display: flex;
      flex-direction: column;
      gap: var(--tds-spacing-5);
    }
    .tds-stats-label {
      font-size: var(--tds-font-size-3);
      color: var(--tds-color-neutral-500);
    }
    .tds-stats-val {
      font-size: var(--tds-font-size-7);
      font-weight: 700;
      color: var(--tds-color-primary-500);
    }
    .tds-stats-change {
      font-size: var(--tds-font-size-3);
      color: var(--tds-color-neutral-500);
    }
    .tds-stats-change.positive {
      color: var(--tds-color-secondary-500);
    }
  `]
})
export class StatsWidgetComponent {
  @Input() public label: string = '';
  @Input() public value: string | number = '';
  @Input() public change?: string;
}
