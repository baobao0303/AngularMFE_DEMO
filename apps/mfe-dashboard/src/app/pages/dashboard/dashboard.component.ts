import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseEventBusService, BaseStorageService, MfeEvent } from '@core';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSTabsModule } from 'tds-ui/tabs';
import { TDSCardModule } from 'tds-ui/card';
import { TDSSkeletonModule } from 'tds-ui/skeleton';
import { TDSTableModule } from 'tds-ui/table';
import { TDSDataTableModule } from 'tds-ui/data-table';
import { DashboardApiService } from '../../services/dashboard-api.service';

export type TimeFilter = '30D' | '90D' | '1Y';
export type ActivityFilterType = 'All' | 'Projects' | 'Security' | 'System';

export interface DashboardMetrics {
  totalUsers: number;
  activeSessions: number;
  revenue: number;
  systemHealth: string;
}

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
    TDSTagModule,
    TDSTabsModule,
    TDSCardModule,
    TDSSkeletonModule,
    TDSTableModule,
    TDSDataTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public readonly storage = inject(BaseStorageService);
  public readonly eventBus = inject(BaseEventBusService);
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
    this.eventBus.on('USER_LOGGED_IN').subscribe((evt) => {
      this.lastEvent.set(evt);
    });

    this.apiService.getProjects().subscribe(data => this.projectsData.set(data));
    this.apiService.getBenchmarkData().subscribe(data => this.benchmarkData.set(data));
    this.apiService.getTeamPerformance().subscribe(data => this.teamPerformanceData.set(data));
    this.apiService.getActivityLogs().subscribe(data => {
      this.activityLogsData.set(data);
      this.isLoading.set(false);
    });
  }
}
