import { apiClient } from './api';
import { ApiResponse, IOrder, OrderType, PaymentMethod, FulfillmentStatus, PaginationMeta } from '../types';

export interface CreateOrderPayload {
  orderType: OrderType;
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    variantName?: string;
    addOns?: string[];
    notes?: string;
  }>;
  discountCode?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  orderType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CancellationRequest {
  orderId: string;
  reason: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

export const orderService = {
  async create(payload: CreateOrderPayload, idempotencyKey?: string): Promise<IOrder> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    const response = await apiClient.post<ApiResponse<IOrder>>('/orders', payload, { headers });
    const order = response.data.data!;

    // Save order ID to local storage history
    this.saveOrderToLocalHistory(order._id);
    return order;
  },

  async getById(id: string): Promise<IOrder> {
    const response = await apiClient.get<ApiResponse<IOrder>>(`/orders/${id}`);
    return response.data.data!;
  },

  async getReceipt(id: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}/receipt`);
    return response.data.data!;
  },

  // Staff / Management Directory & Filters
  async getAll(params: OrderFilterParams = {}): Promise<{ orders: IOrder[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
    if (params.status) searchParams.append('status', params.status);
    if (params.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
    if (params.orderType) searchParams.append('orderType', params.orderType);
    if (params.search) searchParams.append('search', params.search);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    const response = await apiClient.get<ApiResponse<IOrder[]>>(url);
    return {
      orders: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async updateStatus(id: string, status: FulfillmentStatus, note?: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/orders/${id}/status`, {
      status,
      note,
    });
    return response.data.data!;
  },

  async listCancellationRequests(): Promise<IOrder[]> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>('/orders/cancellations/pending');
    return response.data.data || [];
  },

  async approveCancellation(id: string, reviewNote?: string): Promise<IOrder> {
    const response = await apiClient.post<ApiResponse<IOrder>>(`/orders/${id}/cancellation/approve`, {
      reviewNote,
    });
    return response.data.data!;
  },

  async rejectCancellation(id: string, reviewNote?: string): Promise<IOrder> {
    const response = await apiClient.post<ApiResponse<IOrder>>(`/orders/${id}/cancellation/reject`, {
      reviewNote,
    });
    return response.data.data!;
  },

  async assignWaiter(id: string, waiterId: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/orders/${id}/assign-waiter`, {
      waiterId,
    });
    return response.data.data!;
  },

  async cancelOrder(id: string, reason: string): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(`/orders/${id}/cancel`, {
      reason,
    });
    return response.data.data!;
  },

  // Save order to customer local tracking cache
  saveOrderToLocalHistory(orderId: string) {
    try {
      const existing = this.getLocalOrderHistory();
      if (!existing.includes(orderId)) {
        existing.unshift(orderId);
        localStorage.setItem('vyntra_customer_orders', JSON.stringify(existing.slice(0, 50)));
      }
    } catch {
      // LocalStorage fallback
    }
  },

  getLocalOrderHistory(): string[] {
    try {
      const raw = localStorage.getItem('vyntra_customer_orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Customer Cancellation Request Management
  async requestCancellation(orderId: string, reason: string): Promise<CancellationRequest> {
    try {
      await apiClient.post(`/orders/${orderId}/cancellation/request`, { reason });
    } catch {
      try {
        await apiClient.post(`/orders/${orderId}/cancel-request`, { reason });
      } catch {
        // Graceful fallback for environments where socket or manager polling is used
      }
    }
    return this.submitCancellationRequest(orderId, reason);
  },

  submitCancellationRequest(orderId: string, reason: string): CancellationRequest {
    const requests = this.getCancellationRequests();
    const newRequest: CancellationRequest = {
      orderId,
      reason,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
    };
    requests[orderId] = newRequest;
    localStorage.setItem('vyntra_cancellation_requests', JSON.stringify(requests));
    return newRequest;
  },

  getCancellationRequests(): Record<string, CancellationRequest> {
    try {
      const raw = localStorage.getItem('vyntra_cancellation_requests');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  getCancellationRequest(orderId: string): CancellationRequest | null {
    const all = this.getCancellationRequests();
    return all[orderId] || null;
  },
};

