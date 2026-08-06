import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadableRepository } from '@core';
import { ProjectItem, MfeBenchmarkItem, TeamMember, ActivityLogItem } from '../dashboard.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService extends ReadableRepository {
  public getProjects(): Observable<ProjectItem[]> {
    return this.findAll<ProjectItem[]>('/api/dashboard/projects');
  }

  public getBenchmarkData(): Observable<MfeBenchmarkItem[]> {
    return this.findAll<MfeBenchmarkItem[]>('/api/dashboard/benchmarks');
  }

  public getTeamPerformance(): Observable<TeamMember[]> {
    return this.findAll<TeamMember[]>('/api/dashboard/team-performance');
  }

  public getActivityLogs(type?: string): Observable<ActivityLogItem[]> {
    let params = new HttpParams();
    if (type && type !== 'All') {
      params = params.set('type', type);
    }
    return this.findAll<ActivityLogItem[]>('/api/dashboard/activity-logs', { params });
  }
}
