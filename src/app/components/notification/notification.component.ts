import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;

  constructor(private notificationService: NotificationService, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
      this.updateUnreadCount();
    });
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => n.read === 0).length;
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: 1 } : notification
      );
      this.updateUnreadCount();
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}
