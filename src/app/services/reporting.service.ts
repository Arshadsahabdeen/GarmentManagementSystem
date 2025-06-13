import { Injectable } from '@angular/core';
import { ReportFilters } from '../models/report-filters.model'; // ✅ Correct import

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private filtersMap = new Map<string, ReportFilters>();

  setFilters(section: string, filters: ReportFilters): void {
    this.filtersMap.set(section, filters);
  }

  getFilters(section: string): ReportFilters | undefined {
    return this.filtersMap.get(section);
  }

  clearFilters(section: string): void {
    this.filtersMap.delete(section);
  }
}
