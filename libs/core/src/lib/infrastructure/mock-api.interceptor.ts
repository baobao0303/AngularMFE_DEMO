import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  if (url.startsWith('/api/')) {
    console.info(`%c[HTTP API Call] ${req.method} ${req.urlWithParams}`, 'color: #15803D; font-weight: bold; background: #DCFCE7; padding: 3px 8px; border-radius: 4px; border: 1px solid #86EFAC;');

    let mockBody: any = null;

    // 1. Dashboard API Endpoints
    if (url.includes('/api/dashboard/projects')) {
      mockBody = [
        { name: 'Nexus Launch', manager: 'Sarah J.', status: 'On Track', revenue: '$45,200' },
        { name: 'Omega Redesign', manager: 'Mike T.', status: 'At Risk', revenue: '$32,850' },
        { name: 'Alpha Integration', manager: 'Elena V.', status: 'On Track', revenue: '$28,100' }
      ];
    } else if (url.includes('/api/dashboard/benchmarks')) {
      mockBody = [
        { remoteApp: 'mfe-auth', port: 4201, bundleSize: '133.7 kB', loadTime: '12 ms', status: 'Active' },
        { remoteApp: 'mfe-dashboard', port: 4202, bundleSize: '85.4 kB', loadTime: '18 ms', status: 'Active' },
        { remoteApp: 'mfe-reporting', port: 4203, bundleSize: '85.5 kB', loadTime: '22 ms', status: 'Active' }
      ];
    } else if (url.includes('/api/dashboard/team-performance')) {
      mockBody = [
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
    } else if (url.includes('/api/dashboard/activity-logs')) {
      const filterType = req.params.get('type');
      let items = [
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
      if (filterType && filterType !== 'All') {
        items = items.filter(item => item.type === filterType);
      }
      mockBody = items;
    } else if (url.includes('/api/dashboard/kanban-tasks')) {
      const priority = req.params.get('priority');
      const tab = req.params.get('tab');
      const q = req.params.get('q');
      const sort = req.params.get('sort');

      let tasks = [
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

      if (priority && priority !== 'all') {
        tasks = tasks.filter(t => t.priority === priority);
      }
      if (tab && tab !== 'all') {
        if (tab === 'active') tasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
        else if (tab === 'completed') tasks = tasks.filter(t => t.status === 'completed');
        else if (tab === 'on_hold') tasks = tasks.filter(t => t.status === 'in_review');
      }
      if (q) {
        const search = q.toLowerCase();
        tasks = tasks.filter(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
      }
      if (sort === 'title') {
        tasks = [...tasks].sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'priority') {
        const pOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        tasks = [...tasks].sort((a, b) => (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2));
      }
      mockBody = tasks;
    } else if (url.includes('/api/reporting/detailed-reports')) {
      const statusParam = req.params.get('status');
      let reports = [
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
      if (statusParam && statusParam !== 'All') {
        reports = reports.filter(item => item.status === statusParam);
      }
      mockBody = reports;
    } else if (url.includes('/api/auth/login')) {
      const body = (req.body as any) || {};
      const emailVal = body.email || 'name@company.com';
      const user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: emailVal,
        name: emailVal.split('@')[0],
        role: 'Administrator'
      };
      mockBody = { user, token: `mock_jwt_${user.id}` };
    } else if (url.includes('/api/auth/sso-login')) {
      const user = {
        id: 'usr_sso_' + Math.random().toString(36).substring(2, 9),
        email: 'sso.admin@mfe.com',
        name: 'sso.admin',
        role: 'Administrator'
      };
      mockBody = { user, token: `mock_jwt_${user.id}` };
    } else if (url.includes('/api/auth/reset-password')) {
      mockBody = { success: true, message: 'Password reset email sent' };
    }

    if (mockBody !== null) {
      return of(new HttpResponse({ status: 200, body: mockBody })).pipe(delay(200));
    }
  }

  return next(req);
};
