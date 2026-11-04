import React from 'react';
import {
  Box,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StaffSidebar } from './StaffSidebar';
import { StaffHeader } from './StaffHeader';
import {
  StaffNotificationsModal,
  StaffProfileModal,
  StaffSettingsModal,
} from './StaffModals';
import { STAFF_COLORS } from './StaffTheme';

export interface DashboardLayoutProps {
  role: 'waiter' | 'chef' | 'cashier';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  pageTitle: string;
  breadcrumb?: string;
  badgeCounts?: Record<string, number>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type?: 'order' | 'kitchen' | 'billing';
  }>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  activeTab,
  onTabChange,
  pageTitle,
  breadcrumb,
  badgeCounts = {},
  onRefresh,
  isRefreshing = false,
  children,
  audioEnabled,
  onToggleAudio,
  notifications = [],
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Drawers & Modals
  const {
    isOpen: isMobileOpen,
    onOpen: onMobileOpen,
    onClose: onMobileClose,
  } = useDisclosure();
  const {
    isOpen: isNotificationsOpen,
    onOpen: onNotificationsOpen,
    onClose: onNotificationsClose,
  } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const handleLogout = async () => {
    await logout();
    if (role === 'waiter') navigate('/waiter/login');
    else if (role === 'chef') navigate('/chef/login');
    else if (role === 'cashier') navigate('/cashier/login');
    else navigate('/login');
  };

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    onMobileClose();
  };

  const getRoleTitle = () => {
    if (role === 'waiter') return 'Waiter Floor Service';
    if (role === 'chef') return 'Culinary Kitchen KDS';
    return 'Cashier POS Terminal';
  };

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg={STAFF_COLORS.bg} color={STAFF_COLORS.text}>
      {/* Desktop Fixed Sidebar */}
      <Box display={{ base: 'none', md: 'block' }} h="100%">
        <StaffSidebar
          role={role}
          activeTab={activeTab}
          onTabChange={onTabChange}
          badgeCounts={badgeCounts}
          onLogout={handleLogout}
          onOpenNotifications={onNotificationsOpen}
          onOpenProfile={onProfileOpen}
          onOpenSettings={onSettingsOpen}
        />
      </Box>

      {/* Mobile Drawer Sidebar */}
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.8)" />
        <DrawerContent bg={STAFF_COLORS.sidebar} p="0" maxW="280px">
          <DrawerCloseButton color={STAFF_COLORS.secondaryText} zIndex="10" />
          <StaffSidebar
            role={role}
            activeTab={activeTab}
            onTabChange={handleTabSelect}
            badgeCounts={badgeCounts}
            onLogout={handleLogout}
            onOpenNotifications={() => {
              onMobileClose();
              onNotificationsOpen();
            }}
            onOpenProfile={() => {
              onMobileClose();
              onProfileOpen();
            }}
            onOpenSettings={() => {
              onMobileClose();
              onSettingsOpen();
            }}
          />
        </DrawerContent>
      </Drawer>

      {/* Main Center & Right Work Area */}
      <Flex direction="column" flex="1" h="100%" overflow="hidden">
        {/* Top Header */}
        <StaffHeader
          role={role}
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onMobileMenuOpen={onMobileOpen}
          onOpenNotifications={onNotificationsOpen}
          onOpenProfile={onProfileOpen}
          onOpenSettings={onSettingsOpen}
          unreadNotifications={notifications.length}
          audioEnabled={audioEnabled}
          onToggleAudio={onToggleAudio}
        />

        {/* Scrollable Viewport */}
        <Box
          flex="1"
          overflowY="auto"
          p={{ base: 3, sm: 4, md: 6 }}
          bg={STAFF_COLORS.bg}
          position="relative"
        >
          {children}
        </Box>
      </Flex>

      {/* Shared Modals */}
      <StaffNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={onNotificationsClose}
        notifications={notifications}
      />
      <StaffProfileModal
        isOpen={isProfileOpen}
        onClose={onProfileClose}
        roleTitle={getRoleTitle()}
        onLogout={handleLogout}
      />
      <StaffSettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        roleTitle={getRoleTitle()}
      />

      {/* Global Staff Animations */}
      <style>{`
        @keyframes spinFast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-fast {
          animation: spinFast 0.8s linear infinite;
        }
      `}</style>
    </Flex>
  );
};

