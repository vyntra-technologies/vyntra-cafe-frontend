import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export interface CashierLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  unpaidBillsCount?: number;
}

export const CashierLayout: React.FC<CashierLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange,
  onRefresh,
  isRefreshing = false,
  unpaidBillsCount = 0,
}) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'pos':
        return 'Point of Sale (POS) Terminal';
      case 'bills':
        return 'Active Unpaid Bills';
      case 'orders':
        return 'All System Orders';
      case 'payment_processing':
        return 'Payment Processing & Gateway';
      case 'transactions':
        return 'Audit Transactions';
      case 'receipts':
        return 'Receipts & Tax Invoices';
      case 'shift':
        return 'Shift Register Summary';
      case 'payment_history':
        return 'Payment Reconciliation History';
      case 'dashboard':
      default:
        return 'Cashier Terminal Dashboard';
    }
  };

  return (
    <DashboardLayout
      role="cashier"
      activeTab={activeTab}
      onTabChange={onTabChange || (() => {})}
      pageTitle={getPageTitle()}
      breadcrumb={`Billing / ${activeTab.replace(/_/g, ' ').toUpperCase()}`}
      badgeCounts={{
        unpaid: unpaidBillsCount,
        unpaidBillsCount,
      }}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
    >
      {children}
    </DashboardLayout>
  );
};
