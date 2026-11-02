import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  Button,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useColorModeValue,
  Tooltip,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import {
  FiGrid,
  FiShoppingBag,
  FiCoffee,
  FiLayers,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiBell,
  FiLogOut,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiCheck,
  FiBox,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { NavLink, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { notificationService } from '../../services/notification.service';
import { socketService } from '../../services/socket.service';
import { INotification } from '../../types';

interface NavItemConfig {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Overview', path: '/admin/dashboard', icon: FiGrid, exact: true },
  { label: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
  { label: 'Menu Items', path: '/admin/menu', icon: FiCoffee },
  { label: 'Categories', path: '/admin/categories', icon: FiLayers },
  { label: 'Inventory & Operations', path: '/admin/inventory', icon: FiBox },
  { label: 'Tables', path: '/admin/tables', icon: MdTableRestaurant },
  { label: 'Reservations', path: '/admin/reservations', icon: FiCalendar },
  { label: 'Customers', path: '/admin/customers', icon: FiUsers },
  { label: 'Staff Management', path: '/admin/staff', icon: FiUserCheck },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: FiBarChart2 },
  { label: 'Notifications', path: '/admin/notifications', icon: FiBell },
  { label: 'Settings', path: '/admin/settings', icon: FiSettings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode; pageTitle?: string }> = ({
  children,
  pageTitle,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Palette tokens
  const bg = useColorModeValue('#FAF9F6', '#0B0B0D');
  const sidebarBg = useColorModeValue('#FFFFFF', '#111114');
  const surfaceBg = useColorModeValue('#FFFFFF', '#151518');
  const cardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const activeNavBg = useColorModeValue('rgba(168, 121, 22, 0.12)', 'rgba(212, 175, 55, 0.14)');
  const hoverNavBg = useColorModeValue('rgba(168, 121, 22, 0.08)', 'rgba(212, 175, 55, 0.08)');
  const unreadNotificationBg = useColorModeValue('rgba(168, 121, 22, 0.05)', 'rgba(212, 175, 55, 0.05)');

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await notificationService.getAll();
      setNotifications(data.slice(0, 15));
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // Ignore background notification fetch errors
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen to real-time events via socket
    const handleOrderNotification = (data: any) => {
      loadNotifications();
    };

    socketService.on('new_order', handleOrderNotification);
    socketService.on('order_status_updated', handleOrderNotification);
    socketService.on('cancellation_request', handleOrderNotification);

    return () => {
      socketService.off('new_order', handleOrderNotification);
      socketService.off('order_status_updated', handleOrderNotification);
      socketService.off('cancellation_request', handleOrderNotification);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Fallback
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const currentNav = NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  const sidebarContent = (
    <Flex direction="column" h="100%" justify="space-between" py={5} px={isCollapsed ? 3 : 4}>
      {/* Brand Header */}
      <Box>
        <Flex
          align="center"
          justify={isCollapsed ? 'center' : 'space-between'}
          mb={8}
          px={isCollapsed ? 0 : 2}
        >
          {!isCollapsed && (
            <Box>
              <HStack spacing={2} align="center">
                <Text
                  fontFamily="heading"
                  fontSize="xl"
                  fontWeight="bold"
                  color={goldAccent}
                  letterSpacing="0.08em"
                >
                  VYNTRA
                </Text>
                <Badge
                  bg={goldAccent}
                  color="black"
                  fontSize="9px"
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                >
                  OPERATIONS
                </Badge>
              </HStack>
              <Text fontSize="10px" color={mutedColor} letterSpacing="0.1em" textTransform="uppercase">
                Restaurant Administration
              </Text>
            </Box>
          )}

          {isCollapsed && (
            <Text
              fontFamily="heading"
              fontSize="xl"
              fontWeight="bold"
              color={goldAccent}
              letterSpacing="0.08em"
            >
              V
            </Text>
          )}
        </Flex>

        {/* Navigation Links */}
        <VStack spacing={1.5} align="stretch">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Tooltip
                key={item.path}
                label={isCollapsed ? item.label : ''}
                placement="right"
                hasArrow
                isDisabled={!isCollapsed}
              >
                <Box
                  as={NavLink}
                  to={item.path}
                  onClick={onMobileClose}
                  display="flex"
                  alignItems="center"
                  justifyContent={isCollapsed ? 'center' : 'flex-start'}
                  px={isCollapsed ? 3 : 3.5}
                  py={2.5}
                  borderRadius="xl"
                  fontWeight={isActive ? '600' : '500'}
                  fontSize="13.5px"
                  transition="all 0.2s ease"
                  bg={isActive ? activeNavBg : 'transparent'}
                  color={isActive ? goldAccent : mutedColor}
                  borderLeft={isActive && !isCollapsed ? `3px solid ${goldAccent}` : '3px solid transparent'}
                  _hover={{
                    bg: hoverNavBg,
                    color: goldAccent,
                    transform: 'translateX(2px)',
                  }}
                >
                  <Icon
                    as={item.icon}
                    boxSize={4.5}
                    mr={isCollapsed ? 0 : 3}
                    color={isActive ? goldAccent : mutedColor}
                  />
                  {!isCollapsed && <Text>{item.label}</Text>}
                </Box>
              </Tooltip>
            );
          })}
        </VStack>
      </Box>

      {/* Sidebar Bottom Controls */}
      <Box pt={4} borderTop="1px solid" borderColor={borderColor}>
        <Tooltip
          label={isCollapsed ? 'View Storefront' : ''}
          placement="right"
          isDisabled={!isCollapsed}
        >
          <Button
            as={RouterLink}
            to="/"
            target="_blank"
            variant="ghost"
            size="sm"
            w="100%"
            justifyContent={isCollapsed ? 'center' : 'flex-start'}
            leftIcon={<FiExternalLink />}
            color={mutedColor}
            _hover={{ color: goldAccent, bg: 'transparent' }}
            fontSize="12px"
            mb={2}
          >
            {!isCollapsed && 'Customer Storefront'}
          </Button>
        </Tooltip>

        {/* User Card */}
        <Flex
          align="center"
          justify={isCollapsed ? 'center' : 'space-between'}
          p={2}
          borderRadius="lg"
          bg={cardBg}
        >
          <HStack spacing={2.5}>
            <Avatar
              size="sm"
              name={user?.name || 'Manager'}
              src={user?.avatar}
              bg={goldAccent}
              color="black"
              fontWeight="bold"
            />
            {!isCollapsed && (
              <Box maxW="110px">
                <Text fontSize="12px" fontWeight="600" color={textColor} isTruncated>
                  {user?.name || 'Administrator'}
                </Text>
                <Badge
                  colorScheme="yellow"
                  variant="subtle"
                  fontSize="9px"
                  borderRadius="sm"
                  px={1}
                >
                  {user?.role || 'MANAGER'}
                </Badge>
              </Box>
            )}
          </HStack>

          {!isCollapsed && (
            <IconButton
              aria-label="Logout"
              icon={<FiLogOut />}
              size="xs"
              variant="ghost"
              color={mutedColor}
              _hover={{ color: 'red.400' }}
              onClick={handleLogout}
            />
          )}
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Box minH="100vh" bg={bg} color={textColor} display="flex">
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        display={{ base: 'none', lg: 'block' }}
        w={isCollapsed ? '78px' : '260px'}
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderColor}
        position="sticky"
        top={0}
        h="100vh"
        transition="width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        zIndex={100}
      >
        {sidebarContent}

        {/* Desktop Collapse Toggle */}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          size="xs"
          position="absolute"
          top="26px"
          right="-13px"
          borderRadius="full"
          bg={sidebarBg}
          border="1px solid"
          borderColor={borderColor}
          color={goldAccent}
          boxShadow="md"
          _hover={{ bg: goldAccent, color: 'black' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} borderRight="1px solid" borderColor={borderColor}>
          <DrawerCloseButton color={mutedColor} />
          <DrawerHeader pb={0} />
          <DrawerBody p={0}>{sidebarContent}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Flex direction="column" flex={1} minW={0} overflow="hidden">
        {/* Top Navbar */}
        <Box
          as="header"
          h="70px"
          px={{ base: 4, md: 8 }}
          bg={surfaceBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={90}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack spacing={3}>
            <IconButton
              display={{ base: 'flex', lg: 'none' }}
              aria-label="Open Mobile Menu"
              icon={<FiMenu />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={onMobileOpen}
            />

            <Box>
              <Text fontSize="11px" color={mutedColor} letterSpacing="0.05em">
                ADMINISTRATION &bull; {currentNav?.label || 'DASHBOARD'}
              </Text>
              <Text
                fontFamily="heading"
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="700"
                color={textColor}
                letterSpacing="-0.01em"
              >
                {pageTitle || currentNav?.label || 'Overview'}
              </Text>
            </Box>
          </HStack>

          {/* Right Action Bar */}
          <HStack spacing={3}>
            {/* Live Notifications Popover */}
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Box position="relative" cursor="pointer">
                  <IconButton
                    aria-label="Notifications"
                    icon={<FiBell />}
                    variant="outline"
                    borderColor={borderColor}
                    color={textColor}
                    size="sm"
                    _hover={{ borderColor: goldAccent, color: goldAccent }}
                  />
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-4px"
                      right="-4px"
                      bg="red.500"
                      color="white"
                      fontSize="10px"
                      borderRadius="full"
                      px={1.5}
                      boxShadow="0 0 8px rgba(229, 62, 62, 0.6)"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Box>
              </PopoverTrigger>
              <PopoverContent
                bg={surfaceBg}
                borderColor={borderColor}
                boxShadow="2xl"
                w={{ base: '320px', md: '380px' }}
                borderRadius="xl"
              >
                <PopoverHeader
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  py={3}
                  px={4}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <HStack spacing={2}>
                    <Text fontWeight="600" fontSize="sm" color={textColor}>
                      Operational Alerts
                    </Text>
                    {unreadCount > 0 && (
                      <Badge bg={goldAccent} color="black" fontSize="10px" borderRadius="full">
                        {unreadCount} new
                      </Badge>
                    )}
                  </HStack>
                  {unreadCount > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color={goldAccent}
                      leftIcon={<FiCheck />}
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </PopoverHeader>
                <PopoverBody p={0} maxH="350px" overflowY="auto">
                  {loadingNotifications ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="sm" color={goldAccent} />
                    </Flex>
                  ) : notifications.length === 0 ? (
                    <Box py={8} textAlign="center" color={mutedColor} fontSize="sm">
                      <Icon as={FiCheckCircle} boxSize={8} color={goldAccent} mb={2} />
                      <Text>All operational alerts cleared.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={0} align="stretch" divider={<Divider borderColor={borderColor} />}>
                      {notifications.map((n) => (
                        <Box
                          key={n._id}
                          p={3.5}
                          bg={n.isRead ? 'transparent' : unreadNotificationBg}
                          cursor="pointer"
                          _hover={{ bg: cardBg }}
                          onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                          transition="all 0.15s ease"
                        >
                          <Flex justify="space-between" align="flex-start" mb={1}>
                            <Text
                              fontSize="xs"
                              fontWeight={n.isRead ? '500' : '700'}
                              color={n.isRead ? textColor : goldAccent}
                            >
                              {n.title}
                            </Text>
                            <HStack spacing={1} color={mutedColor} fontSize="10px">
                              <FiClock />
                              <Text>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </HStack>
                          </Flex>
                          <Text fontSize="11px" color={mutedColor} lineHeight="1.4">
                            {n.message}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </PopoverBody>
                <PopoverFooter
                  borderTop="1px solid"
                  borderColor={borderColor}
                  py={2}
                  textAlign="center"
                >
                  <Button
                    as={RouterLink}
                    to="/admin/notifications"
                    size="xs"
                    variant="link"
                    color={goldAccent}
                  >
                    View All Notifications
                  </Button>
                </PopoverFooter>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                p={1}
                borderRadius="full"
                _hover={{ bg: cardBg }}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={user?.name || 'Admin'}
                    src={user?.avatar}
                    bg={goldAccent}
                    color="black"
                  />
                </HStack>
              </MenuButton>
              <MenuList
                bg={surfaceBg}
                borderColor={borderColor}
                boxShadow="2xl"
                py={2}
                minW="200px"
              >
                <Box px={4} py={2}>
                  <Text fontSize="xs" fontWeight="700" color={textColor} isTruncated>
                    {user?.name}
                  </Text>
                  <Text fontSize="11px" color={mutedColor} isTruncated>
                    {user?.email}
                  </Text>
                  <Badge
                    mt={1.5}
                    bg={goldAccent}
                    color="black"
                    fontSize="9px"
                    fontWeight="bold"
                    borderRadius="sm"
                  >
                    {user?.role}
                  </Badge>
                </Box>
                <MenuDivider borderColor={borderColor} />
                <MenuItem
                  as={RouterLink}
                  to="/admin/settings"
                  icon={<FiSettings />}
                  bg="transparent"
                  _hover={{ bg: cardBg, color: goldAccent }}
                  fontSize="13px"
                >
                  Restaurant Settings
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/"
                  icon={<FiExternalLink />}
                  bg="transparent"
                  _hover={{ bg: cardBg, color: goldAccent }}
                  fontSize="13px"
                >
                  Storefront View
                </MenuItem>
                <MenuDivider borderColor={borderColor} />
                <MenuItem
                  icon={<FiLogOut />}
                  bg="transparent"
                  color="red.400"
                  _hover={{ bg: cardBg }}
                  fontSize="13px"
                  onClick={handleLogout}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Page Content Viewport */}
        <Box
          as="main"
          flex={1}
          p={{ base: 4, md: 8 }}
          overflowY="auto"
          maxW="1600px"
          w="100%"
          mx="auto"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

