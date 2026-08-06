import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TDSCardModule } from 'tds-ui/card';
import { TDSTableModule } from 'tds-ui/table';
import { ProjectItem, TimeFilter } from '../dashboard.component';

@Component({
  selector: 'mfe-overview-tab',
  standalone: true,
  imports: [CommonModule, TDSCardModule, TDSTableModule],
  templateUrl: './overview-tab.component.html'
})
export class OverviewTabComponent {
  @Input({ required: true }) selectedFilter: '30D' | '90D' | '1Y' = '30D';
  @Input({ required: true }) projectsData: ProjectItem[] = [];
  @Output() filterChange = new EventEmitter<TimeFilter>();

  public setFilter(filter: TimeFilter): void {
    this.filterChange.emit(filter);
  }
}
