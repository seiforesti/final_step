// Notification.ts
export interface Notification {
  id: number;
  user_email: string;
  type: string;
  message: string;
  related_object_type?: string;
  related_object_id?: string;
  created_at: string;
  read: boolean;
  read_at?: string;
}
