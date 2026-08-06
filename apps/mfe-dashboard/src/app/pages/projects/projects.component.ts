import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSCardModule } from 'tds-ui/card';
import { TDSDropDownModule } from 'tds-ui/dropdown';
import { TDSMenuModule } from 'tds-ui/menu';
import { TDSSelectModule } from 'tds-ui/select';
import { TDSNotificationModule, TDSNotificationService } from 'tds-ui/notification';
import { ProjectsApiService } from './services/projects-api.service';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ColumnStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';

export interface TaskMember {
  name: string;
  avatar: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: ColumnStatus;
  checklistDone?: number;
  checklistTotal?: number;
  progressPercent?: number;
  commentsCount?: number;
  members: TaskMember[];
}

@Component({
  selector: 'mfe-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TDSTagModule, TDSCardModule, TDSDropDownModule, TDSMenuModule, TDSSelectModule, TDSNotificationModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private readonly apiService = inject(ProjectsApiService);
  private readonly notification = inject(TDSNotificationService);

  public readonly searchQuery = signal('');
  public readonly selectedTab = signal<'all' | 'active' | 'completed' | 'on_hold'>('all');
  public readonly draggedTaskId = signal<string | null>(null);
  public readonly showCreateModal = signal(false);
  public readonly activeMenuTaskId = signal<string | null>(null);
  public readonly selectedTaskForDetail = signal<KanbanTask | null>(null);
  public readonly actionToastMessage = signal<string | null>(null);

  public readonly newPriority = signal<TaskPriority>('MEDIUM');

  public readonly prioritySelectOptions = [
    { value: 'HIGH', label: 'High Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'LOW', label: 'Low Priority' }
  ];

  public readonly statusSelectOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'completed', label: 'Completed' }
  ];

  // Dropdown Filter & Sort Selection State
  public readonly selectedFilterOption = signal<string>('all');
  public readonly selectedFilterLabel = signal<string>('Filter');
  public readonly showFilterDropdown = signal(false);

  public readonly selectedSortOption = signal<string>('recent');
  public readonly selectedSortLabel = signal<string>('Sort By: Recent');
  public readonly showSortDropdown = signal(false);

  @HostListener('document:click')
  public onDocumentClick(): void {
    this.showFilterDropdown.set(false);
    this.showSortDropdown.set(false);
    this.activeMenuTaskId.set(null);
  }

  public toggleFilterDropdown(event: Event): void {
    event.stopPropagation();
    this.showSortDropdown.set(false);
    this.activeMenuTaskId.set(null);
    this.showFilterDropdown.update(v => !v);
  }

  public toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.showFilterDropdown.set(false);
    this.activeMenuTaskId.set(null);
    this.showSortDropdown.update(v => !v);
  }

  public setFilter(value: string, label: string): void {
    this.selectedFilterOption.set(value);
    this.selectedFilterLabel.set(label);
    this.showFilterDropdown.set(false);
    this.fetchTasksFromApi();
  }

  public setSort(value: string, label: string): void {
    this.selectedSortOption.set(value);
    this.selectedSortLabel.set(label);
    this.showSortDropdown.set(false);
    this.fetchTasksFromApi();
  }

  public readonly tasks = signal<KanbanTask[]>([]);

  public ngOnInit(): void {
    this.fetchTasksFromApi();
  }

  public fetchTasksFromApi(): void {
    this.apiService.getKanbanTasks({
      priority: this.selectedFilterOption(),
      sort: this.selectedSortOption(),
      tab: this.selectedTab(),
      search: this.searchQuery()
    }).subscribe(data => {
      this.tasks.set(data);
    });
  }

  public readonly todoTasks = computed(() => this.tasks().filter(t => t.status === 'todo'));
  public readonly inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'in_progress'));
  public readonly inReviewTasks = computed(() => this.tasks().filter(t => t.status === 'in_review'));
  public readonly completedTasks = computed(() => this.tasks().filter(t => t.status === 'completed'));

  public onSearch(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.fetchTasksFromApi();
  }

  public setTab(tab: 'all' | 'active' | 'completed' | 'on_hold'): void {
    this.selectedTab.set(tab);
    this.fetchTasksFromApi();
  }

  public getTaskProgress(task: KanbanTask): number {
    if (task.progressPercent !== undefined) return task.progressPercent;
    if (task.checklistTotal && task.checklistTotal > 0) {
      return Math.round(((task.checklistDone || 0) / task.checklistTotal) * 100);
    }
    if (task.status === 'completed') return 100;
    if (task.status === 'in_review') return 85;
    if (task.status === 'in_progress') return 60;
    return 25;
  }

  // HTML5 Drag and Drop handlers
  public onDragStart(event: DragEvent, taskId: string): void {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  public onDrop(event: DragEvent, targetStatus: ColumnStatus): void {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    if (taskId) {
      this.tasks.update(list => 
        list.map(t => t.id === taskId ? { ...t, status: targetStatus } : t)
      );
      this.draggedTaskId.set(null);
      this.triggerToast('Task Moved', `Task moved to ${targetStatus.replace('_', ' ')}.`, 'info');
    }
  }

  public toggleCreateModal(): void {
    this.showCreateModal.update(v => !v);
  }

  public toggleTaskMenu(event: Event, taskId: string): void {
    event.stopPropagation();
    if (this.activeMenuTaskId() === taskId) {
      this.activeMenuTaskId.set(null);
    } else {
      this.activeMenuTaskId.set(taskId);
    }
  }

  public closeAllMenus(): void {
    this.activeMenuTaskId.set(null);
    this.showFilterDropdown.set(false);
    this.showSortDropdown.set(false);
  }

  public openTaskDetail(task: KanbanTask): void {
    this.activeMenuTaskId.set(null);
    this.selectedTaskForDetail.set({ ...task });
  }

  public closeTaskDetail(): void {
    this.selectedTaskForDetail.set(null);
  }

  public updateTaskPriority(task: KanbanTask, newPriority: TaskPriority): void {
    this.selectedTaskForDetail.set({ ...task, priority: newPriority });
  }

  public updateTaskStatus(task: KanbanTask, newStatus: ColumnStatus): void {
    this.selectedTaskForDetail.set({ ...task, status: newStatus });
  }

  public saveTaskDetail(title: string, desc: string, priority: TaskPriority, status: ColumnStatus): void {
    const detail = this.selectedTaskForDetail();
    if (!detail) return;
    this.tasks.update(list => list.map(t => t.id === detail.id ? { ...t, title, description: desc, priority, status } : t));
    this.closeTaskDetail();
    this.triggerToast('Task Updated', `Task "${title}" updated successfully.`, 'success');
  }

  public deleteTask(event: Event | null, taskId: string): void {
    if (event) event.stopPropagation();
    this.tasks.update(list => list.filter(t => t.id !== taskId));
    this.activeMenuTaskId.set(null);
    if (this.selectedTaskForDetail()?.id === taskId) {
      this.closeTaskDetail();
    }
    this.triggerToast('Task Deleted', 'Task removed from board successfully.', 'warning');
  }

  public duplicateTask(event: Event, task: KanbanTask): void {
    event.stopPropagation();
    const dup: KanbanTask = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`
    };
    this.tasks.update(list => [dup, ...list]);
    this.activeMenuTaskId.set(null);
    this.triggerToast('Task Duplicated', `Created a copy of "${task.title}".`, 'info');
  }

  public toggleTaskPriority(event: Event, taskId: string): void {
    event.stopPropagation();
    const priorities: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
    this.tasks.update(list => list.map(t => {
      if (t.id === taskId) {
        const nextPriority = priorities[(priorities.indexOf(t.priority) + 1) % priorities.length];
        return { ...t, priority: nextPriority };
      }
      return t;
    }));
    this.activeMenuTaskId.set(null);
    this.triggerToast('Priority Changed', 'Task priority updated.', 'info');
  }

  public addTask(title: string, desc: string, priority: TaskPriority): void {
    if (!title.trim()) return;
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: desc.trim() || 'New task initiative.',
      priority: priority,
      status: 'todo',
      checklistDone: 0,
      checklistTotal: 3,
      members: [
        { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
      ]
    };
    this.tasks.update(list => [newTask, ...list]);
    this.showCreateModal.set(false);
    this.triggerToast('Task Created', `Task "${title.trim()}" added to board.`, 'success');
  }

  private triggerToast(title: string, content: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    this.actionToastMessage.set(content);
    if (type === 'success') {
      this.notification.success(title, content);
    } else if (type === 'warning') {
      this.notification.warning(title, content);
    } else if (type === 'error') {
      this.notification.error(title, content);
    } else {
      this.notification.info(title, content);
    }
    setTimeout(() => {
      this.actionToastMessage.set(null);
    }, 2500);
  }
}
