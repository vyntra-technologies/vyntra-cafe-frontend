import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { MenuPage } from '../pages/MenuPage';
import { CategoryListingPage } from '../pages/CategoryListingPage';
import { FoodDetailsPage } from '../pages/FoodDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { CustomerProfilePage } from '../pages/CustomerProfilePage';
import { AddressManagementPage } from '../pages/AddressManagementPage';
import { ReservationPage } from '../pages/ReservationPage';
import { ReservationHistoryPage } from '../pages/ReservationHistoryPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminAuthLayout } from '../components/layout/AdminAuthLayout';
import {
  StaffProtectedRoute,
  WAITER_ROLES,
  KITCHEN_ROLES,
  CASHIER_ROLES,
  MANAGEMENT_ROLES,
} from './StaffProtectedRoute';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminTablesPage } from '../pages/admin/AdminTablesPage';
import { AdminReservationsPage } from '../pages/admin/AdminReservationsPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminStaffPage } from '../pages/admin/AdminStaffPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Admin Inventory Pages (Phase 5)
import { AdminInventoryDashboardPage } from '../pages/admin/inventory/AdminInventoryDashboardPage';
import { AdminIngredientsPage } from '../pages/admin/inventory/AdminIngredientsPage';
import { AdminStockManagementPage } from '../pages/admin/inventory/AdminStockManagementPage';
import { AdminSuppliersPage } from '../pages/admin/inventory/AdminSuppliersPage';
import { AdminPurchasesPage } from '../pages/admin/inventory/AdminPurchasesPage';
import { AdminStockAlertsPage } from '../pages/admin/inventory/AdminStockAlertsPage';
import { AdminWasteManagementPage } from '../pages/admin/inventory/AdminWasteManagementPage';
import { AdminInventoryReportsPage } from '../pages/admin/inventory/AdminInventoryReportsPage';

// Staff Terminals & Dashboards
import { StaffLoginPage } from '../pages/staff/StaffLoginPage';
import { WaiterDashboardPage } from '../pages/staff/WaiterDashboardPage';
import { KitchenDashboardPage } from '../pages/staff/KitchenDashboardPage';
import { CashierDashboardPage } from '../pages/staff/CashierDashboardPage';
import { ManagerDashboardPage } from '../pages/staff/ManagerDashboardPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes (Protected by PublicLayout with Customer Navbar & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:id" element={<FoodDetailsPage />} />
        <Route path="/categories" element={<CategoryListingPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="/track-order/:id" element={<OrderTrackingPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <AddressManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/reservation-history" element={<ReservationHistoryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Customer Authentication Routes (Clean Standalone Pages, No Navbar/Footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Authentication Route (Dedicated AdminAuthLayout, Completely Isolated, No Public Navbar/Footer) */}
      <Route
        path="/admin/login"
        element={
          <AdminAuthLayout>
            <AdminLoginPage />
          </AdminAuthLayout>
        }
      />

      {/* Admin Operations Portal Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminOverviewPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/overview"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/orders"
        element={
          <AdminProtectedRoute>
            <AdminOrdersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <AdminProtectedRoute>
            <AdminMenuPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminProtectedRoute>
            <AdminCategoriesPage />
          </AdminProtectedRoute>
        }
      />

      {/* Admin Inventory & Operations Routes (Phase 5) */}
      <Route
        path="/admin/inventory"
        element={
          <AdminProtectedRoute>
            <AdminInventoryDashboardPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/ingredients"
        element={
          <AdminProtectedRoute>
            <AdminIngredientsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/stock"
        element={
          <AdminProtectedRoute>
            <AdminStockManagementPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/suppliers"
        element={
          <AdminProtectedRoute>
            <AdminSuppliersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/purchases"
        element={
          <AdminProtectedRoute>
            <AdminPurchasesPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/alerts"
        element={
          <AdminProtectedRoute>
            <AdminStockAlertsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/waste"
        element={
          <AdminProtectedRoute>
            <AdminWasteManagementPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/reports"
        element={
          <AdminProtectedRoute>
            <AdminInventoryReportsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <AdminProtectedRoute>
            <AdminTablesPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <AdminProtectedRoute>
            <AdminReservationsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <AdminProtectedRoute>
            <AdminCustomersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <AdminProtectedRoute>
            <AdminStaffPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <AdminReportsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <AdminProtectedRoute>
            <AdminNotificationsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminSettingsPage />
          </AdminProtectedRoute>
        }
      />

      {/* Staff Authentication Route */}
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route path="/staff" element={<Navigate to="/staff/login" replace />} />

      {/* Staff Operational Terminals */}
      <Route
        path="/waiter/dashboard"
        element={
          <StaffProtectedRoute allowedRoles={WAITER_ROLES}>
            <WaiterDashboardPage />
          </StaffProtectedRoute>
        }
      />
      <Route path="/waiter" element={<Navigate to="/waiter/dashboard" replace />} />

      <Route
        path="/chef/dashboard"
        element={
          <StaffProtectedRoute allowedRoles={KITCHEN_ROLES}>
            <KitchenDashboardPage />
          </StaffProtectedRoute>
        }
      />
      <Route path="/chef" element={<Navigate to="/chef/dashboard" replace />} />
      <Route path="/kitchen" element={<Navigate to="/chef/dashboard" replace />} />

      <Route
        path="/cashier/dashboard"
        element={
          <StaffProtectedRoute allowedRoles={CASHIER_ROLES}>
            <CashierDashboardPage />
          </StaffProtectedRoute>
        }
      />
      <Route path="/cashier" element={<Navigate to="/cashier/dashboard" replace />} />
      <Route path="/pos" element={<Navigate to="/cashier/dashboard" replace />} />

      <Route
        path="/manager/dashboard"
        element={
          <StaffProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <ManagerDashboardPage />
          </StaffProtectedRoute>
        }
      />
      <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
