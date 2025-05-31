// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { MaterialStock } from '../models/material-stock.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class MaterialStockService {
//   private baseUrl = 'http://localhost:8000/material-stock'; // Backend API base URL

//   constructor(private http: HttpClient) {}

//   // Get all stock entries for a specific material by Material_Id
//   getStocksByMaterialId(materialId: number): Observable<MaterialStock[]> {
//     return this.http.get<MaterialStock[]>(`${this.baseUrl}/by-material/${materialId}`);
//   }

//   // Create a new material stock entry
//   createStock(stock: MaterialStock): Observable<MaterialStock> {
//     return this.http.post<MaterialStock>(this.baseUrl, stock);
//   }

//   // Get all materials for dropdown (if backend endpoint exists here)
//   getMaterialDropdown(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/material/dropdown-options`);
//   }

//   // Optional: Add update and delete methods here later if needed
// }
