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
} from '@chakra-ui/react';
import {
  FiClock,
  FiLogOut,
  FiUser,
  FiRefreshCw,
  FiGrid,
  FiCoffee,
  FiShoppingBag,
  FiDollarSign,
  FiHome,
  FiShield,
} from 'react-icons/fi';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface StaffLayoutProps {
  children: React.ReactNode;
  terminalName: string;
  terminalBadge: string;
  badgeColor?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({
  children,
  terminalName,
  terminalBadge,
  badgeColor = 'gold',
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Live time ticker
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
    navigate('/staff/login');
  };

  // Color tokens
  const bg = useColorModeValue('#F4F3EF', '#0A0A0C');
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(16, 16, 20, 0.95)');
  const borderCol = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)');
  const textCol = useColorModeValue('#111114', '#F4F4F6');
  const mutedCol = useColorModeValue('#6B7280', '#9CA3AF');
  const gold = useColorModeValue('#A87916', '#D4AF37');

  const userRole = user?.role || 'Staff';
  const isManagement = ['Owner', 'Admin', 'Manager', 'SUPER_ADMIN', 'MANAGER'].includes(userRole);

  return (
    <Box minH="100vh" bg={bg} color={textCol} display="flex" flexDirection="column">
      {/* Top Staff Navigation Header */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={100}
        bg={navBg}
        backdropFilter="blur(16px)"
        borderBottom="1px solid"
        borderColor={borderCol}
        px={{ base: 3, md: 6 }}
        py={3}
      >
        <Flex align="center" justify="space-between">
          {/* Left: Brand & Terminal Title */}
          <HStack spacing={3}>
            <HStack as={RouterLink} to="/" spacing={2} cursor="pointer" textDecoration="none">
              <Box
                w={8}
                h={8}
                borderRadius="lg"
                bg="linear-gradient(135deg, #D4AF37 0%, #A87916 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 10px rgba(212, 175, 55, 0.3)"
              >
                <Text fontWeight="black" fontSize="xs" color="black">
                  VC
                </Text>
              </Box>
              <VStack align="start" spacing={0} display={{ base: 'none', sm: 'flex' }}>
                <Text
                  fontFamily="heading"
                  fontWeight="bold"
                  fontSize="sm"
                  letterSpacing="0.08em"
                  color={textCol}
                >
                  VYNTRA CAFE
                </Text>
                <Text fontSize="10px" color={mutedCol} textTransform="uppercase" letterSpacing="0.1em">
                  Staff Operations
                </Text>
              </VStack>
            </HStack>

            <Box h={5} w="1px" bg={borderCol} mx={1} />

            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                {terminalName}
              </Text>
              <Badge
                colorScheme={badgeColor}
                variant="subtle"
                fontSize="10px"
                px={2}
                py={0.5}
                borderRadius="md"
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                {terminalBadge}
              </Badge>
            </HStack>
          </HStack>

          {/* Center: Multi-terminal Navigation Switcher for quick access */}
          <HStack
            spacing={1}
            display={{ base: 'none', lg: 'flex' }}
            bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
            p={1}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderCol}
          >
            <Button
              as={RouterLink}
              to="/waiter/dashboard"
              size="xs"
              variant={location.pathname.startsWith('/waiter') ? 'solid' : 'ghost'}
              colorScheme={location.pathname.startsWith('/waiter') ? 'teal' : undefined}
              leftIcon={<FiCoffee />}
              borderRadius="lg"
            >
              Waiter
            </Button>
            <Button
              as={RouterLink}
              to="/chef/dashboard"
              size="xs"
              variant={location.pathname.startsWith('/chef') ? 'solid' : 'ghost'}
              colorScheme={location.pathname.startsWith('/chef') ? 'orange' : undefined}
              leftIcon={<FiShoppingBag />}
              borderRadius="lg"
            >
              Kitchen (KDS)
            </Button>
            <Button
              as={RouterLink}
              to="/cashier/dashboard"
              size="xs"
              variant={location.pathname.startsWith('/cashier') ? 'solid' : 'ghost'}
              colorScheme={location.pathname.startsWith('/cashier') ? 'green' : undefined}
              leftIcon={<FiDollarSign />}
              borderRadius="lg"
            >
              Cashier POS
            </Button>
            <Button
              as={RouterLink}
              to="/manager/dashboard"
              size="xs"
              variant={location.pathname.startsWith('/manager') ? 'solid' : 'ghost'}
              colorScheme={location.pathname.startsWith('/manager') ? 'yellow' : undefined}
              leftIcon={<FiShield />}
              borderRadius="lg"
            >
              Manager
            </Button>
          </HStack>

          {/* Right: Refresh, Clock, ThemeToggle, User Profile & Logout */}
          <HStack spacing={{ base: 2, md: 3 }}>
            {onRefresh && (
              <Tooltip label="Refresh Data">
                <IconButton
                  aria-label="Refresh"
                  icon={<FiRefreshCw className={isRefreshing ? 'spin' : ''} />}
                  size="sm"
                  variant="ghost"
                  isLoading={isRefreshing}
                  onClick={onRefresh}
                />
              </Tooltip>
            )}

            {/* Live Clock */}
            <HStack
              spacing={1.5}
              px={2.5}
              py={1}
              borderRadius="md"
              bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
              fontSize="xs"
              fontWeight="medium"
              display={{ base: 'none', md: 'flex' }}
            >
              <Icon as={FiClock} color={gold} />
              <Text fontFamily="mono">{time}</Text>
            </HStack>

            <ThemeToggle />

            {/* User Menu */}
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                variant="ghost"
                p={1}
                borderRadius="full"
                h="auto"
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                <HStack spacing={2}>
                  <Avatar size="sm" name={user?.name || 'Staff User'} bg={gold} color="black" />
                  <VStack align="start" spacing={0} display={{ base: 'none', xl: 'flex' }}>
                    <Text fontSize="xs" fontWeight="bold" lineHeight="short">
                      {user?.name || 'Staff'}
                    </Text>
                    <Text fontSize="10px" color={mutedCol} textTransform="capitalize">
                      {userRole}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>

              <MenuList
                bg={useColorModeValue('#FFFFFF', '#141418')}
                borderColor={borderCol}
                boxShadow="xl"
                zIndex={200}
                p={2}
              >
                <Box px={3} py={2}>
                  <Text fontWeight="bold" fontSize="sm">
                    {user?.name || 'Staff Member'}
                  </Text>
                  <Text fontSize="xs" color={mutedCol}>
                    {user?.email}
                  </Text>
                  <Badge colorScheme="purple" mt={1} fontSize="10px">
                    Role: {userRole}
                  </Badge>
                </Box>

                <MenuDivider />

                <MenuItem
                  as={RouterLink}
                  to="/waiter/dashboard"
                  icon={<FiCoffee />}
                  borderRadius="md"
                >
                  Waiter Terminal
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/chef/dashboard"
                  icon={<FiShoppingBag />}
                  borderRadius="md"
                >
                  Kitchen Display (KDS)
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/cashier/dashboard"
                  icon={<FiDollarSign />}
                  borderRadius="md"
                >
                  POS Billing Counter
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/manager/dashboard"
                  icon={<FiShield />}
                  borderRadius="md"
                >
                  Manager Operations
                </MenuItem>

                {isManagement && (
                  <MenuItem
                    as={RouterLink}
                    to="/admin/dashboard"
                    icon={<FiGrid />}
                    borderRadius="md"
                    color={gold}
                  >
                    Admin Dashboard
                  </MenuItem>
                )}

                <MenuItem
                  as={RouterLink}
                  to="/"
                  icon={<FiHome />}
                  borderRadius="md"
                >
                  Storefront Home
                </MenuItem>

                <MenuDivider />

                <MenuItem
                  onClick={handleLogout}
                  icon={<FiLogOut />}
                  color="red.400"
                  borderRadius="md"
                  _hover={{ bg: 'red.500', color: 'white' }}
                >
                  Log Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Main Terminal Viewport */}
      <Box flex="1" p={{ base: 3, md: 5 }}>
        {children}
      </Box>
    </Box>
  );
};

