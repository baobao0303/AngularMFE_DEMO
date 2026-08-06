import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetailedReportItem } from '../pages/reporting/reporting.component';

@Injectable({
  providedIn: 'root'
})
export class ReportingApiService {
  private readonly http = inject(HttpClient);

  public getDetailedReports(): Observable<DetailedReportItem[]> {
    return this.http.get<DetailedReportItem[]>('/api/reporting/detailed-reports');
  }
}
