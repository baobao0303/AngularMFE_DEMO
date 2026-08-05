import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tds-card">
      @if (title) {
        <div class="tds-card-header">
          <h3 class="tds-card-title">{{ title }}</h3>
        </div>
      }
      <div class="tds-card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tds-card {
      background-color: var(--tds-color-neutral-10);
      border-radius: var(--tds-border-radius-m);
      box-shadow: var(--tds-shadow-m);
      padding: var(--tds-spacing-9);
      color: var(--tds-color-neutral-900);
      border: 1px solid var(--tds-color-neutral-200);
    }
    .tds-card-header {
      margin-bottom: var(--tds-spacing-7);
      border-bottom: 1px solid var(--tds-color-neutral-200);
      padding-bottom: var(--tds-spacing-5);
    }
    .tds-card-title {
      margin: 0;
      font-size: var(--tds-font-size-7);
      font-weight: 700;
      color: var(--tds-color-neutral-900);
    }
  `]
})
export class CardComponent {
  @Input() public title?: string;
}
