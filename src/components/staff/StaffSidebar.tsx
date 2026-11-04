import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Divider,
  Button,
} from '@chakra-ui/react';
import {
  FiClock,
  FiLogOut,
  FiUser,
  FiCoffee,
  FiCheckCircle,
  FiBell,
  FiSettings,
  FiFileText,
  FiPlusCircle,
  FiGrid,
  FiBookOpen,
  FiShoppingBag,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { FaFire, FaUtensils, FaConciergeBell, FaReceipt } from 'react-icons/fa';
import { STAFF_COLORS } from './StaffTheme';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColorScheme?: string;
  isAction?: boolean;
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

export interface StaffSidebarProps {
  role: 'waiter' | 'chef' | 'cashier';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  badgeCounts?: Record<string, number>;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  role,
  activeTab,
  onTabChange,
  badgeCounts = {},
  onLogout,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
}) => {
  // Navigation Menus configured specifically for each role
  const getNavGroups = (): NavGroupConfig[] => {
    if (role === 'waiter') {
      return [
        {
          title: 'MAIN',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
            { id: 'tables', label: 'Tables', icon: MdTableRestaurant },
            { id: 'new_order', label: 'New Order', icon: FiPlusCircle },
            { id: 'menu', label: 'Menu Catalog', icon: FiBookOpen },
          ],
        },
        {
          title: 'ORDERS',
          items: [
            {
              id: 'ready',
              label: 'Ready for Service',
              icon: FaConciergeBell,
              badge: badgeCounts.ready || badgeCounts.readyOrderCount,
              badgeColorScheme: 'green',
            },
            {
              id: 'active_orders',
              label: 'Active Orders',
              icon: FiClock,
              badge: badgeCounts.active || badgeCounts.activeOrderCount,
              badgeColorScheme: 'yellow',
            },
            { id: 'served_orders', label: 'Served Orders', icon: FiCheckCircle },
            { id: 'order_history', label: 'Order History', icon: FiFileText },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { id: 'notifications', label: 'Notifications', icon: FiBell, isAction: true },
            { id: 'profile', label: 'My Profile', icon: FiUser, isAction: true },
            { id: 'settings', label: 'Settings', icon: FiSettings, isAction: true },
            { id: 'logout', label: 'Logout', icon: FiLogOut, isAction: true },
          ],
        },
      ];
    }

    if (role === 'chef') {
      return [
        {
          title: 'KITCHEN',
          items: [
            { id: 'overview', label: 'Kitchen Overview', icon: FaFire },
            {
              id: 'new_tickets',
              label: 'New Tickets',
              icon: FiClock,
              badge: badgeCounts.newTickets || badgeCounts.pendingCount,
              badgeColorScheme: 'yellow',
            },
            {
              id: 'preparing',
              label: 'Preparing / Cooking',
              icon: FaUtensils,
              badge: badgeCounts.preparing || badgeCounts.preparingCount,
              badgeColorScheme: 'orange',
            },
            {
              id: 'ready',
              label: 'Ready for Pickup',
              icon: FaConciergeBell,
              badge: badgeCounts.ready || badgeCounts.readyCount,
              badgeColorScheme: 'green',
            },
          ],
        },
        {
          title: 'MANAGEMENT',
          items: [
            { id: 'completed', label: 'Served / Completed', icon: FiCheckCircle },
            { id: 'order_history', label: 'Order History', icon: FiFileText },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { id: 'notifications', label: 'Notifications', icon: FiBell, isAction: true },
            { id: 'profile', label: 'My Profile', icon: FiUser, isAction: true },
            { id: 'settings', label: 'Settings', icon: FiSettings, isAction: true },
            { id: 'logout', label: 'Logout', icon: FiLogOut, isAction: true },
          ],
        },
      ];
    }

    // Cashier Role
    return [
      {
        title: 'MAIN',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
          { id: 'pos', label: 'POS Terminal', icon: FiShoppingBag },
          {
            id: 'bills',
            label: 'Active Bills',
            icon: FiDollarSign,
            badge: badgeCounts.unpaid || badgeCounts.unpaidBillsCount,
            badgeColorScheme: 'red',
          },
          { id: 'orders', label: 'All Orders', icon: FiFileText },
        ],
      },
      {
        title: 'PAYMENTS',
        items: [
          { id: 'payment_processing', label: 'Payment Processing', icon: FiCreditCard },
          { id: 'transactions', label: 'Transactions', icon: FiFileText },
          { id: 'receipts', label: 'Receipts', icon: FaReceipt },
        ],
      },
      {
        title: 'REPORTS',
        items: [
          { id: 'shift', label: 'Shift Summary', icon: FiPieChart },
          { id: 'payment_history', label: 'Payment History', icon: FiClock },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { id: 'notifications', label: 'Notifications', icon: FiBell, isAction: true },
          { id: 'profile', label: 'My Profile', icon: FiUser, isAction: true },
          { id: 'settings', label: 'Settings', icon: FiSettings, isAction: true },
          { id: 'logout', label: 'Logout', icon: FiLogOut, isAction: true },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  const handleItemClick = (item: NavItemConfig) => {
    if (item.id === 'logout') {
      onLogout();
      return;
    }
    if (item.id === 'notifications') {
      if (onOpenNotifications) onOpenNotifications();
      return;
    }
    if (item.id === 'profile') {
      if (onOpenProfile) onOpenProfile();
      return;
    }
    if (item.id === 'settings') {
      if (onOpenSettings) onOpenSettings();
      return;
    }

    onTabChange(item.id);
  };

  return (
    <Box
      w={{ base: '100%', md: '260px' }}
      bg={STAFF_COLORS.sidebar}
      borderRightWidth={{ base: '0px', md: '1px' }}
      borderColor={STAFF_COLORS.border}
      h="100%"
      display="flex"
      flexDirection="column"
      p={4}
      userSelect="none"
    >
      {/* Brand Header */}
      <Box px={3} py={2} mb={4}>
        <HStack spacing={2.5}>
          <Box
            w={9}
            h={9}
            borderRadius="xl"
            bg={STAFF_COLORS.goldGradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(217, 179, 74, 0.3)"
          >
            <Text fontWeight="900" color="#0B0B0D" fontSize="sm" fontFamily="serif">
              V
            </Text>
          </Box>
          <Box>
            <Text
              fontFamily="heading"
              fontWeight="900"
              fontSize="sm"
              letterSpacing="0.1em"
              color={STAFF_COLORS.primaryGold}
              lineHeight="1.2"
            >
              VYNTRA CAFE
            </Text>
            <Text
              fontSize="9px"
              fontWeight="700"
              letterSpacing="0.15em"
              color={STAFF_COLORS.secondaryText}
              textTransform="uppercase"
            >
              Haute Gastronomie
            </Text>
          </Box>
        </HStack>

        <Badge
          mt={3}
          w="100%"
          textAlign="center"
          fontSize="9px"
          letterSpacing="0.1em"
          py={1}
          borderRadius="md"
          bg={STAFF_COLORS.goldSubtle}
          color={STAFF_COLORS.primaryGold}
          borderWidth="1px"
          borderColor={STAFF_COLORS.borderGold}
          textTransform="uppercase"
        >
          {role === 'waiter'
            ? 'Waiter Service Console'
            : role === 'chef'
            ? 'Kitchen Display System'
            : 'POS Billing Terminal'}
        </Badge>
      </Box>

      <Divider borderColor={STAFF_COLORS.border} mb={3} />

      {/* Navigation Group Items */}
      <VStack spacing={4} align="stretch" flex="1" overflowY="auto" pr={1}>
        {navGroups.map((group, gIdx) => (
          <Box key={gIdx}>
            <Text
              fontSize="10px"
              fontWeight="800"
              color={STAFF_COLORS.mutedText}
              letterSpacing="0.12em"
              px={3}
              mb={2}
            >
              {group.title}
            </Text>

            <VStack spacing={1} align="stretch">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const ItemIcon = item.icon;

                return (
                  <Box
                    key={item.id}
                    as="button"
                    w="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    px={3}
                    py={2.5}
                    borderRadius="xl"
                    transition="all 0.15s ease"
                    bg={isActive ? STAFF_COLORS.goldSubtle : 'transparent'}
                    borderWidth="1px"
                    borderColor={isActive ? STAFF_COLORS.borderGold : 'transparent'}
                    color={isActive ? STAFF_COLORS.primaryGold : STAFF_COLORS.secondaryText}
                    _hover={{
                      bg: isActive ? STAFF_COLORS.goldSubtle : STAFF_COLORS.card,
                      color: isActive ? STAFF_COLORS.primaryGold : STAFF_COLORS.text,
                      transform: 'translateX(2px)',
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <HStack spacing={3}>
                      <Icon
                        as={ItemIcon}
                        boxSize={4}
                        color={isActive ? STAFF_COLORS.primaryGold : STAFF_COLORS.mutedText}
                      />
                      <Text
                        fontSize="xs"
                        fontWeight={isActive ? '700' : '500'}
                        color={isActive ? STAFF_COLORS.text : 'inherit'}
                      >
                        {item.label}
                      </Text>
                    </HStack>

                    {item.badge !== undefined && Number(item.badge) > 0 && (
                      <Badge
                        fontSize="10px"
                        fontWeight="800"
                        px={1.5}
                        py={0.2}
                        borderRadius="full"
                        colorScheme={item.badgeColorScheme || 'yellow'}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Box>
                );
              })}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

