export interface Notification {
  id: number;
  title?: string;
  message: string;
  created_at: string; // or Date
  read: number; // 0 = unread, 1 = read
}
