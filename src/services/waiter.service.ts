import { apiClient } from './api';
import { ApiResponse, IOrder, ITable } from '../types';

export interface CreateWaiterOrderPayload {
  tableId: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    variantName?: string;
    addOns?: string[];
    notes?: string;
  }>;
  notes?: string;
}

export const waiterService = {
  async getTables(): Promise<ITable[]> {
    const response = await apiClient.get<ApiResponse<ITable[]>>('/waiter/tables');
    return response.data.data || [];
  },

  async getOrders(): Promise<IOrder[]> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>('/waiter/orders');
    return response.data.data || [];
  },

  async getReadyOrders(): Promise<IOrder[]> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>('/waiter/orders/ready');
    return response.data.data || [];
  },

  async getOrderById(id: string): Promise<IOrder> {
    const response = await apiClient.get<ApiResponse<IOrder>>(`/waiter/orders/${id}`);
    return response.data.data!;
  },

  async createOrder(payload: CreateWaiterOrderPayload): Promise<IOrder> {
    const response = await apiClient.post<ApiResponse<IOrder>>('/waiter/orders', payload);
    return response.data.data!;
  },

  async addItems(orderId: string, items: CreateWaiterOrderPayload['items']): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/waiter/orders/${orderId}/items`, {
      items,
    });
    return response.data.data!;
  },

  async sendToKitchen(orderId: string): Promise<IOrder> {
    const response = await apiClient.post<ApiResponse<IOrder>>(`/waiter/orders/${orderId}/send-to-kitchen`);
    return response.data.data!;
  },

  async markServed(orderId: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/waiter/orders/${orderId}/served`);
    return response.data.data!;
  },

  async requestBill(orderId: string, paymentMethod?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/waiter/orders/${orderId}/request-bill`, {
      paymentMethod,
    });
    return response.data.data;
  },
};

