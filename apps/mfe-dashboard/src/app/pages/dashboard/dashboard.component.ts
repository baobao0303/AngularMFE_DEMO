import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, EventBusService, DashboardMetrics, MfeEvent } from '@core';
import { CardComponent, BadgeComponent, ButtonComponent, WidgetCardComponent, StatsWidgetComponent } from '@ui';
import { TDSTagModule } from 'tds-ui/tag';

@Component({
  selector: 'mfe-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    BadgeComponent, 
    ButtonComponent, 
    WidgetCardComponent, 
    StatsWidgetComponent,
    TDSTagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
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
