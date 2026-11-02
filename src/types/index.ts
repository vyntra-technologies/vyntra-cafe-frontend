export type UserRole =
  | 'Owner'
  | 'Admin'
  | 'ADMIN'
  | 'Manager'
  | 'Cashier'
  | 'Kitchen Staff'
  | 'Service Staff'
  | 'Inventory Manager'
  | 'Customer'
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'CHEF'
  | 'WAITER'
  | 'CUSTOMER';

export interface IUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ICustomer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  userId?: string | IUser;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface IMenuVariant {
  name: string;
  priceAdjustment: number;
  isDefault?: boolean;
}

export interface IMenuAddOn {
  name: string;
  price: number;
}

export interface IMenuItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | ICategory;
  images: string[];
  basePrice: number;
  variants: IMenuVariant[];
  addOns: IMenuAddOn[];
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  taxPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderType = 'dine-in' | 'takeaway' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'served'
  | 'completed'
  | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online' | 'wallet';

export interface IOrderItemAddOn {
  name: string;
  price: number;
}

export interface IOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  variantName?: string;
  variantPriceAdjustment?: number;
  addOns?: IOrderItemAddOn[];
  unitPrice: number;
  itemTotal: number;
  notes?: string;
}

export interface IOrderStatusHistory {
  status: FulfillmentStatus;
  note?: string;
  changedBy?: string;
  timestamp: string;
}

