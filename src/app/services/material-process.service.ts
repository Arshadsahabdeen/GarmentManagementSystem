import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MaterialProcess {
  Material_Process_Id?: number;
  Material_Id: number;
  Material_Desc: string;
  Color: string;
  Quantity_Processed: number;
  Processed_Date: string;  // ISO date string (YYYY-MM-DD)
  Entry_Date?: string;     // optional timestamps
  Modified_Date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialProcessService {
  private baseUrl = 'http://localhost:8000/material-process'; // Adjust your backend URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<MaterialProcess[]> {
    return this.http.get<MaterialProcess[]>(this.baseUrl );
  }

  getById(id: number): Observable<MaterialProcess> {
    return this.http.get<MaterialProcess>(`${this.baseUrl}/${id}`);
  }

  getMaterialProcessDropdownOptions() {
  return this.http.get<{ id: number; description: string }[]>(
    'https://garment-backend.onrender.com/material-process/dropdown-options'
  );
  }

  create(mp: MaterialProcess): Observable<MaterialProcess> {
    return this.http.post<MaterialProcess>(this.baseUrl + '/', mp);
  }

  update(id: number, mp: Partial<MaterialProcess>): Observable<MaterialProcess> {
    return this.http.put<MaterialProcess>(`${this.baseUrl}/${id}`, mp);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
