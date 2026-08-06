import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadableRepository } from '@core';
import { KanbanTask } from '../projects.component';

@Injectable({
  providedIn: 'root'
})
export class ProjectsApiService extends ReadableRepository {
  public getKanbanTasks(filterOptions?: { priority?: string; sort?: string; tab?: string; search?: string }): Observable<KanbanTask[]> {
    let params = new HttpParams();
    if (filterOptions?.priority && filterOptions.priority !== 'all') {
      params = params.set('priority', filterOptions.priority);
    }
    if (filterOptions?.sort) {
      params = params.set('sort', filterOptions.sort);
    }
    if (filterOptions?.tab && filterOptions.tab !== 'all') {
      params = params.set('tab', filterOptions.tab);
    }
    if (filterOptions?.search) {
      params = params.set('q', filterOptions.search);
    }
    return this.findAll<KanbanTask[]>('/api/dashboard/kanban-tasks', { params });
  }
}
