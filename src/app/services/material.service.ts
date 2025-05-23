import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  Material_Id?: number;
  Material_Desc: string;
  Quantity?: number;
  Color?: string;
  Price?: number;
  Pattern?: string;
  Purchase_Date?: string; // Use ISO string for dates
  Comments?: string;
  Entry_Date?: string;
  Modified_Date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private baseUrl = 'http://localhost:8000/api/v1/material_master'; // Change to your backend URL

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.baseUrl);
  }

  getMaterial(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.baseUrl}/${id}`);
  }

  createMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(this.baseUrl, material);
  }

  updateMaterial(id: number, material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.baseUrl}/${id}`, material);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
