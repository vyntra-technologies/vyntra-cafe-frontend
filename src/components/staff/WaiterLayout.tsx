import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Avatar,
  Icon,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import {
  FiClock,
  FiLogOut,
  FiUser,
  FiRefreshCw,
  FiCoffee,
  FiShoppingBag,
  FiDollarSign,
  FiShield,
  FiMenu,
  FiCheckCircle,
  FiBell,
  FiPlus,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface WaiterLayoutProps {
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
  activeTab = 'tables',
  onTabChange,
  onRefresh,
  isRefreshing = false,
  activeOrderCount = 0,
  readyOrderCount = 0,
  onNewOrder,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

  // Live real-time ticker
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/waiter/login');
  };

  // Color Tokens
  const bg = useColorModeValue('#FAF9F6', '#09090B');
  const sidebarBg = useColorModeValue('#FFFFFF', '#121215');
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.92)', 'rgba(18, 18, 21, 0.92)');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const activeBg = useColorModeValue('rgba(168, 121, 22, 0.12)', 'rgba(212, 175, 55, 0.12)');

  const userRole = user?.role || 'Waiter';
  const isManagement = ['Owner', 'Admin', 'Manager', 'SUPER_ADMIN', 'MANAGER'].includes(userRole);

  const navItems = [
    { id: 'tables', label: 'Floor Tables', icon: MdTableRestaurant, count: null },
    { id: 'orders', label: 'Active Orders', icon: FiCoffee, count: activeOrderCount },
    { id: 'ready', label: 'Ready for Pickup', icon: FiCheckCircle, count: readyOrderCount, badgeColor: 'green' },
  ];

  const handleNavClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    onMobileClose();
  };

  const SidebarContent = () => (
    <Flex direction="column" h="full" justify="space-between" p={4}>
      <VStack align="stretch" spacing={6}>
        {/* Brand Header */}
        <HStack spacing={3} px={2} py={2}>
          <Box
            w={10}
            h={10}
            borderRadius="xl"
            bg="linear-gradient(135deg, #D4AF37 0%, #A87916 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 2px 10px rgba(212, 175, 55, 0.35)"
          >
            <Icon as={FiCoffee} boxSize={5} color="black" />
          </Box>
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text fontFamily="heading" fontWeight="bold" fontSize="md" letterSpacing="0.05em" color={textCol}>
                VYNTRA CAFE
              </Text>
            </HStack>
            <Badge
              colorScheme="yellow"
              variant="subtle"
              fontSize="9px"
              px={1.5}
              py={0.2}
              borderRadius="sm"
              letterSpacing="0.08em"
            >
              WAITER TERMINAL
            </Badge>
          </VStack>
        </HStack>

        <Divider borderColor={borderCol} />

        {/* Quick Action: New Order */}
        {onNewOrder && (
          <Button
            leftIcon={<FiPlus />}
            bg={gold}
            color="black"
            _hover={{ opacity: 0.9 }}
            w="full"
            size="md"
            fontWeight="bold"
            boxShadow="0 4px 14px rgba(212, 175, 55, 0.25)"
            onClick={onNewOrder}
          >
            New Dine-In Order
          </Button>
        )}

        {/* Main Navigation */}
        <VStack align="stretch" spacing={1.5}>
          <Text fontSize="11px" fontWeight="bold" color={mutedCol} textTransform="uppercase" letterSpacing="0.08em" px={3} mb={1}>
            Service Console
          </Text>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                justifyContent="space-between"
                w="full"
                h={11}
                px={3}
                borderRadius="lg"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? gold : textCol}
                fontWeight={isActive ? 'bold' : 'medium'}
                border="1px solid"
                borderColor={isActive ? borderCol : 'transparent'}
                _hover={{ bg: activeBg, color: gold }}
                onClick={() => handleNavClick(item.id)}
                leftIcon={<Icon as={item.icon} boxSize={4} />}
              >
                <HStack justify="space-between" w="full" ml={1}>
                  <Text fontSize="sm">{item.label}</Text>
                  {item.count !== null && item.count > 0 && (
                    <Badge
                      colorScheme={item.badgeColor || 'yellow'}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                    >
                      {item.count}
                    </Badge>
                  )}
                </HStack>
              </Button>
            );
          })}
        </VStack>

        {/* Cross-Terminal Switcher for Authorized Staff */}
        <VStack align="stretch" spacing={1.5} pt={2}>
          <Text fontSize="11px" fontWeight="bold" color={mutedCol} textTransform="uppercase" letterSpacing="0.08em" px={3} mb={1}>
            Operational Terminals
          </Text>
          <Button
            as={RouterLink}
            to="/chef/dashboard"
            variant="ghost"
            justifyContent="flex-start"
            size="sm"
            leftIcon={<FiShoppingBag />}
            color={mutedCol}
            _hover={{ color: textCol, bg: 'whiteAlpha.100' }}
          >
            Kitchen Display (KDS)
          </Button>
          <Button
            as={RouterLink}
            to="/cashier/dashboard"
            variant="ghost"
            justifyContent="flex-start"
            size="sm"
            leftIcon={<FiDollarSign />}
            color={mutedCol}
            _hover={{ color: textCol, bg: 'whiteAlpha.100' }}
          >
            Cashier POS
          </Button>
          {isManagement && (
            <Button
              as={RouterLink}
              to="/admin/dashboard"
              variant="ghost"
              justifyContent="flex-start"
              size="sm"
              leftIcon={<FiShield />}
              color={gold}
              _hover={{ color: gold, bg: 'whiteAlpha.100' }}
            >
              Admin Portal
            </Button>
          )}
        </VStack>
      </VStack>

      {/* Staff Profile & Logout */}
      <VStack align="stretch" spacing={3} pt={4}>
        <Divider borderColor={borderCol} />
        <HStack spacing={3} px={2} py={2} bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')} borderRadius="xl">
          <Avatar
            size="sm"
            name={user?.name || 'Waiter Staff'}
            src={user?.avatar}
            bg={gold}
            color="black"
            fontWeight="bold"
          />
          <VStack align="start" spacing={0} flex={1} overflow="hidden">
            <Text fontSize="sm" fontWeight="bold" color={textCol} isTruncated>
              {user?.name || 'Waiter Staff'}
            </Text>
            <Text fontSize="xs" color={mutedCol} isTruncated>
              {userRole}
            </Text>
          </VStack>
          <Tooltip label="Sign Out">
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={handleLogout}
            />
          </Tooltip>
        </HStack>
      </VStack>
    </Flex>
  );

  return (
    <Box minH="100vh" bg={bg} color={textCol} display="flex">
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        w="280px"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderCol}
        position="sticky"
        top={0}
        h="100vh"
        display={{ base: 'none', lg: 'block' }}
        zIndex={10}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={sidebarBg} borderRight="1px solid" borderColor={borderCol}>
          <DrawerCloseButton mt={2} />
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Flex direction="column" flex={1} minW={0} overflow="hidden">
        {/* Top Header */}
        <Box
          as="header"
          position="sticky"
          top={0}
          zIndex={9}
          bg={headerBg}
          backdropFilter="blur(16px)"
          borderBottom="1px solid"
          borderColor={borderCol}
          px={{ base: 4, md: 6 }}
          py={3}
        >
          <Flex align="center" justify="space-between">
            {/* Left Header Title / Mobile Menu */}
            <HStack spacing={3}>
              <IconButton
                aria-label="Open Menu"
                icon={<FiMenu />}
                size="sm"
                variant="ghost"
                display={{ base: 'flex', lg: 'none' }}
                onClick={onMobileOpen}
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
                    Floor & Table Service
                  </Text>
                  <Badge colorScheme="yellow" variant="subtle" fontSize="10px" px={2} borderRadius="md">
                    LIVE
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={mutedCol} display={{ base: 'none', sm: 'block' }}>
                  Manage table orders, kitchen pickups, and guest requests
                </Text>
              </VStack>
            </HStack>

            {/* Right Tools: Clock, Refresh, Theme, User Menu */}
            <HStack spacing={{ base: 2, md: 3 }}>
              {/* Live Clock */}
              <HStack
                spacing={1.5}
                px={3}
                py={1.5}
                bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.100')}
                borderRadius="full"
                border="1px solid"
                borderColor={borderCol}
                display={{ base: 'none', sm: 'flex' }}
              >
                <Icon as={FiClock} color={gold} boxSize={3.5} />
                <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.05em">
                  {time}
                </Text>
              </HStack>

              {/* Refresh Button */}
              {onRefresh && (
                <Tooltip label="Refresh Service Queue">
                  <IconButton
                    aria-label="Refresh"
                    icon={<FiRefreshCw />}
                    size="sm"
                    variant="ghost"
                    isLoading={isRefreshing}
                    onClick={onRefresh}
                  />
                </Tooltip>
              )}

              <ThemeToggle />

              {/* Quick Profile Menu */}
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={
                    <Avatar
                      size="xs"
                      name={user?.name || 'Waiter'}
                      src={user?.avatar}
                      bg={gold}
                      color="black"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                />
                <MenuList bg={sidebarBg} borderColor={borderCol} boxShadow="xl" py={2} zIndex={20}>
                  <Box px={4} py={2}>
                    <Text fontWeight="bold" fontSize="sm" color={textCol}>
                      {user?.name || 'Waiter Staff'}
                    </Text>
                    <Text fontSize="xs" color={mutedCol}>
                      {user?.email}
                    </Text>
                    <Badge colorScheme="yellow" fontSize="10px" mt={1}>
                      {userRole}
                    </Badge>
                  </Box>
                  <MenuDivider borderColor={borderCol} />
                  <MenuItem
                    as={RouterLink}
                    to="/chef/dashboard"
                    icon={<FiShoppingBag />}
                    bg="transparent"
                    _hover={{ bg: activeBg }}
                  >
                    Switch to Kitchen
                  </MenuItem>
                  <MenuItem
                    as={RouterLink}
                    to="/cashier/dashboard"
                    icon={<FiDollarSign />}
                    bg="transparent"
                    _hover={{ bg: activeBg }}
                  >
                    Switch to POS
                  </MenuItem>
                  <MenuDivider borderColor={borderCol} />
                  <MenuItem
                    icon={<FiLogOut />}
                    color="red.400"
                    bg="transparent"
                    _hover={{ bg: 'red.500', color: 'white' }}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Content Body */}
        <Box p={{ base: 4, md: 6 }} flex={1} overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

