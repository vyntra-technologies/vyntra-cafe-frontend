import { apiClient } from './api';
import { ApiResponse, ICustomer, IOrder, IReview, PaginationMeta } from '../types';

export const customerService = {
  async getAll(params: { search?: string; page?: number; limit?: number } = {}): Promise<{ customers: ICustomer[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString ? `/customers?${queryString}` : '/customers';
    const response = await apiClient.get<ApiResponse<ICustomer[]>>(url);
    return {
      customers: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<ICustomer> {
    const response = await apiClient.get<ApiResponse<ICustomer>>(`/customers/${id}`);
    return response.data.data!;
  },

  async getOrderHistory(
    customerId: string,
    page = 1,
    limit = 20
  ): Promise<{ orders: IOrder[]; pagination: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>(
      `/customers/${customerId}/orders?page=${page}&limit=${limit}`
    );
    return {
      orders: response.data.data || [],
      pagination: response.data.pagination || { page, limit, total: 0, totalPages: 1 },
    };
  },

  async getLoyaltyHistory(customerId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/customers/${customerId}/loyalty`);
    return response.data.data || [];
  },

  async adjustLoyaltyPoints(customerId: string, points: number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/customers/${customerId}/loyalty/adjust`, {
      points,
      reason,
    });
    return response.data.data;
  },

  async update(customerId: string, data: Partial<ICustomer>): Promise<ICustomer> {
    const response = await apiClient.patch<ApiResponse<ICustomer>>(`/customers/${customerId}`, data);
    return response.data.data!;
  },

  async submitFeedback(
    customerId: string,
    payload: {
      customerName: string;
      rating: number;
      comment?: string;
      menuItemId?: string;
      orderId?: string;
    }
  ): Promise<IReview> {
    const response = await apiClient.post<ApiResponse<IReview>>(
      `/customers/${customerId}/feedback`,
      payload
    );
    return response.data.data!;
  },
};

