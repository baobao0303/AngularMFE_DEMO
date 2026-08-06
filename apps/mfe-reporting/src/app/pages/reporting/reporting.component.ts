import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, BadgeComponent } from '@ui';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSCardModule } from 'tds-ui/card';
import { TDSTableModule } from 'tds-ui/table';
import { TDSSkeletonModule } from 'tds-ui/skeleton';
import { TDSButtonModule } from 'tds-ui/button';
import { TDSSelectModule } from 'tds-ui/select';
import { ReportingApiService } from './services/reporting-api.service';

export interface DetailedReportItem {
  id: string;
  name: string;
  dateCreated: string;
  author: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  status: 'Completed' | 'Pending';
}

@Component({
  selector: 'mfe-reporting-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CardComponent, 
    BadgeComponent, 
    TDSTagModule,
    TDSCardModule,
    TDSTableModule,
    TDSSkeletonModule,
    TDSButtonModule,
    TDSSelectModule
  ],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss'
})
export class ReportingComponent implements OnInit {
  private readonly apiService = inject(ReportingApiService);

  public readonly isLoading = signal(true);
  
  // Draft Filter Selection States (Updated by UI clicks/selects, but NOT active yet)
  public readonly draftStatusFilter = signal<'All' | 'Completed' | 'Pending'>('All');
  public readonly draftCategory = signal<string>('All Categories');
  public readonly draftDateRange = signal<string>('Last 30 Days');

  // Applied Filter States (Updated ONLY when clicking "Apply Filters" button)
  public readonly activeStatusFilter = signal<'All' | 'Completed' | 'Pending'>('All');
  public readonly activeCategory = signal<string>('All Categories');
  public readonly activeDateRange = signal<string>('Last 30 Days');

  public readonly dateRangeOptions = [
    { value: 'Last 30 Days', label: 'Last 30 Days' },
    { value: 'Last 90 Days', label: 'Last 90 Days' },
    { value: 'Year to Date', label: 'Year to Date' },
    { value: 'Custom Range', label: 'Custom Range' }
  ];

  public readonly categoryOptions = [
    { value: 'All Categories', label: 'All Categories' },
    { value: 'Financial', label: 'Financial' },
    { value: 'User Engagement', label: 'User Engagement' },
    { value: 'System Performance', label: 'System Performance' }
  ];

  public readonly detailedReports = signal<DetailedReportItem[]>([]);

  public ngOnInit(): void {
    this.apiService.getDetailedReports().subscribe(data => {
      this.detailedReports.set(data);
      this.isLoading.set(false);
    });
  }

  public setStatusFilter(filter: 'All' | 'Completed' | 'Pending'): void {
    this.draftStatusFilter.set(filter);
  }

  public applyFilters(): void {
    this.isLoading.set(true);

    // Commit draft filter choices into active filter state
    this.activeStatusFilter.set(this.draftStatusFilter());
    this.activeCategory.set(this.draftCategory());
    this.activeDateRange.set(this.draftDateRange());

    this.apiService.getDetailedReports({
      status: this.draftStatusFilter(),
      category: this.draftCategory(),
      dateRange: this.draftDateRange()
    }).subscribe(data => {
      this.detailedReports.set(data);
      this.isLoading.set(false);
    });
  }
}
