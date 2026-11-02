import { apiClient } from './api';
import { ApiResponse, IReview } from '../types';

export interface CreateReviewPayload {
  customerName: string;
  rating: number;
  comment?: string;
  menuItemId?: string;
  orderId?: string;
}

export const reviewService = {
  async getAll(): Promise<IReview[]> {
    const response = await apiClient.get<ApiResponse<IReview[]>>('/reviews');
    return response.data.data || [];
  },

  async create(payload: CreateReviewPayload): Promise<IReview> {
    const response = await apiClient.post<ApiResponse<IReview>>('/reviews', payload);
    return response.data.data!;
  },
};

