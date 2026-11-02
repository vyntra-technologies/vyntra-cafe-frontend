import { apiClient } from './api';
import { ApiResponse, ICategory } from '../types';

export const categoryService = {
  async getAll(): Promise<ICategory[]> {
    const response = await apiClient.get<ApiResponse<ICategory[]>>('/categories');
    return response.data.data || [];
  },

  async getById(id: string): Promise<ICategory> {
    const response = await apiClient.get<ApiResponse<ICategory>>(`/categories/${id}`);
    return response.data.data!;
  },

  async create(data: { name: string; description?: string; image?: string; displayOrder?: number; isActive?: boolean }): Promise<ICategory> {
    const response = await apiClient.post<ApiResponse<ICategory>>('/categories', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const response = await apiClient.patch<ApiResponse<ICategory>>(`/categories/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};

