import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';

@Component({
  selector: 'ui-widget-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <ui-card [title]="header">
      <div class="tds-widget-content">
        <ng-content></ng-content>
      </div>
    </ui-card>
  `,
  styles: [`
    .tds-widget-content {
      padding: var(--tds-spacing-5) 0;
    }
  `]
})
export class WidgetCardComponent {
  @Input() public header?: string;
}
