import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Notification interface
export interface Notification {
  id: number;
  title?: string;
  message: string;
  created_at: string;
  read: number; // 0 = unread, 1 = read
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications'; // Adjust if your backend base path differs

  constructor(private http: HttpClient) {}

  // Fetch all notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  // Mark a single notification as read
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }
}
