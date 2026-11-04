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
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminAuthLayout } from '../components/layout/AdminAuthLayout';
import { ROLE_GROUPS } from '../utils/roleUtils';

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
import { WaiterLoginPage } from '../pages/staff/WaiterLoginPage';
import { ChefLoginPage } from '../pages/staff/ChefLoginPage';
import { CashierLoginPage } from '../pages/staff/CashierLoginPage';
import { ManagerLoginPage } from '../pages/staff/ManagerLoginPage';
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

      {/* Customer Authentication Routes (PublicOnlyRoute: if already signed in, redirects to role dashboard) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Dedicated Separate Staff & Admin Login Pages (Role-Specific Branding, PublicOnlyRoute protected) */}
      <Route
        path="/admin/login"
        element={
          <PublicOnlyRoute>
            <AdminAuthLayout>
              <AdminLoginPage />
            </AdminAuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/waiter/login"
        element={
          <PublicOnlyRoute>
            <WaiterLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/chef/login"
        element={
          <PublicOnlyRoute>
            <ChefLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/cashier/login"
        element={
          <PublicOnlyRoute>
            <CashierLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/manager/login"
        element={
          <PublicOnlyRoute>
            <ManagerLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/staff/login" element={<Navigate to="/waiter/login" replace />} />
      <Route path="/kitchen/login" element={<Navigate to="/chef/login" replace />} />
      <Route path="/pos/login" element={<Navigate to="/cashier/login" replace />} />

      {/* Admin Operations Portal Routes (Strict Role Protection: ADMIN / SUPER_ADMIN / OWNER) */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminOverviewPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/overview" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/orders"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminOrdersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminMenuPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminCategoriesPage />
          </RoleProtectedRoute>
        }
      />

      {/* Admin Inventory & Operations Routes */}
      <Route
        path="/admin/inventory"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminInventoryDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/ingredients"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminIngredientsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/stock"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminStockManagementPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/suppliers"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminSuppliersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/purchases"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminPurchasesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/alerts"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminStockAlertsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/waste"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminWasteManagementPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory/reports"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminInventoryReportsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminTablesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminReservationsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminCustomersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminStaffPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminReportsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminNotificationsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN} loginPath="/admin/login">
            <AdminSettingsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Staff Operational Terminals */}
      <Route
        path="/waiter/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.WAITER} loginPath="/waiter/login">
            <WaiterDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/waiter" element={<Navigate to="/waiter/dashboard" replace />} />

      <Route
        path="/chef/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.CHEF} loginPath="/chef/login">
            <KitchenDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/chef" element={<Navigate to="/chef/dashboard" replace />} />
      <Route path="/kitchen" element={<Navigate to="/chef/dashboard" replace />} />

      <Route
        path="/cashier/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.CASHIER} loginPath="/cashier/login">
            <CashierDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/cashier" element={<Navigate to="/cashier/dashboard" replace />} />
      <Route path="/pos" element={<Navigate to="/cashier/dashboard" replace />} />

      <Route
        path="/manager/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.MANAGER} loginPath="/manager/login">
            <ManagerDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
      <Route path="/staff" element={<Navigate to="/waiter/login" replace />} />

      {/* Access Denied / 403 Unauthorized Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
export default AppRoutes;
