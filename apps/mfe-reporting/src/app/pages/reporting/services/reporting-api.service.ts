import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadableRepository } from '@core';
import { DetailedReportItem } from '../reporting.component';

@Injectable({
  providedIn: 'root'
})
export class ReportingApiService extends ReadableRepository {
  public getDetailedReports(filters?: { status?: string; category?: string; dateRange?: string; page?: number }): Observable<DetailedReportItem[]> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }
    if (filters?.category && filters.category !== 'All Categories') {
      params = params.set('category', filters.category);
    }
    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    return this.findAll<DetailedReportItem[]>('/api/reporting/detailed-reports', { params });
  }
}
