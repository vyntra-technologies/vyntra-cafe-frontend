import { apiClient } from './api';
import {
  ApiResponse,
  IDashboardMetrics,
  ISalesSummary,
  IDailySales,
  IBestsellerItem,
  IOrderAnalytics,
  IPaymentSummary,
} from '../types';

export const reportService = {
  async getDashboard(): Promise<IDashboardMetrics> {
    const response = await apiClient.get<ApiResponse<IDashboardMetrics>>('/reports/dashboard');
    return response.data.data!;
  },

  async getSalesSummary(startDate?: string, endDate?: string): Promise<ISalesSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const url = qs ? `/reports/sales-summary?${qs}` : '/reports/sales-summary';
    const response = await apiClient.get<ApiResponse<ISalesSummary>>(url);
    return response.data.data!;
  },

  async getDailySales(days = 30): Promise<IDailySales[]> {
    const response = await apiClient.get<ApiResponse<IDailySales[]>>(`/reports/daily-sales?days=${days}`);
    return response.data.data || [];
  },

  async getMonthlySales(year?: number): Promise<any[]> {
    const url = year ? `/reports/monthly-sales?year=${year}` : '/reports/monthly-sales';
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    return response.data.data || [];
  },

  async getBestsellers(limit = 10, startDate?: string, endDate?: string): Promise<IBestsellerItem[]> {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get<ApiResponse<IBestsellerItem[]>>(`/reports/bestsellers?${params.toString()}`);
    return response.data.data || [];
  },

  async getOrderAnalytics(startDate?: string, endDate?: string): Promise<IOrderAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const url = qs ? `/reports/orders?${qs}` : '/reports/orders';
    const response = await apiClient.get<ApiResponse<IOrderAnalytics>>(url);
    return response.data.data || { byType: [] };
  },

  async getPaymentSummary(startDate?: string, endDate?: string): Promise<IPaymentSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const url = qs ? `/reports/payments?${qs}` : '/reports/payments';
    const response = await apiClient.get<ApiResponse<IPaymentSummary>>(url);
    return response.data.data || { byMethod: [] };
  },

  async getInventoryReport(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/reports/inventory');
    return response.data.data;
  },

  async getExpenseSummary(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const url = qs ? `/reports/expenses?${qs}` : '/reports/expenses';
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data.data;
  },

  async getStaffPerformance(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const url = qs ? `/reports/staff-performance?${qs}` : '/reports/staff-performance';
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    return response.data.data || [];
  },
};

