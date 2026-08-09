import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, BadgeComponent } from '@ui';
import { RemoteStyleService } from '@core';
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
  private readonly styleService = inject(RemoteStyleService);

  public readonly isLoading = signal(true);
  
  // Draft Filter Selection States
  public readonly draftStatusFilter = signal<'All' | 'Completed' | 'Pending'>('All');
  public readonly draftCategory = signal<string>('All Categories');
  public readonly draftDateRange = signal<string>('Last 30 Days');

  // Applied Filter States
  public readonly activeStatusFilter = signal<'All' | 'Completed' | 'Pending'>('All');
  public readonly activeCategory = signal<string>('All Categories');
  public readonly activeDateRange = signal<string>('Last 30 Days');

  public readonly detailedReports = signal<DetailedReportItem[]>([]);

  // Reactive Pagination Signals
  public readonly currentPage = signal<number>(1);
  public readonly pageSize = signal<number>(5);

  public readonly filteredReports = computed(() => {
    const filter = this.activeStatusFilter();
    const list = this.detailedReports();
    if (filter === 'All') return list;
    return list.filter(item => item.status === filter);
  });

  public readonly totalItems = computed(() => this.filteredReports().length);

  public readonly totalPages = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize()) || 1;
  });

  public readonly pageNumbers = computed(() => {
    const count = this.totalPages();
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  public readonly paginatedReports = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    return this.filteredReports().slice(startIndex, startIndex + size);
  });

  public readonly showingRangeText = computed(() => {
    const total = this.totalItems();
    if (total === 0) return 'Showing 0 of 0 entries';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return `Showing ${start} to ${end} of ${total} entries`;
  });

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

  public ngOnInit(): void {
    // 1. Dynamically load shared SCSS theme style from mfe-dashboard using RemoteStyleService
    this.styleService.loadModuleStyle('mfe-dashboard', 'default', 'mfe-shared-card', './ThemeStyle').catch(() => {
      // Fallback silently if standalone without dashboard running
    });

    // 2. Load reports from API
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
    this.currentPage.set(1); // Reset to page 1 on filter change

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

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  public prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }
}
