import { PaymentMethod } from '../types';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  badge?: string;
}

export const paymentService = {
  getAvailablePaymentMethods(orderType: 'dine-in' | 'takeaway'): PaymentOption[] {
    if (orderType === 'dine-in') {
      return [
        {
          id: 'card',
          name: 'Credit / Debit Card (Online)',
          description: 'Secure instant payment via Card / NetBanking',
          badge: 'Instant',
        },
        {
          id: 'upi',
          name: 'UPI / QR Payment',
          description: 'Instant contactless pay via Google Pay, PhonePe, Paytm',
          badge: 'Popular',
        },
        {
          id: 'cash',
          name: 'Pay at Restaurant Table',
          description: 'Settle your bill directly with your server after your meal',
        },
      ];
    } else {
      return [
        {
          id: 'card',
          name: 'Online Payment (Card / UPI)',
          description: 'Pay ahead and skip the counter queue upon pickup',
          badge: 'Fast Pickup',
        },
        {
          id: 'upi',
          name: 'UPI Instant',
          description: 'GPay / PhonePe / QR',
          badge: 'Instant',
        },
        {
          id: 'cash',
          name: 'Pay at Counter on Pickup',
          description: 'Pay by cash or card upon collecting your order',
        },
      ];
    }
  },
};

