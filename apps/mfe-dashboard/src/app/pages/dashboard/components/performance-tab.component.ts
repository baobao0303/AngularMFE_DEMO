import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TDSCardModule } from 'tds-ui/card';
import { TDSTableModule } from 'tds-ui/table';
import { TeamMember } from '../dashboard.component';

@Component({
  selector: 'mfe-performance-tab',
  standalone: true,
  imports: [CommonModule, TDSCardModule, TDSTableModule],
  templateUrl: './performance-tab.component.html'
})
export class PerformanceTabComponent {
  @Input({ required: true }) conversionFilter: 'W' | 'M' | 'Y' = 'M';
  @Input({ required: true }) teamPerformanceData: TeamMember[] = [];
  @Output() conversionFilterChange = new EventEmitter<'W' | 'M' | 'Y'>();

  public setConversionFilter(filter: 'W' | 'M' | 'Y'): void {
    this.conversionFilterChange.emit(filter);
  }
}
