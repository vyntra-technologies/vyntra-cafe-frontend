import { apiClient } from './api';
import { ApiResponse, IOrder, PaginationMeta, PaymentMethod } from '../types';

export interface CreatePosOrderPayload {
  orderType: 'dine-in' | 'takeaway';
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    variantName?: string;
    addOns?: string[];
    notes?: string;
  }>;
  discountCode?: string;
  notes?: string;
}

export interface PosOrderFilterParams {
  status?: string;
  paymentStatus?: string;
  orderType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ShiftSummary {
  date: string;
  totalTransactions: number;
  successfulPayments: number;
  totalCollected: number;
  totalRefunded: number;
  netRevenue: number;
  methodBreakdown: {
    cash: number;
    card: number;
    upi: number;
    online: number;
    wallet: number;
  };
}

export interface BillingDetails {
  order: IOrder;
  bill?: any;
  payments: any[];
  summary: {
    subtotal: number;
    discount: number;
    taxAmount: number;
    grandTotal: number;
    totalPaid: number;
    balanceDue: number;
    paymentStatus: string;
  };
}

export interface CollectPaymentPayload {
  amount: number;
  method: PaymentMethod;
  notes?: string;
  transactionReference?: string;
}

export interface ApplyDiscountPayload {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  reason: string;
}

export const posService = {
  // POS Order endpoints
  async createOrder(payload: CreatePosOrderPayload): Promise<IOrder> {
    const response = await apiClient.post<ApiResponse<IOrder>>('/pos/orders', payload);
    return response.data.data!;
  },

  async getOrders(params: PosOrderFilterParams = {}): Promise<{ orders: IOrder[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
    if (params.orderType) searchParams.append('orderType', params.orderType);
    if (params.search) searchParams.append('search', params.search);
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    const url = qs ? `/pos/orders?${qs}` : '/pos/orders';
    const response = await apiClient.get<ApiResponse<IOrder[]>>(url);

    return {
      orders: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  // Billing endpoints
  async getBilling(orderId: string): Promise<BillingDetails> {
    const response = await apiClient.get<ApiResponse<BillingDetails>>(`/billing/${orderId}`);
    return response.data.data!;
  },

  async generateBill(orderId: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/billing/${orderId}`);
    return response.data.data;
  },

  async applyDiscount(orderId: string, payload: ApplyDiscountPayload): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/billing/${orderId}/discount`, payload);
    return response.data.data;
  },

  async collectPayment(orderId: string, payload: CollectPaymentPayload): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/billing/${orderId}/payments`, payload);
    return response.data.data;
  },

  async getPayments(orderId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/billing/${orderId}/payments`);
    return response.data.data || [];
  },

  async getReceipt(receiptOrOrderId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/billing/receipts/${receiptOrOrderId}`);
    return response.data.data;
  },

  async refundPayment(orderId: string, amount: number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/billing/${orderId}/refund`, {
      amount,
      reason,
    });
    return response.data.data;
  },

  async getShiftSummary(cashierId?: string, date?: string): Promise<ShiftSummary> {
    const searchParams = new URLSearchParams();
    if (cashierId) searchParams.append('cashierId', cashierId);
    if (date) searchParams.append('date', date);

    const qs = searchParams.toString();
    const url = qs ? `/billing/shift-summary?${qs}` : '/billing/shift-summary';
    const response = await apiClient.get<ApiResponse<ShiftSummary>>(url);
    return response.data.data!;
  },
};

