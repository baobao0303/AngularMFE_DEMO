import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tds-input-wrapper">
      @if (label) {
        <label class="tds-label">{{ label }}</label>
      }
      <input 
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInputChange($event)"
        class="tds-input" />
    </div>
  `,
  styles: [`
    .tds-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--tds-spacing-5);
      margin-bottom: var(--tds-spacing-7);
    }
    .tds-label {
      font-size: var(--tds-font-size-3);
      font-weight: 600;
      color: var(--tds-color-neutral-500);
    }
    .tds-input {
      padding: var(--tds-spacing-7) var(--tds-spacing-9);
      border-radius: var(--tds-border-radius-s);
      border: 1px solid var(--tds-color-neutral-200);
      background-color: var(--tds-color-neutral-10);
      color: var(--tds-color-neutral-900);
      font-size: var(--tds-font-size-4);
      outline: none;
      transition: border-color 0.2s ease;
    }
    .tds-input:focus {
      border-color: var(--tds-color-primary-500);
    }
  `]
})
export class InputComponent {
  @Input() public label?: string;
  @Input() public type: string = 'text';
  @Input() public placeholder: string = '';
  @Input() public value: string = '';
  @Output() public valueChange = new EventEmitter<string>();

  public onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val);
  }
}
