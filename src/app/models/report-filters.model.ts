export interface ReportFilters {
  fromDate: string;
  toDate: string;
  sortOrder: 'asc' | 'desc';
  status?: 'true' | 'false' | '';
}
