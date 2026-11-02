import { apiClient } from './api';
import {
  ApiResponse,
  IIngredient,
  IStockMovement,
  ISupplier,
  IPurchase,
  IInventoryReport,
  IRecipe,
  StockMovementType,
  PurchaseStatus,
  PaginationMeta,
} from '../types';

export interface CreateIngredientPayload {
  name: string;
  unit: string;
  currentStock?: number;
  reorderLevel?: number;
  costPerUnit?: number;
  isActive?: boolean;
}

export interface StockAdjustmentPayload {
  quantityChange: number;
  type: StockMovementType;
  reason: string;
}

export interface CreateSupplierPayload {
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  ingredientsSupplied?: string[];
  paymentTerms?: string;
  isActive?: boolean;
}

export interface PurchaseQueryParams {
  status?: PurchaseStatus;
  supplierId?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchasePayload {
  supplierId: string;
  items: Array<{
    ingredientId: string;
    quantity: number;
    unitCost: number;
  }>;
  expectedDeliveryDate?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface ReceiveGoodsPayload {
  items: Array<{
    ingredientId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export const inventoryService = {
  // ==========================================
  // INGREDIENTS
  // ==========================================
  async getAllIngredients(includeInactive = false): Promise<IIngredient[]> {
    const res = await apiClient.get<ApiResponse<IIngredient[]>>(
      `/inventory/ingredients${includeInactive ? '?includeInactive=true' : ''}`
    );
    return res.data.data || [];
  },

  async getIngredientById(id: string): Promise<IIngredient> {
    const res = await apiClient.get<ApiResponse<IIngredient>>(`/inventory/ingredients/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Ingredient not found');
    }
    return res.data.data;
  },

  async createIngredient(payload: CreateIngredientPayload): Promise<IIngredient> {
    const res = await apiClient.post<ApiResponse<IIngredient>>('/inventory/ingredients', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to create ingredient');
    }
    return res.data.data;
  },

  async updateIngredient(id: string, payload: Partial<CreateIngredientPayload>): Promise<IIngredient> {
    const res = await apiClient.patch<ApiResponse<IIngredient>>(`/inventory/ingredients/${id}`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update ingredient');
    }
    return res.data.data;
  },

  async deleteIngredient(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/inventory/ingredients/${id}`);
  },

  async adjustStock(
    id: string,
    payload: StockAdjustmentPayload
  ): Promise<{ ingredient: IIngredient; movement: IStockMovement }> {
    const res = await apiClient.post<ApiResponse<{ ingredient: IIngredient; movement: IStockMovement }>>(
      `/inventory/ingredients/${id}/adjust`,
      payload
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to adjust stock');
    }
    return res.data.data;
  },

  async getLowStockAlerts(): Promise<IIngredient[]> {
    const res = await apiClient.get<ApiResponse<IIngredient[]>>('/inventory/low-stock');
    return res.data.data || [];
  },

  async getStockMovements(params?: { ingredientId?: string; limit?: number }): Promise<IStockMovement[]> {
    const searchParams = new URLSearchParams();
    if (params?.ingredientId) searchParams.append('ingredientId', params.ingredientId);
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    const url = qs ? `/inventory/movements?${qs}` : '/inventory/movements';
    const res = await apiClient.get<ApiResponse<IStockMovement[]>>(url);
    return res.data.data || [];
  },

  // ==========================================
  // SUPPLIERS
  // ==========================================
  async getAllSuppliers(includeInactive = false): Promise<ISupplier[]> {
    const res = await apiClient.get<ApiResponse<ISupplier[]>>(
      `/suppliers${includeInactive ? '?includeInactive=true' : ''}`
    );
    return res.data.data || [];
  },

  async searchSuppliers(query: string): Promise<ISupplier[]> {
    const res = await apiClient.get<ApiResponse<ISupplier[]>>(
      `/suppliers/search?q=${encodeURIComponent(query)}`
    );
    return res.data.data || [];
  },

  async getSupplierById(id: string): Promise<ISupplier> {
    const res = await apiClient.get<ApiResponse<ISupplier>>(`/suppliers/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Supplier not found');
    }
    return res.data.data;
  },

  async createSupplier(payload: CreateSupplierPayload): Promise<ISupplier> {
    const res = await apiClient.post<ApiResponse<ISupplier>>('/suppliers', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to create supplier');
    }
    return res.data.data;
  },

  async updateSupplier(id: string, payload: Partial<CreateSupplierPayload>): Promise<ISupplier> {
    const res = await apiClient.patch<ApiResponse<ISupplier>>(`/suppliers/${id}`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update supplier');
    }
    return res.data.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/suppliers/${id}`);
  },

  async getSupplierPurchases(supplierId: string): Promise<IPurchase[]> {
    const res = await apiClient.get<ApiResponse<IPurchase[]>>(`/suppliers/${supplierId}/purchases`);
    return res.data.data || [];
  },

  async getSupplierPayments(supplierId: string): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<any[]>>(`/suppliers/${supplierId}/payments`);
    return res.data.data || [];
  },

  async getSupplierOutstanding(supplierId: string): Promise<{ totalPurchases: number; totalPaid: number; outstandingBalance: number }> {
    const res = await apiClient.get<ApiResponse<{ totalPurchases: number; totalPaid: number; outstandingBalance: number }>>(
      `/suppliers/${supplierId}/outstanding`
    );
    return res.data.data || { totalPurchases: 0, totalPaid: 0, outstandingBalance: 0 };
  },

  // ==========================================
  // PURCHASES (ORDERS / INVENTORY RESTOCK)
  // ==========================================
  async getAllPurchases(
    params: PurchaseQueryParams = {}
  ): Promise<{ purchases: IPurchase[]; pagination?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.supplierId) searchParams.append('supplierId', params.supplierId);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    const url = qs ? `/purchases?${qs}` : '/purchases';
    const res = await apiClient.get<ApiResponse<IPurchase[]>>(url);

    return {
      purchases: res.data.data || [],
      pagination: res.data.pagination,
    };
  },

  async getPurchaseById(id: string): Promise<IPurchase> {
    const res = await apiClient.get<ApiResponse<IPurchase>>(`/purchases/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Purchase order not found');
    }
    return res.data.data;
  },

  async createPurchase(payload: CreatePurchasePayload): Promise<IPurchase> {
    const res = await apiClient.post<ApiResponse<IPurchase>>('/purchases', payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to create purchase order');
    }
    return res.data.data;
  },

  async updatePurchase(id: string, payload: Partial<CreatePurchasePayload>): Promise<IPurchase> {
    const res = await apiClient.patch<ApiResponse<IPurchase>>(`/purchases/${id}`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update purchase order');
    }
    return res.data.data;
  },

  async cancelPurchase(id: string, reason: string): Promise<IPurchase> {
    const res = await apiClient.patch<ApiResponse<IPurchase>>(`/purchases/${id}/cancel`, { reason });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to cancel purchase order');
    }
    return res.data.data;
  },

  async receiveGoods(id: string, payload: ReceiveGoodsPayload): Promise<IPurchase> {
    const res = await apiClient.post<ApiResponse<IPurchase>>(`/purchases/${id}/receive`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to receive goods');
    }
    return res.data.data;
  },

  async recordSupplierPayment(id: string, payload: RecordPaymentPayload): Promise<IPurchase> {
    const res = await apiClient.post<ApiResponse<IPurchase>>(`/purchases/${id}/payments`, payload);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to record supplier payment');
    }
    return res.data.data;
  },

  // ==========================================
  // REPORTS & RECIPES
  // ==========================================
  async getInventoryReport(): Promise<IInventoryReport> {
    const res = await apiClient.get<ApiResponse<IInventoryReport>>('/reports/inventory');
    return res.data.data || {
      totalIngredientsTracked: 0,
      lowStockIngredientsCount: 0,
      totalInventoryValuation: 0,
      ingredients: [],
    };
  },

  async getAllRecipes(): Promise<IRecipe[]> {
    const res = await apiClient.get<ApiResponse<IRecipe[]>>('/inventory/recipes');
    return res.data.data || [];
  },

  async getRecipeByMenuItem(menuItemId: string, variantName = ''): Promise<IRecipe | null> {
    const qs = variantName ? `?variantName=${encodeURIComponent(variantName)}` : '';
    const res = await apiClient.get<ApiResponse<IRecipe>>(`/inventory/recipes/menu-item/${menuItemId}${qs}`);
    return res.data.data || null;
  },

  async createRecipe(payload: any): Promise<IRecipe> {
    const res = await apiClient.post<ApiResponse<IRecipe>>('/inventory/recipes', payload);
    return res.data.data!;
  },

  async updateRecipe(id: string, payload: any): Promise<IRecipe> {
    const res = await apiClient.patch<ApiResponse<IRecipe>>(`/inventory/recipes/${id}`, payload);
    return res.data.data!;
  },

  async deleteRecipe(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/inventory/recipes/${id}`);
  },
};

