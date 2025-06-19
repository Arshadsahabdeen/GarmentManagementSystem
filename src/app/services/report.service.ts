import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MaterialPriceSummary {
  total_price_bought: number;
  total_price_sold: number;
  profit: number;
}

export interface StitchedByMaterial {
  materialDesc: string;
  quantityStitched: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl = 'https://garmentmanagementsystem-backend.onrender.com/report';
  constructor(private http: HttpClient) {}
  getPriceAndProfitSummary(fromDate?: string, toDate?: string): Observable<MaterialPriceSummary> {
    let params = new HttpParams();
    if (fromDate) params = params.set('from_date', fromDate);
    if (toDate) params = params.set('to_date', toDate);
    return this.http.get<MaterialPriceSummary>(`${this.baseUrl}/price-profit-summary`, { params });
  }
  getQuantityStitchedByMaterial(): Observable<StitchedByMaterial[]> {
    return this.http.get<StitchedByMaterial[]>(`${this.baseUrl}/stitched-by-material`);
  }
  getPriceProfitOverTime(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/price-profit-over-time`);
  }
}
