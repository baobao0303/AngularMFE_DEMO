import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProjectItem, MfeBenchmarkItem, TeamMember, ActivityLogItem } from '../pages/dashboard/dashboard.component';
import { KanbanTask } from '../pages/projects/projects.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  public getProjects(): Observable<ProjectItem[]> {
    const mockData: ProjectItem[] = [
      { name: 'Nexus Launch', manager: 'Sarah J.', status: 'On Track', revenue: '$45,200' },
      { name: 'Omega Redesign', manager: 'Mike T.', status: 'At Risk', revenue: '$32,850' },
      { name: 'Alpha Integration', manager: 'Elena V.', status: 'On Track', revenue: '$28,100' }
    ];
    return of(mockData).pipe(delay(300));
  }

  public getBenchmarkData(): Observable<MfeBenchmarkItem[]> {
    const mockData: MfeBenchmarkItem[] = [
      { remoteApp: 'mfe-auth', port: 4201, bundleSize: '133.7 kB', loadTime: '12 ms', status: 'Active' },
      { remoteApp: 'mfe-dashboard', port: 4202, bundleSize: '85.4 kB', loadTime: '18 ms', status: 'Active' },
      { remoteApp: 'mfe-reporting', port: 4203, bundleSize: '85.5 kB', loadTime: '22 ms', status: 'Active' }
    ];
    return of(mockData).pipe(delay(300));
  }

  public getTeamPerformance(): Observable<TeamMember[]> {
    const mockData: TeamMember[] = [
      {
        name: 'Sarah J.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        role: 'Product Manager',
        projectsActive: 4,
        completionRate: 95,
        rating: '4.8/5'
      },
      {
        name: 'Mike T.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'Senior Developer',
        projectsActive: 2,
        completionRate: 78,
        rating: '4.1/5'
      },
      {
        name: 'Elena V.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'UX Designer',
        projectsActive: 3,
        completionRate: 88,
        rating: '4.5/5'
      }
    ];
    return of(mockData).pipe(delay(300));
  }

  public getActivityLogs(): Observable<ActivityLogItem[]> {
    const mockData: ActivityLogItem[] = [
      {
        id: '1',
        type: 'Projects',
        iconType: 'avatar',
        user: {
          name: 'Jane Doe',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
        },
        title: 'Jane Doe updated Project X',
        description: "Moved 3 tasks to 'Done' and updated the sprint milestone.",
        time: '10 mins ago'
      },
      {
        id: '2',
        type: 'System',
        iconType: 'backup',
        title: 'System backup completed',
        description: 'Daily snapshot of database and user files created successfully.',
        time: '2 hours ago'
      },
      {
        id: '3',
        type: 'Projects',
        iconType: 'avatar',
        user: {
          name: 'Mike T',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
        },
        title: 'Mike T deployed to production',
        description: 'Release v2.4.1 containing hotfixes for the payment gateway.',
        time: 'Yesterday, 4:30 PM'
      },
      {
        id: '4',
        type: 'Security',
        iconType: 'security',
        title: 'Failed login attempt',
        description: 'Multiple failed attempts detected from IP 192.168.1.104.',
        time: 'Yesterday, 2:15 PM'
      }
    ];
    return of(mockData).pipe(delay(300));
  }

  public getKanbanTasks(): Observable<KanbanTask[]> {
    const mockData: KanbanTask[] = [
      {
        id: 'task-1',
        title: 'Legacy API Migration',
        description: 'Migrating v1 REST endpoints to the new GraphQL architecture. Paused pending security review.',
        priority: 'MEDIUM',
        status: 'todo',
        checklistDone: 2,
        checklistTotal: 6,
        members: [
          { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
          { name: 'Elena V.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
        ]
      },
      {
        id: 'task-2',
        title: 'Update Documentation',
        description: 'Review and update API documentation for Q3 releases.',
        priority: 'LOW',
        status: 'todo',
        checklistDone: 0,
        checklistTotal: 3,
        members: [
          { name: 'Mike T.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
        ]
      },
      {
        id: 'task-3',
        title: 'Q4 Conversion Optimization',
        description: 'Implementing A/B testing on primary landing pages to increase sign-up conversion rates by 15% before EOY.',
        priority: 'HIGH',
        status: 'in_progress',
        progressPercent: 68,
        commentsCount: 4,
        members: [
          { name: 'Jane Doe', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
          { name: 'Alex Smith', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' }
        ]
      },
      {
        id: 'task-4',
        title: 'Data Warehouse Sync',
        description: 'Real-time synchronization pipeline between primary transactional database and Snowflake data warehouse.',
        priority: 'MEDIUM',
        status: 'in_review',
        checklistDone: 4,
        checklistTotal: 4,
        members: [
          { name: 'Robert C.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
        ]
      },
      {
        id: 'task-5',
        title: 'User Onboarding V2',
        description: 'Redesign of the initial user signup flow to reduce drop-off rates and improve initial data collection.',
        priority: 'HIGH',
        status: 'completed',
        checklistDone: 8,
        checklistTotal: 8,
        members: [
          { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
          { name: 'Elena V.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
          { name: 'Mike T.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
        ]
      }
    ];
    return of(mockData).pipe(delay(300));
  }
}
