import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, EventBusService, DashboardMetrics, MfeEvent } from '@core';
import { CardComponent, BadgeComponent, ButtonComponent, WidgetCardComponent, StatsWidgetComponent } from '@ui';

@Component({
  selector: 'mfe-dashboard-entry',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    BadgeComponent, 
    ButtonComponent, 
    WidgetCardComponent, 
    StatsWidgetComponent
  ],
  template: `
    <div class="mfe-dashboard-container">
      <ui-card title="📊 Dashboard MFE (Port 4202)">
        <div class="tds-metrics-grid">
          <ui-stats-widget label="Total Users" [value]="metrics().totalUsers" change="+12.5%"></ui-stats-widget>
          <ui-stats-widget label="Active Sessions" [value]="metrics().activeSessions" change="+5.2%"></ui-stats-widget>
          <ui-stats-widget label="Monthly Revenue" [value]="'$' + metrics().revenue" change="+18.4%"></ui-stats-widget>
          <ui-stats-widget label="System Health" [value]="metrics().systemHealth" change="100%"></ui-stats-widget>
        </div>

        <ui-widget-card header="📡 Inter-MFE Event Bus Live Feed">
          <div class="tds-event-stream">
            @if (lastEvent()) {
              <p class="tds-event-msg">
                <strong>[{{ lastEvent()?.sourceRemote }}]</strong> {{ lastEvent()?.type }}: {{ lastEvent()?.payload | json }}
              </p>
            } @else {
              <p class="tds-event-empty">No events received yet. Try logging in or out on mfe-auth.</p>
            }
          </div>
        </ui-widget-card>
      </ui-card>
    </div>
  `,
  styles: [`
    .mfe-dashboard-container {
      padding: var(--tds-spacing-9);
    }
    .tds-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--tds-spacing-7);
      margin-bottom: var(--tds-spacing-9);
    }
    .tds-event-stream {
      background-color: var(--tds-color-neutral-50);
      padding: var(--tds-spacing-7);
      border-radius: var(--tds-border-radius-m);
      border: 1px solid var(--tds-color-neutral-200);
    }
    .tds-event-msg {
      font-family: monospace;
      color: var(--tds-color-secondary-500);
      margin: 0;
    }
    .tds-event-empty {
      color: var(--tds-color-neutral-500);
      font-style: italic;
      margin: 0;
    }
  `]
})
export class RemoteEntryComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);

  public readonly metrics = signal<DashboardMetrics>({
    totalUsers: 1420,
    activeSessions: 89,
    revenue: 54300,
    systemHealth: '100% Operational'
  });

  public readonly lastEvent = signal<MfeEvent | null>(null);

  public ngOnInit(): void {
    this.eventBus.on<MfeEvent>('USER_LOGGED_IN').subscribe((event: MfeEvent) => {
      this.lastEvent.set(event);
    });
    this.eventBus.on<MfeEvent>('USER_REGISTERED').subscribe((event: MfeEvent) => {
      this.lastEvent.set(event);
    });
    this.eventBus.on<MfeEvent>('USER_LOGGED_OUT').subscribe((event: MfeEvent) => {
      this.lastEvent.set(event);
    });
  }
}
