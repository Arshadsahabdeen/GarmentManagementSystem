import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tailor } from '../models/tailor.model';

@Injectable({ providedIn: 'root' })
export class TailorService {
  private baseUrl = 'https://garmentmanagementsystem-backend.onrender.com/tailor-master';

  constructor(private http: HttpClient) {}

  getAllTailors(): Observable<Tailor[]> {
    return this.http.get<Tailor[]>(`${this.baseUrl}/`);
  }

  getDropdownOptions() {
  return this.http.get<{ id: number; name: string }[]>(`${this.baseUrl}/dropdown-options`);
  }

  addTailor(tailor: Tailor): Observable<Tailor> {
    return this.http.post<Tailor>(`${this.baseUrl}/`, tailor);
  }

  updateTailor(id: number, tailor: Tailor): Observable<Tailor> {
    return this.http.put<Tailor>(`${this.baseUrl}/${id}`, tailor);
  }
}
