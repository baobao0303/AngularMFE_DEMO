import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportData } from '@core';
import { CardComponent, BadgeComponent } from '@ui';

@Component({
  selector: 'mfe-reporting-entry',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  template: `
    <div class="mfe-reporting-container">
      <ui-card title="📈 Reporting MFE (Port 4203)">
        <p class="tds-desc">Analytics and System Reports Remote Module</p>

        <div class="tds-table-container">
          <table class="tds-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Report Title</th>
                <th>Category</th>
                <th>Created At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (report of reports(); track report.id) {
                <tr>
                  <td>{{ report.id }}</td>
                  <td><strong>{{ report.title }}</strong></td>
                  <td>{{ report.category }}</td>
                  <td>{{ report.createdAt }}</td>
                  <td>
                    <ui-badge [type]="report.status === 'published' ? 'success' : 'neutral'">
                      {{ report.status }}
                    </ui-badge>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </ui-card>
    </div>
  `,
  styles: [`
    .mfe-reporting-container {
      padding: var(--tds-spacing-9);
    }
    .tds-desc {
      color: var(--tds-color-neutral-500);
      margin-bottom: var(--tds-spacing-7);
    }
    .tds-table-container {
      overflow-x: auto;
    }
    .tds-table {
      width: 100%;
      border-collapse: collapse;
      background-color: var(--tds-color-neutral-10);
      border-radius: var(--tds-border-radius-m);
      overflow: hidden;
      border: 1px solid var(--tds-color-neutral-200);
    }
    .tds-table th, .tds-table td {
      padding: var(--tds-spacing-7) var(--tds-spacing-9);
      text-align: left;
      border-bottom: 1px solid var(--tds-color-neutral-200);
    }
    .tds-table th {
      background-color: var(--tds-color-neutral-50);
      color: var(--tds-color-neutral-500);
      font-size: var(--tds-font-size-3);
    }
  `]
})
export class RemoteEntryComponent {
  public readonly reports = signal<ReportData[]>([
    { id: 'REP-01', title: 'Monthly Revenue Analysis', category: 'Finance', createdAt: '2026-08-01', status: 'published' },
    { id: 'REP-02', title: 'User Retention & Cohort', category: 'Analytics', createdAt: '2026-08-03', status: 'published' },
    { id: 'REP-03', title: 'System Latency Audit', category: 'DevOps', createdAt: '2026-08-05', status: 'draft' }
  ]);
}
