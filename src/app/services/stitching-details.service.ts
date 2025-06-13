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

 // In your data service
// getStitchingDropdownOptions() {
//   return this.http.get<{ id: number; qty: number; material: string }[]>(
//     'http://localhost:8000/stitching-details/dropdown-options'
//   );
// }



  getById(id: number): Observable<StitchingDetails> {
    return this.http.get<StitchingDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: StitchingDetails): Observable<StitchingDetails> {
    return this.http.post<StitchingDetails>(`${this.baseUrl}/`, data);
  }

  update(id: number, data: StitchingDetails): Observable<StitchingDetails> {
    return this.http.put<StitchingDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
