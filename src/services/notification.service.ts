import { apiClient } from './api';
import { ApiResponse, INotification } from '../types';

export const notificationService = {
  async getAll(): Promise<INotification[]> {
    const response = await apiClient.get<ApiResponse<INotification[]>>('/notifications');
    return response.data.data || [];
  },

  async getUnread(): Promise<INotification[]> {
    const response = await apiClient.get<ApiResponse<INotification[]>>('/notifications/unread');
    return response.data.data || [];
  },

  async markAsRead(id: string): Promise<INotification> {
    const response = await apiClient.patch<ApiResponse<INotification>>(`/notifications/${id}/read`);
    return response.data.data!;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  show: (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  },
};

