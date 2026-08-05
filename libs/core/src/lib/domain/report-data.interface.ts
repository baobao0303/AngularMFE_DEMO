export interface ReportData {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status: 'published' | 'draft' | 'archived';
}
