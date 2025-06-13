import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  private apiUrl = 'https://garmentmanagementsystem-backend.onrender.com/dispatch';

  constructor(private http: HttpClient) {}

  getAllDispatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }

  createDispatch(dispatch: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, dispatch);
  }

  updateDispatch(id: number, dispatch: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dispatch);
  }

  deleteDispatch(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
