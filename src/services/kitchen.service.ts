import { apiClient } from './api';
import { ApiResponse, IOrder } from '../types';

export interface KitchenDashboardStats {
  pendingCount?: number;
  preparingCount?: number;
  readyCount?: number;
  completedTodayCount?: number;
  avgPrepTimeMinutes?: number;
}

export const kitchenService = {
  async getOrders(): Promise<IOrder[]> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>('/kitchen/orders');
    return response.data.data || [];
  },

  async getDashboard(): Promise<KitchenDashboardStats> {
    const response = await apiClient.get<ApiResponse<KitchenDashboardStats>>('/kitchen/dashboard');
    return response.data.data || {};
  },

  async getHistory(): Promise<IOrder[]> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>('/kitchen/history');
    return response.data.data || [];
  },

  async getOrderById(id: string): Promise<IOrder> {
    const response = await apiClient.get<ApiResponse<IOrder>>(`/kitchen/orders/${id}`);
    return response.data.data!;
  },

  async acceptOrder(id: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/kitchen/orders/${id}/accept`);
    return response.data.data!;
  },

  async startPreparing(id: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/kitchen/orders/${id}/preparing`);
    return response.data.data!;
  },

  async markReady(id: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/kitchen/orders/${id}/ready`);
    return response.data.data!;
  },

  async updateItemStatus(orderId: string, itemId: string, status: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(
      `/kitchen/orders/${orderId}/items/${itemId}/status`,
      { status }
    );
    return response.data.data!;
  },
};

