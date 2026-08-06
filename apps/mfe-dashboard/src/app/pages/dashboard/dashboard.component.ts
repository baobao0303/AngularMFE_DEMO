import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, EventBusService, DashboardMetrics, MfeEvent } from '@core';
import { CardComponent, BadgeComponent, ButtonComponent, WidgetCardComponent, StatsWidgetComponent } from '@ui';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSTabsModule } from 'tds-ui/tabs';
import { TDSCardModule } from 'tds-ui/card';
import { TDSSkeletonModule } from 'tds-ui/skeleton';
import { TDSTableModule } from 'tds-ui/table';
import { TDSDataTableModule } from 'tds-ui/data-table';
import { DashboardSkeletonComponent } from './components/dashboard-skeleton.component';
import { OverviewTabComponent } from './components/overview-tab/overview-tab.component';
import { PerformanceTabComponent } from './components/performance-tab/performance-tab.component';
import { ActivityTabComponent } from './components/activity-tab/activity-tab.component';
import { DashboardApiService } from '../../services/dashboard-api.service';

export type TimeFilter = '30D' | '90D' | '1Y';
export type ActivityFilterType = 'All' | 'Projects' | 'Security' | 'System';

export interface ProjectItem {
  name: string;
  manager: string;
  status: 'On Track' | 'At Risk';
  revenue: string;
}

export interface MfeBenchmarkItem {
  remoteApp: string;
  port: number;
  bundleSize: string;
  loadTime: string;
  status: string;
}

export interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  projectsActive: number;
  completionRate: number;
  rating: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'Projects' | 'Security' | 'System';
  user?: { name: string; avatar: string };
  title: string;
  description: string;
  time: string;
  iconType?: 'avatar' | 'backup' | 'security';
}

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
    TDSTagModule,
    TDSTabsModule,
    TDSCardModule,
    TDSSkeletonModule,
    TDSTableModule,
    TDSDataTableModule,
    DashboardSkeletonComponent,
    OverviewTabComponent,
    PerformanceTabComponent,
    ActivityTabComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly eventBus = inject(EventBusService);
  private readonly apiService = inject(DashboardApiService);

  public readonly isLoading = signal(true);
  public readonly selectedFilter = signal<TimeFilter>('30D');
  public readonly conversionFilter = signal<'W' | 'M' | 'Y'>('M');
  public readonly activityFilter = signal<ActivityFilterType>('All');

  public readonly projectsData = signal<ProjectItem[]>([]);
  public readonly benchmarkData = signal<MfeBenchmarkItem[]>([]);
  public readonly teamPerformanceData = signal<TeamMember[]>([]);
  public readonly activityLogsData = signal<ActivityLogItem[]>([]);

  public readonly metrics = signal<DashboardMetrics>({
    totalUsers: 1420,
    activeSessions: 89,
    revenue: 54300,
    systemHealth: '100% Operational'
  });

  public readonly lastEvent = signal<MfeEvent | null>(null);

  public setFilter(filter: TimeFilter): void {
    this.selectedFilter.set(filter);
  }

  public setConversionFilter(filter: 'W' | 'M' | 'Y'): void {
    this.conversionFilter.set(filter);
  }

  public setActivityFilter(filter: ActivityFilterType): void {
    this.activityFilter.set(filter);
  }

  public ngOnInit(): void {
    // Fetch mock JSON data via API Service HTTP simulation
    this.apiService.getProjects().subscribe(data => this.projectsData.set(data));
    this.apiService.getBenchmarkData().subscribe(data => this.benchmarkData.set(data));
    this.apiService.getTeamPerformance().subscribe(data => this.teamPerformanceData.set(data));
    this.apiService.getActivityLogs().subscribe(data => {
      this.activityLogsData.set(data);
      this.isLoading.set(false);
    });

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
