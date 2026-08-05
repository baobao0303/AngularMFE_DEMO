import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportData } from '@core';
import { CardComponent, BadgeComponent } from '@ui';
import { TDSTagModule } from 'tds-ui/tag';

@Component({
  selector: 'mfe-reporting-page',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, TDSTagModule],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss'
})
export class ReportingComponent {
  public readonly reports = signal<ReportData[]>([
    { id: 'REP-01', title: 'Monthly Revenue Analysis', category: 'Finance', createdAt: '2026-08-01', status: 'published' },
    { id: 'REP-02', title: 'User Retention & Cohort', category: 'Analytics', createdAt: '2026-08-03', status: 'published' },
    { id: 'REP-03', title: 'System Latency Audit', category: 'DevOps', createdAt: '2026-08-05', status: 'draft' }
  ]);
}
