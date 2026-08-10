export interface ProjectItem {
  name: string;
  manager: string;
  status: string;
  revenue: string;
}

export interface MfeBenchmarkItem {
  remoteApp: string;
  port: number;
  bundleSize: string;
  loadTime: string;
  status: string;
}

export interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  projectsActive: number;
  completionRate: number;
  rating: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'Projects' | 'System' | 'Security';
  iconType: string;
  user?: {
    name: string;
    avatar: string;
  };
  title: string;
  description: string;
  time: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'todo' | 'in_progress' | 'in_review' | 'completed';
  progressPercent?: number;
  commentsCount?: number;
  checklistDone?: number;
  checklistTotal?: number;
  members: Array<{ name: string; avatar: string }>;
}

export interface DetailedReportItem {
  id: string;
  name: string;
  dateCreated: string;
  author: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  status: 'Completed' | 'Pending';
}

export const initialProjects: ProjectItem[] = [
  { name: 'Nexus Launch', manager: 'Sarah J.', status: 'On Track', revenue: '$45,200' },
  { name: 'Omega Redesign', manager: 'Mike T.', status: 'At Risk', revenue: '$32,850' },
  { name: 'Alpha Integration', manager: 'Elena V.', status: 'On Track', revenue: '$28,100' }
];

export const initialBenchmarks: MfeBenchmarkItem[] = [
  { remoteApp: 'mfe-auth', port: 4201, bundleSize: '133.7 kB', loadTime: '12 ms', status: 'Active' },
  { remoteApp: 'mfe-dashboard', port: 4202, bundleSize: '85.4 kB', loadTime: '18 ms', status: 'Active' },
  { remoteApp: 'mfe-reporting', port: 4203, bundleSize: '85.5 kB', loadTime: '22 ms', status: 'Active' }
];

export const initialTeamPerformance: TeamMember[] = [
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

export const initialActivityLogs: ActivityLogItem[] = [
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

export const initialKanbanTasks: KanbanTask[] = [
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

export const initialDetailedReports: DetailedReportItem[] = [
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
  },
  {
    id: 'REP-006',
    name: 'Security Vulnerability Scan',
    dateCreated: 'Sep 10, 2023',
    author: { name: 'Jane Doe', initials: 'JD', avatarBg: 'bg-[#800A20] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-007',
    name: 'DevOps CI/CD Pipeline Cost',
    dateCreated: 'Sep 02, 2023',
    author: { name: 'Alex Smith', initials: 'AS', avatarBg: 'bg-[#505F76] text-white' },
    status: 'Pending'
  },
  {
    id: 'REP-008',
    name: 'Cloud Storage Optimization',
    dateCreated: 'Aug 28, 2023',
    author: { name: 'Mary Jones', initials: 'MJ', avatarBg: 'bg-[#166534] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-009',
    name: 'Customer Support SLA Health',
    dateCreated: 'Aug 20, 2023',
    author: { name: 'Robert Chen', initials: 'RC', avatarBg: 'bg-[#4F46E5] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-010',
    name: 'Marketing Campaign ROI',
    dateCreated: 'Aug 14, 2023',
    author: { name: 'Elena Vance', initials: 'EV', avatarBg: 'bg-[#D97706] text-white' },
    status: 'Pending'
  },
  {
    id: 'REP-011',
    name: 'API Rate Limiting Benchmark',
    dateCreated: 'Aug 05, 2023',
    author: { name: 'Jane Doe', initials: 'JD', avatarBg: 'bg-[#800A20] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-012',
    name: 'Database Backup Integrity Check',
    dateCreated: 'Jul 30, 2023',
    author: { name: 'Alex Smith', initials: 'AS', avatarBg: 'bg-[#505F76] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-013',
    name: 'Frontend Micro-App Latency',
    dateCreated: 'Jul 22, 2023',
    author: { name: 'Mary Jones', initials: 'MJ', avatarBg: 'bg-[#166534] text-white' },
    status: 'Pending'
  },
  {
    id: 'REP-014',
    name: 'Payment Gateway Settlement',
    dateCreated: 'Jul 15, 2023',
    author: { name: 'Robert Chen', initials: 'RC', avatarBg: 'bg-[#4F46E5] text-white' },
    status: 'Completed'
  },
  {
    id: 'REP-015',
    name: 'Q2 Executive Summary',
    dateCreated: 'Jul 01, 2023',
    author: { name: 'Elena Vance', initials: 'EV', avatarBg: 'bg-[#D97706] text-white' },
    status: 'Completed'
  }
];
