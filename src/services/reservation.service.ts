import { apiClient } from './api';
import { ApiResponse, IReservation, PaginationMeta } from '../types';

export interface CreateReservationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  durationMinutes?: number;
  tableId?: string;
  specialRequests?: string;
}

export interface ReservationFilterParams {
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const reservationService = {
  async create(payload: CreateReservationPayload): Promise<IReservation> {
    const response = await apiClient.post<ApiResponse<IReservation>>('/reservations', payload);
    const reservation = response.data.data!;

    // Save reservation ID to local storage cache
    this.saveReservationToLocalHistory(reservation._id);
    return reservation;
  },

  async getById(id: string): Promise<IReservation> {
    const response = await apiClient.get<ApiResponse<IReservation>>(`/reservations/${id}`);
    return response.data.data!;
  },

  async getAll(params: ReservationFilterParams = {}): Promise<{ reservations: IReservation[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params.date) searchParams.append('date', params.date);
    if (params.status) searchParams.append('status', params.status);
    if (params.page !== undefined) searchParams.append('page', String(params.page));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';
    const response = await apiClient.get<ApiResponse<IReservation[]>>(url);
    return {
      reservations: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async confirm(id: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/confirm`);
    return response.data.data!;
  },

  async approve(id: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/approve`);
    return response.data.data!;
  },

  async reject(id: string, rejectionReason: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/reject`, {
      rejectionReason,
    });
    return response.data.data!;
  },

  async markArrived(id: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/arrived`);
    return response.data.data!;
  },

  async updateStatus(id: string, status: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/status`, {
      status,
    });
    return response.data.data!;
  },

  async update(id: string, data: Partial<IReservation>): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}`, data);
    return response.data.data!;
  },

  async cancel(id: string, cancellationReason: string): Promise<IReservation> {
    const response = await apiClient.patch<ApiResponse<IReservation>>(`/reservations/${id}/cancel`, {
      cancellationReason,
    });
    return response.data.data!;
  },

  saveReservationToLocalHistory(reservationId: string) {
    try {
      const existing = this.getLocalReservationHistory();
      if (!existing.includes(reservationId)) {
        existing.unshift(reservationId);
        localStorage.setItem('vyntra_customer_reservations', JSON.stringify(existing.slice(0, 50)));
      }
    } catch {
      // LocalStorage fallback
    }
  },

  getLocalReservationHistory(): string[] {
    try {
      const raw = localStorage.getItem('vyntra_customer_reservations');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

