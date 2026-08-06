import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectItem, MfeBenchmarkItem, TeamMember, ActivityLogItem } from '../pages/dashboard/dashboard.component';
import { KanbanTask } from '../pages/projects/projects.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  public getProjects(): Observable<ProjectItem[]> {
    return this.http.get<ProjectItem[]>('/api/dashboard/projects');
  }

  public getBenchmarkData(): Observable<MfeBenchmarkItem[]> {
    return this.http.get<MfeBenchmarkItem[]>('/api/dashboard/benchmarks');
  }

  public getTeamPerformance(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>('/api/dashboard/team-performance');
  }

  public getActivityLogs(): Observable<ActivityLogItem[]> {
    return this.http.get<ActivityLogItem[]>('/api/dashboard/activity-logs');
  }

  public getKanbanTasks(): Observable<KanbanTask[]> {
    return this.http.get<KanbanTask[]>('/api/dashboard/kanban-tasks');
  }
}
