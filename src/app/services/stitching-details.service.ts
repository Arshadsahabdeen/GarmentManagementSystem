import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StitchingDetails } from '../models/stitching-details.model';

@Injectable({
  providedIn: 'root'
})
export class StitchingDetailsService {
  private baseUrl = 'https://garmentmanagementsystem-backend.onrender.com/stitching-details';

  constructor(private http: HttpClient) {}

  getAll(): Observable<StitchingDetails[]> {
    return this.http.get<StitchingDetails[]>(`${this.baseUrl}/`);
  }
  getById(id: number): Observable<StitchingDetails> {
    return this.http.get<StitchingDetails>(`${this.baseUrl}/${id}`);
  }
  create(data: StitchingDetails): Observable<StitchingDetails> {
    return this.http.post<StitchingDetails>(`${this.baseUrl}/`, data);
  }
  update(id: number, data: StitchingDetails): Observable<StitchingDetails> {
    return this.http.put<StitchingDetails>(`${this.baseUrl}/${id}`, data);
  }
}
