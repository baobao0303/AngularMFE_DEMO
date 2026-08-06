import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSCardModule } from 'tds-ui/card';
import { TDSDropDownModule } from 'tds-ui/dropdown';
import { TDSMenuModule } from 'tds-ui/menu';
import { DashboardApiService } from '../../services/dashboard-api.service';

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
  imports: [CommonModule, FormsModule, TDSTagModule, TDSCardModule, TDSDropDownModule, TDSMenuModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private readonly apiService = inject(DashboardApiService);

  public readonly searchQuery = signal('');
  public readonly selectedTab = signal<'all' | 'active' | 'completed' | 'on_hold'>('all');
  public readonly draggedTaskId = signal<string | null>(null);
  public readonly showCreateModal = signal(false);
  public readonly activeMenuTaskId = signal<string | null>(null);
  public readonly selectedTaskForDetail = signal<KanbanTask | null>(null);
  public readonly actionToastMessage = signal<string | null>(null);

  // Dropdown Filter & Sort Selection State
  public readonly selectedFilterOption = signal<string>('all');
  public readonly selectedFilterLabel = signal<string>('Filter');
  public readonly showFilterDropdown = signal(false);

  public readonly selectedSortOption = signal<string>('recent');
  public readonly selectedSortLabel = signal<string>('Sort By: Recent');
  public readonly showSortDropdown = signal(false);

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
  }

  public setSort(value: string, label: string): void {
    this.selectedSortOption.set(value);
    this.selectedSortLabel.set(label);
    this.showSortDropdown.set(false);
  }

  public readonly tasks = signal<KanbanTask[]>([]);

  public ngOnInit(): void {
    this.apiService.getKanbanTasks().subscribe(data => this.tasks.set(data));
  }

  public readonly filteredTasks = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.tasks().filter(t => {
      const matchQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const tab = this.selectedTab();
      if (tab === 'active') return matchQuery && (t.status === 'in_progress' || t.status === 'todo');
      if (tab === 'completed') return matchQuery && t.status === 'completed';
      if (tab === 'on_hold') return matchQuery && t.status === 'in_review';
      return matchQuery;
    });
  });

  public readonly todoTasks = computed(() => this.filteredTasks().filter(t => t.status === 'todo'));
  public readonly inProgressTasks = computed(() => this.filteredTasks().filter(t => t.status === 'in_progress'));
  public readonly inReviewTasks = computed(() => this.filteredTasks().filter(t => t.status === 'in_review'));
  public readonly completedTasks = computed(() => this.filteredTasks().filter(t => t.status === 'completed'));

  public onSearch(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  public setTab(tab: 'all' | 'active' | 'completed' | 'on_hold'): void {
    this.selectedTab.set(tab);
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
      this.triggerToast('Task moved successfully');
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

  public saveTaskDetail(title: string, desc: string, priority: TaskPriority, status: ColumnStatus): void {
    const detail = this.selectedTaskForDetail();
    if (!detail) return;
    this.tasks.update(list => list.map(t => t.id === detail.id ? { ...t, title, description: desc, priority, status } : t));
    this.closeTaskDetail();
    this.triggerToast('Task updated successfully');
  }

  public deleteTask(event: Event | null, taskId: string): void {
    if (event) event.stopPropagation();
    this.tasks.update(list => list.filter(t => t.id !== taskId));
    this.activeMenuTaskId.set(null);
    if (this.selectedTaskForDetail()?.id === taskId) {
      this.closeTaskDetail();
    }
    this.triggerToast('Task deleted successfully');
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
    this.triggerToast('Task duplicated successfully');
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
    this.triggerToast('Priority updated');
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
    this.triggerToast('New task added successfully');
  }

  private triggerToast(msg: string): void {
    this.actionToastMessage.set(msg);
    setTimeout(() => {
      this.actionToastMessage.set(null);
    }, 2500);
  }
}
