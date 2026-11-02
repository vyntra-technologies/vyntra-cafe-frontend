import { apiClient } from './api';
import { ApiResponse } from '../types';

export const uploadService = {
  async uploadSingle(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ url: string }>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data?.url || '';
  },
};

