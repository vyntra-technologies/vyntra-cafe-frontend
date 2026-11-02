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
  FiShoppingBag,
  FiCoffee,
  FiDollarSign,
  FiShield,
  FiMenu,
  FiList,
  FiCheckCircle,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface ChefLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTicketCount?: number;
  completedTicketCount?: number;
}

export const ChefLayout: React.FC<ChefLayoutProps> = ({
  children,
  activeTab = 'active',
  onTabChange,
  onRefresh,
  isRefreshing = false,
  activeTicketCount = 0,
  completedTicketCount = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

  // Sound alert state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

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
    navigate('/chef/login');
  };

  // Color Tokens - High Contrast KDS Palette
  const bg = useColorModeValue('#FAF9F6', '#08080A');
  const sidebarBg = useColorModeValue('#FFFFFF', '#111114');
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.94)', 'rgba(17, 17, 20, 0.94)');
  const borderCol = useColorModeValue('rgba(221, 107, 32, 0.2)', 'rgba(237, 137, 54, 0.2)');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const orangeAccent = useColorModeValue('#DD6B20', '#ED8936');
  const activeBg = useColorModeValue('rgba(221, 107, 32, 0.12)', 'rgba(237, 137, 54, 0.12)');

  const userRole = user?.role || 'Chef';
  const isManagement = ['Owner', 'Admin', 'Manager', 'SUPER_ADMIN', 'MANAGER'].includes(userRole);

  const navItems = [
    { id: 'active', label: 'Live KDS Tickets', icon: FaFire, count: activeTicketCount, badgeColor: 'orange' },
    { id: 'history', label: 'Served / Completed', icon: FiCheckCircle, count: completedTicketCount, badgeColor: 'green' },
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
            bg="linear-gradient(135deg, #ED8936 0%, #C05621 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 2px 10px rgba(237, 137, 54, 0.35)"
          >
            <Icon as={FaFire} boxSize={5} color="white" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontFamily="heading" fontWeight="bold" fontSize="md" letterSpacing="0.05em" color={textCol}>
              VYNTRA CAFE
            </Text>
            <Badge
              colorScheme="orange"
              variant="subtle"
              fontSize="9px"
              px={1.5}
              py={0.2}
              borderRadius="sm"
              letterSpacing="0.08em"
            >
              CHEF / KDS TERMINAL
            </Badge>
          </VStack>
        </HStack>

        <Divider borderColor={borderCol} />

        {/* Live Metrics Quick View */}
        <Box
          p={3}
          borderRadius="xl"
          bg={useColorModeValue('orange.50', 'whiteAlpha.50')}
          border="1px solid"
          borderColor={borderCol}
        >
          <HStack justify="space-between" mb={1}>
            <Text fontSize="xs" fontWeight="bold" color={mutedCol} textTransform="uppercase">
              Queue Load
            </Text>
            <Badge colorScheme={activeTicketCount > 5 ? 'red' : 'green'} fontSize="xs" px={2} borderRadius="full">
              {activeTicketCount > 5 ? 'High Volume' : 'Normal'}
            </Badge>
          </HStack>
          <Text fontSize="2xl" fontWeight="black" color={orangeAccent}>
            {activeTicketCount}{' '}
            <Text as="span" fontSize="xs" fontWeight="normal" color={mutedCol}>
              active tickets
            </Text>
          </Text>
        </Box>

        {/* Main Navigation */}
        <VStack align="stretch" spacing={1.5}>
          <Text fontSize="11px" fontWeight="bold" color={mutedCol} textTransform="uppercase" letterSpacing="0.08em" px={3} mb={1}>
            Kitchen Stations
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
                color={isActive ? orangeAccent : textCol}
                fontWeight={isActive ? 'bold' : 'medium'}
                border="1px solid"
                borderColor={isActive ? borderCol : 'transparent'}
                _hover={{ bg: activeBg, color: orangeAccent }}
                onClick={() => handleNavClick(item.id)}
                leftIcon={<Icon as={item.icon} boxSize={4} />}
              >
                <HStack justify="space-between" w="full" ml={1}>
                  <Text fontSize="sm">{item.label}</Text>
                  {item.count !== null && item.count > 0 && (
                    <Badge
                      colorScheme={item.badgeColor || 'orange'}
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

        {/* Cross-Terminal Switcher */}
        <VStack align="stretch" spacing={1.5} pt={2}>
          <Text fontSize="11px" fontWeight="bold" color={mutedCol} textTransform="uppercase" letterSpacing="0.08em" px={3} mb={1}>
            Operational Terminals
          </Text>
          <Button
            as={RouterLink}
            to="/waiter/dashboard"
            variant="ghost"
            justifyContent="flex-start"
            size="sm"
            leftIcon={<FiCoffee />}
            color={mutedCol}
            _hover={{ color: textCol, bg: 'whiteAlpha.100' }}
          >
            Floor Waiter Terminal
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
              color="yellow.500"
              _hover={{ color: 'yellow.400', bg: 'whiteAlpha.100' }}
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
            name={user?.name || 'Chef'}
            src={user?.avatar}
            bg={orangeAccent}
            color="white"
            fontWeight="bold"
          />
          <VStack align="start" spacing={0} flex={1} overflow="hidden">
            <Text fontSize="sm" fontWeight="bold" color={textCol} isTruncated>
              {user?.name || 'Kitchen Staff'}
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
                    Kitchen Display System (KDS)
                  </Text>
                  <Badge colorScheme="orange" variant="subtle" fontSize="10px" px={2} borderRadius="md">
                    LIVE TICKETS
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={mutedCol} display={{ base: 'none', sm: 'block' }}>
                  Real-time preparation pipeline and order progress tracker
                </Text>
              </VStack>
            </HStack>

            {/* Right Tools: Audio Mute, Clock, Refresh, Theme, User Menu */}
            <HStack spacing={{ base: 2, md: 3 }}>
              {/* Sound Alert Toggle */}
              <Tooltip label={soundEnabled ? 'Chime sound on order active' : 'Sound alerts muted'}>
                <IconButton
                  aria-label="Toggle Sound"
                  icon={soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
                  size="sm"
                  variant="ghost"
                  colorScheme={soundEnabled ? 'orange' : 'gray'}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                />
              </Tooltip>

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
                <Icon as={FiClock} color={orangeAccent} boxSize={3.5} />
                <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.05em">
                  {time}
                </Text>
              </HStack>

              {/* Refresh Button */}
              {onRefresh && (
                <Tooltip label="Sync Kitchen Queue">
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
                      name={user?.name || 'Chef'}
                      src={user?.avatar}
                      bg={orangeAccent}
                      color="white"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                />
                <MenuList bg={sidebarBg} borderColor={borderCol} boxShadow="xl" py={2} zIndex={20}>
                  <Box px={4} py={2}>
                    <Text fontWeight="bold" fontSize="sm" color={textCol}>
                      {user?.name || 'Head Chef'}
                    </Text>
                    <Text fontSize="xs" color={mutedCol}>
                      {user?.email}
                    </Text>
                    <Badge colorScheme="orange" fontSize="10px" mt={1}>
                      {userRole}
                    </Badge>
                  </Box>
                  <MenuDivider borderColor={borderCol} />
                  <MenuItem
                    as={RouterLink}
                    to="/waiter/dashboard"
                    icon={<FiCoffee />}
                    bg="transparent"
                    _hover={{ bg: activeBg }}
                  >
                    Switch to Floor Service
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
