import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DetailedReportItem } from '../pages/reporting/reporting.component';

@Injectable({
  providedIn: 'root'
})
export class ReportingApiService {
  public getDetailedReports(): Observable<DetailedReportItem[]> {
    const mockData: DetailedReportItem[] = [
      {
        id: 'REP-001',
        name: 'Q3 Financial Summary',
        dateCreated: 'Oct 12, 2023',
        author: { name: 'Jane Doe', initials: 'JD', avatarBg: 'bg-[#800A20] text-white' },
        status: 'Completed'
      },
      {
        id: 'REP-002',
        name: 'User Engagement Metrics',
        dateCreated: 'Oct 10, 2023',
        author: { name: 'Alex Smith', initials: 'AS', avatarBg: 'bg-[#505F76] text-white' },
        status: 'Pending'
      },
      {
        id: 'REP-003',
        name: 'Annual Audit Draft',
        dateCreated: 'Oct 05, 2023',
        author: { name: 'Mary Jones', initials: 'MJ', avatarBg: 'bg-[#166534] text-white' },
        status: 'Completed'
      },
      {
        id: 'REP-004',
        name: 'Infrastructure Latency Log',
        dateCreated: 'Sep 28, 2023',
        author: { name: 'Robert Chen', initials: 'RC', avatarBg: 'bg-[#4F46E5] text-white' },
        status: 'Completed'
      },
      {
        id: 'REP-005',
        name: 'Q4 Customer Churn Projection',
        dateCreated: 'Sep 15, 2023',
        author: { name: 'Elena Vance', initials: 'EV', avatarBg: 'bg-[#D97706] text-white' },
        status: 'Pending'
      }
    ];
    return of(mockData).pipe(delay(300));
  }
}