export interface ICancellationRequest {
  reason: string;
  requestedBy?: any;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: any;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  orderType: OrderType;
  customerId?: string | ICustomer;
  customerName?: string;
  customerPhone?: string;
  tableId?: string | ITable;
  tableNumber?: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  taxAmount: number;
  taxBreakup: { name: string; rate: number; amount: number }[];
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  notes?: string;
  timeline: IOrderStatusHistory[];
  cancellationRequest?: ICancellationRequest;
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface ITable {
  _id: string;
  tableNumber: string;
  capacity: number;
  section: string;
  status: TableStatus;
  isActive: boolean;
  activeOrderId?: string | null;
  qrCodeUrl?: string;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'arrived'
  | 'completed'
  | 'no_show';

export interface IReservation {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  durationMinutes: number;
  tableId?: string | ITable;
  specialRequests?: string;
  status: ReservationStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface IReview {
  _id: string;
  customerName: string;
  rating: number;
  comment?: string;
  menuItemId?: string | IMenuItem;
  orderId?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt: string;
}

export interface ITaxRule {
  name: string;
  percentage: number;
  isEnabled: boolean;
}

export interface IOpeningHour {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ISettings {
  _id?: string;
  cafeName: string;
  logoUrl?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  taxNumber?: string;
  currency: {
    code: string;
    symbol: string;
  };
  taxRules: ITaxRule[];
  openingHours: IOpeningHour[];
  receiptSettings: {
    headerText?: string;
    footerMessage?: string;
    showTaxSummary: boolean;
    showLogo: boolean;
  };
  reservationRules: {
    slotDurationMinutes: number;
    maxAdvanceDays: number;
    autoCancelGraceMinutes: number;
    minPartySize: number;
    maxPartySize: number;
  };
  orderSettings: {
    allowGuestOrders: boolean;
    defaultPrepTimeMinutes: number;
    acceptingOnlineOrders: boolean;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: any[];
}

export interface ICartItem {
  cartItemId: string; // generated unique id (menuItemId + variant + addons)
  menuItem: IMenuItem;
  quantity: number;
  selectedVariant?: IMenuVariant;
  selectedAddOns: IMenuAddOn[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export type StaffAccountStatus =
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'revoked'
  | 'rejected';

export interface IStaffStatusHistory {
  status: StaffAccountStatus;
  changedBy?: string;
  timestamp: string;
  note?: string;
}

export interface IStaff {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    isActive?: boolean;
  } | string;
  employeeId: string;
  position: string;
  department?: string;
  salaryType: 'hourly' | 'monthly';
  hourlyRate?: number;
  monthlySalary?: number;
  hireDate: string;
  status: StaffAccountStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  customPermissions?: string[];
  statusHistory?: IStaffStatusHistory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId?: string;
  role?: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDashboardMetrics {
  today: {
    totalOrders: number;
    grossSales: number;
    paidRevenue: number;
    expenses: number;
    reservations: number;
  };
  operationalAlerts: {
    activeOrders: number;
    lowStockItems: number;
  };
}

export interface ISalesSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalOrders: number;
    paidOrders: number;
    grossSales: number;
    totalDiscounts: number;
    netSales: number;
    totalTaxCollected: number;
    totalRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
  };
}

export interface IDailySales {
  date: string;
  orderCount: number;
  paidOrderCount: number;
  grossSales: number;
  discounts: number;
  taxCollected: number;
  revenue: number;
}

export interface IBestsellerItem {
  menuItemId: string;
  name: string;
  category?: string;
  imageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface IOrderAnalytics {
  byType: {
    type: string;
    count: number;
    revenue: number;
  }[];
  bySource?: {
    source: string;
    count: number;
    revenue: number;
  }[];
}

export interface IPaymentSummary {
  byMethod: {
    method: string;
    count: number;
    totalAmount: number;
  }[];
  byStatus?: {
    status: string;
    count: number;
    totalAmount: number;
  }[];
}

// ==========================================
// PHASE 5 — INVENTORY & OPERATIONS TYPES
// ==========================================

export interface IIngredient {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  costPerUnit: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StockMovementType =
  | 'purchase'
  | 'order_consumption'
  | 'wastage'
  | 'manual_adjustment'
  | 'return';

export interface IStockMovement {
  _id: string;
  ingredientId: string | { _id: string; name: string; unit: string };
  quantityChange: number;
  type: StockMovementType;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string;
  performedBy?: string | { _id: string; name: string; role?: string };
  createdAt: string;
}

export interface ISupplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  ingredientsSupplied?: (string | { _id: string; name: string; unit: string })[];
  paymentTerms?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseStatus =
  | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export type PurchasePaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'failed';

export interface IPurchaseItem {
  _id?: string;
  ingredientId: string | { _id: string; name: string; unit: string; currentStock?: number; costPerUnit?: number };
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IReceivingHistoryItem {
  ingredientId: string;
  quantityReceived: number;
}

export interface IReceivingHistory {
  receivedAt: string;
  receivedBy: string | { _id: string; name: string; role?: string };
  items: IReceivingHistoryItem[];
  notes?: string;
}

export interface ISupplierPayment {
  _id?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  paidBy: string | { _id: string; name: string; role?: string };
  notes?: string;
}

export interface IPurchase {
  _id: string;
  purchaseOrderNumber: string;
  supplierId: string | { _id: string; name: string; contactPerson?: string; email?: string; phone?: string; address?: string };
  items: IPurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  orderDate?: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  invoiceNumber?: string;
  notes?: string;
  receivingHistory?: IReceivingHistory[];
  payments?: ISupplierPayment[];
  createdBy?: string | { _id: string; name: string; role?: string };
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryValuationItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  costPerUnit: number;
  totalValuation: number;
  isLowStock: boolean;
}

export interface IInventoryReport {
  totalIngredientsTracked: number;
  lowStockIngredientsCount: number;
  totalInventoryValuation: number;
  ingredients: IInventoryValuationItem[];
}

export interface IRecipeIngredient {
  ingredientId: string | { _id: string; name: string; unit: string; currentStock?: number };
  quantity: number;
  unit: string;
}

export interface IRecipe {
  _id: string;
  menuItemId: string | { _id: string; name: string; basePrice?: number };
  variantName?: string;
  ingredients: IRecipeIngredient[];
  preparationInstructions?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


