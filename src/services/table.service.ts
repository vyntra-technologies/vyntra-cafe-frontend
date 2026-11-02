import { apiClient } from './api';
import { ApiResponse, ITable, TableStatus } from '../types';

export const tableService = {
  async getAll(status?: TableStatus, section?: string): Promise<ITable[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (section) params.append('section', section);

    const qs = params.toString();
    const url = qs ? `/tables?${qs}` : '/tables';
    const response = await apiClient.get<ApiResponse<ITable[]>>(url);
    return response.data.data || [];
  },

  async getAvailableTables(): Promise<ITable[]> {
    return this.getAll('available');
  },

  async getById(id: string): Promise<ITable> {
    const response = await apiClient.get<ApiResponse<ITable>>(`/tables/${id}`);
    return response.data.data!;
  },

  async create(data: { tableNumber: string; capacity: number; section: string; status?: TableStatus; isActive?: boolean }): Promise<ITable> {
    const response = await apiClient.post<ApiResponse<ITable>>('/tables', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<ITable>): Promise<ITable> {
    const response = await apiClient.patch<ApiResponse<ITable>>(`/tables/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: string, status: TableStatus): Promise<ITable> {
    const response = await apiClient.patch<ApiResponse<ITable>>(`/tables/${id}/status`, { status });
    return response.data.data!;
  },

  async releaseTable(id: string): Promise<ITable> {
    const response = await apiClient.post<ApiResponse<ITable>>(`/tables/${id}/release`);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tables/${id}`);
  },
};

