import { apiClient } from './api';
import { ApiResponse, IStaff, UserRole } from '../types';

export interface CreateStaffPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  position: string;
  department?: string;
  salaryType: 'hourly' | 'monthly';
  hourlyRate?: number;
  monthlySalary?: number;
  hireDate?: string;
}

export const staffService = {
  async getAll(): Promise<IStaff[]> {
    const response = await apiClient.get<ApiResponse<IStaff[]>>('/staff');
    return response.data.data || [];
  },

  async getPendingApprovals(): Promise<IStaff[]> {
    const response = await apiClient.get<ApiResponse<IStaff[]>>('/staff/pending-approvals');
    return response.data.data || [];
  },

  async getById(id: string): Promise<IStaff> {
    const response = await apiClient.get<ApiResponse<IStaff>>(`/staff/${id}`);
    return response.data.data!;
  },

  async create(payload: CreateStaffPayload): Promise<IStaff> {
    const response = await apiClient.post<ApiResponse<IStaff>>('/staff', payload);
    return response.data.data!;
  },

  async update(id: string, payload: Partial<CreateStaffPayload>): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}`, payload);
    return response.data.data!;
  },

  async approve(id: string): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/approve`);
    return response.data.data!;
  },

  async reject(id: string, rejectionReason: string): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/reject`, {
      rejectionReason,
    });
    return response.data.data!;
  },

  async activate(id: string): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/activate`);
    return response.data.data!;
  },

  async suspend(id: string): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/suspend`);
    return response.data.data!;
  },

  async revoke(id: string): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/revoke`);
    return response.data.data!;
  },

  async updateRole(id: string, role: UserRole): Promise<IStaff> {
    const response = await apiClient.patch<ApiResponse<IStaff>>(`/staff/${id}/role`, {
      role,
    });
    return response.data.data!;
  },
};

