import { Component, inject, signal, computed, OnInit } from '@angular/core';
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

  public readonly conversionChartData = computed(() => {
    const filter = this.conversionFilter();
    if (filter === 'W') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        description: 'Conversion tracking over last 7 days',
        seg1: 'M 0,160 C 80,145 140,110 200,110',
        seg2: 'M 200,110 C 320,110 480,45 650,50',
        seg3: 'M 650,50 C 780,55 900,38 1000,30',
        areaPath: 'M 0,160 C 80,145 140,110 200,110 C 320,110 480,45 650,50 C 780,55 900,38 1000,30 L 1000,195 L 0,195 Z',
        pt1: { leftPercent: 20, topPercent: 55, val: '3.2%', label: 'Tue' },
        pt2: { leftPercent: 65, topPercent: 25, val: '5.8%', label: 'Fri' }
      };
    } else if (filter === 'M') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        description: 'Conversion tracking over last 30 days',
        seg1: 'M 0,150 C 120,120 250,70 375,70',
        seg2: 'M 375,70 C 500,120 625,95 750,95 C 800,95 840,65 875,50',
        seg3: 'M 875,50 C 920,35 960,25 1000,20',
        areaPath: 'M 0,150 C 120,120 250,70 375,70 C 500,120 625,95 750,95 C 800,95 840,65 875,50 C 920,35 960,25 1000,20 L 1000,195 L 0,195 Z',
        pt1: { leftPercent: 37.5, topPercent: 35, val: '4.5%', label: 'W2' },
        pt2: { leftPercent: 87.5, topPercent: 25, val: '6.1%', label: 'W4' }
      };
    } else {
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        description: 'Conversion tracking over last 12 months',
        seg1: 'M 0,160 C 100,120 180,60 250,60',
        seg2: 'M 250,60 C 375,85 500,110 625,130 C 750,110 820,70 875,50',
        seg3: 'M 875,50 C 930,30 970,22 1000,20',
        areaPath: 'M 0,160 C 100,120 180,60 250,60 C 375,85 500,110 625,130 C 750,110 820,70 875,50 C 930,30 970,22 1000,20 L 1000,195 L 0,195 Z',
        pt1: { leftPercent: 25, topPercent: 30, val: '12.4%', label: 'Q2' },
        pt2: { leftPercent: 87.5, topPercent: 25, val: '18.2%', label: 'Q4' }
      };
    }
  });

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

  public readonly isActivityLoading = signal(false);
  public readonly isTableLoading = signal(false);

  public setFilter(filter: TimeFilter): void {
    if (this.selectedFilter() === filter) return;
    this.isTableLoading.set(true);
    this.selectedFilter.set(filter);
    setTimeout(() => {
      this.isTableLoading.set(false);
    }, 350);
  }

  public setConversionFilter(filter: 'W' | 'M' | 'Y'): void {
    this.conversionFilter.set(filter);
  }

  public setActivityFilter(filter: ActivityFilterType): void {
    if (this.activityFilter() === filter) return;
    this.isActivityLoading.set(true);
    this.activityFilter.set(filter);
    setTimeout(() => {
      this.isActivityLoading.set(false);
    }, 350);
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
