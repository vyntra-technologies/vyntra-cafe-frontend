import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export interface ChefLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTicketCount?: number;
  completedTicketCount?: number;
  pendingTicketCount?: number;
  preparingTicketCount?: number;
  readyTicketCount?: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const ChefLayout: React.FC<ChefLayoutProps> = ({
  children,
  activeTab = 'overview',
  onTabChange,
  onRefresh,
  isRefreshing = false,
  activeTicketCount = 0,
  completedTicketCount = 0,
  pendingTicketCount = 0,
  preparingTicketCount = 0,
  readyTicketCount = 0,
  audioEnabled = true,
  onToggleAudio,
}) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'new_tickets':
        return 'Incoming Kitchen Tickets';
      case 'preparing':
        return 'Active Cooking & Preparation';
      case 'ready':
        return 'Ready for Pickup / Waiter Service';
      case 'completed':
        return 'Completed Culinary Records';
      case 'order_history':
        return 'Kitchen Order History';
      case 'overview':
      default:
        return 'Kitchen Display System (KDS)';
    }
  };

  return (
    <DashboardLayout
      role="chef"
      activeTab={activeTab}
      onTabChange={onTabChange || (() => {})}
      pageTitle={getPageTitle()}
      breadcrumb={`Culinary / ${activeTab.replace(/_/g, ' ').toUpperCase()}`}
      badgeCounts={{
        newTickets: pendingTicketCount,
        preparing: preparingTicketCount,
        ready: readyTicketCount,
        active: activeTicketCount,
      }}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      audioEnabled={audioEnabled}
      onToggleAudio={onToggleAudio}
    >
      {children}
    </DashboardLayout>
  );
};
