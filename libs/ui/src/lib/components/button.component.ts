import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      [class]="'tds-btn tds-btn-' + variant"
      [disabled]="disabled"
      (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .tds-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--tds-spacing-7) var(--tds-spacing-9);
      border-radius: var(--tds-border-radius-s);
      font-size: var(--tds-font-size-4);
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .tds-btn-primary {
      background-color: var(--tds-color-primary-500);
      color: var(--tds-color-neutral-10);
    }
    .tds-btn-primary:hover {
      background-color: var(--tds-color-primary-600);
    }
    .tds-btn-secondary {
      background-color: var(--tds-color-secondary-500);
      color: var(--tds-color-neutral-10);
    }
    .tds-btn-outline {
      background-color: transparent;
      border-color: var(--tds-color-neutral-200);
      color: var(--tds-color-neutral-900);
    }
    .tds-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
  @Input() public variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() public type: 'button' | 'submit' | 'reset' = 'button';
  @Input() public disabled: boolean = false;
  @Output() public btnClick = new EventEmitter<MouseEvent>();

  public onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.btnClick.emit(event);
    }
  }
}
