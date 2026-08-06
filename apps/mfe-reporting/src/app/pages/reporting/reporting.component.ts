import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, BadgeComponent } from '@ui';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSCardModule } from 'tds-ui/card';
import { TDSTableModule } from 'tds-ui/table';
import { TDSSkeletonModule } from 'tds-ui/skeleton';
import { ReportingApiService } from '../../services/reporting-api.service';

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
    CardComponent, 
    BadgeComponent, 
    TDSTagModule,
    TDSCardModule,
    TDSTableModule,
    TDSSkeletonModule
  ],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss'
})
export class ReportingComponent implements OnInit {
  private readonly apiService = inject(ReportingApiService);

  public readonly isLoading = signal(true);
  public readonly selectedStatusFilter = signal<'All' | 'Completed' | 'Pending'>('All');
  public readonly selectedCategory = signal<string>('All Categories');
  public readonly selectedDateRange = signal<string>('Last 30 Days');

  public readonly detailedReports = signal<DetailedReportItem[]>([]);

  public ngOnInit(): void {
    this.apiService.getDetailedReports().subscribe(data => {
      this.detailedReports.set(data);
      this.isLoading.set(false);
    });
  }

  public setStatusFilter(filter: 'All' | 'Completed' | 'Pending'): void {
    this.selectedStatusFilter.set(filter);
  }

  public applyFilters(): void {
    this.isLoading.set(true);
    this.apiService.getDetailedReports().subscribe(data => {
      this.detailedReports.set(data);
      this.isLoading.set(false);
    });
  }
}
