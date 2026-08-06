import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TDSCardModule } from 'tds-ui/card';
import { ActivityFilterType, ActivityLogItem } from '../dashboard.component';

@Component({
  selector: 'mfe-activity-tab',
  standalone: true,
  imports: [CommonModule, TDSCardModule],
  templateUrl: './activity-tab.component.html'
})
export class ActivityTabComponent {
  @Input({ required: true }) activityFilter: 'All' | 'Projects' | 'Security' | 'System' = 'All';
  @Input({ required: true }) activityLogsData: ActivityLogItem[] = [];
  @Output() activityFilterChange = new EventEmitter<ActivityFilterType>();

  public setActivityFilter(filter: ActivityFilterType): void {
    this.activityFilterChange.emit(filter);
  }
}
