import { apiClient } from './api';
import { ApiResponse, ISettings } from '../types';

export const settingsService = {
  async get(): Promise<ISettings> {
    const response = await apiClient.get<ApiResponse<ISettings>>('/settings');
    return response.data.data!;
  },

  async update(payload: Partial<ISettings>): Promise<ISettings> {
    const response = await apiClient.patch<ApiResponse<ISettings>>('/settings', payload);
    return response.data.data!;
  },

  async getRestaurantProfile(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/settings/restaurant');
    return response.data.data!;
  },

  async updateRestaurantProfile(data: any): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>('/settings/restaurant', data);
    return response.data.data!;
  },

  async getBusinessHours(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/settings/business-hours');
    return response.data.data!;
  },

  async updateBusinessHours(data: any): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>('/settings/business-hours', data);
    return response.data.data!;
  },

  async getTaxConfig(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/settings/tax');
    return response.data.data!;
  },

  async updateTaxConfig(data: any): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>('/settings/tax', data);
    return response.data.data!;
  },
};

