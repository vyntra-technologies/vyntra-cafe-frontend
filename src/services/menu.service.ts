import { apiClient } from './api';
import { ApiResponse, IMenuItem, PaginationMeta } from '../types';

export interface MenuFilterParams {
  category?: string;
  search?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const menuService = {
  async getAll(params: MenuFilterParams = {}): Promise<{ items: IMenuItem[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();

    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.isVegetarian !== undefined) searchParams.append('isVegetarian', String(params.isVegetarian));
    if (params.isVegan !== undefined) searchParams.append('isVegan', String(params.isVegan));
    if (params.isGlutenFree !== undefined) searchParams.append('isGlutenFree', String(params.isGlutenFree));
    if (params.isAvailable !== undefined) searchParams.append('isAvailable', String(params.isAvailable));
    if (params.isFeatured !== undefined) searchParams.append('isFeatured', String(params.isFeatured));
    if (params.isBestseller !== undefined) searchParams.append('isBestseller', String(params.isBestseller));
    if (params.minPrice !== undefined) searchParams.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', String(params.maxPrice));
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.order) searchParams.append('order', params.order);

    const queryString = searchParams.toString();
    const url = queryString ? `/menu?${queryString}` : '/menu';
    const response = await apiClient.get<ApiResponse<IMenuItem[]>>(url);

    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<IMenuItem> {
    const response = await apiClient.get<ApiResponse<IMenuItem>>(`/menu/${id}`);
    return response.data.data!;
  },

  async getFeatured(): Promise<IMenuItem[]> {
    const result = await this.getAll({ isFeatured: true, limit: 8 });
    return result.items;
  },

  async getBestsellers(): Promise<IMenuItem[]> {
    const result = await this.getAll({ isBestseller: true, limit: 8 });
    return result.items;
  },

  async create(payload: Partial<IMenuItem>): Promise<IMenuItem> {
    const response = await apiClient.post<ApiResponse<IMenuItem>>('/menu', payload);
    return response.data.data!;
  },

  async update(id: string, payload: Partial<IMenuItem>): Promise<IMenuItem> {
    const response = await apiClient.patch<ApiResponse<IMenuItem>>(`/menu/${id}`, payload);
    return response.data.data!;
  },

  async setAvailability(id: string, isAvailable: boolean): Promise<IMenuItem> {
    const response = await apiClient.patch<ApiResponse<IMenuItem>>(`/menu/${id}/availability`, {
      isAvailable,
    });
    return response.data.data!;
  },

  async uploadImages(id: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await apiClient.post<ApiResponse<{ images: string[] }>>(`/menu/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data?.images || [];
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/menu/${id}`);
  },
};

