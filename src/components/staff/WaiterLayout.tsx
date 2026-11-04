import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export interface WaiterLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeOrderCount?: number;
  readyOrderCount?: number;
  onNewOrder?: () => void;
}

export const WaiterLayout: React.FC<WaiterLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange,
  onRefresh,
  isRefreshing = false,
  activeOrderCount = 0,
  readyOrderCount = 0,
}) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'tables':
        return 'Table Management';
      case 'new_order':
        return 'Create Floor Order';
      case 'menu':
        return 'Menu Catalog';
      case 'ready':
        return 'Orders Ready for Service';
      case 'active_orders':
        return 'Active Floor Orders';
      case 'served_orders':
        return 'Served Orders Record';
      case 'order_history':
        return 'Order History Archive';
      case 'dashboard':
      default:
        return 'Waiter Floor Console';
    }
  };

  return (
    <DashboardLayout
      role="waiter"
      activeTab={activeTab}
      onTabChange={onTabChange || (() => {})}
      pageTitle={getPageTitle()}
      breadcrumb={`Floor Console / ${activeTab.replace(/_/g, ' ').toUpperCase()}`}
      badgeCounts={{
        ready: readyOrderCount,
        active: activeOrderCount,
      }}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
    >
      {children}
    </DashboardLayout>
  );
};
