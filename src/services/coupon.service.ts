import { apiClient } from './api';
import { ApiResponse, ICoupon } from '../types';

export interface CouponValidationResult {
  coupon: ICoupon;
  discount: number;
  valid: boolean;
}

export const couponService = {
  async validate(code: string, orderAmount: number): Promise<CouponValidationResult> {
    const response = await apiClient.post<ApiResponse<CouponValidationResult>>('/coupons/validate', {
      code: code.trim().toUpperCase(),
      orderAmount,
    });
    return response.data.data!;
  },
};

