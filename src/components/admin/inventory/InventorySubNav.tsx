import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import {
  FiGrid,
  FiBox,
  FiActivity,
  FiTruck,
  FiShoppingBag,
  FiAlertTriangle,
  FiTrash2,
  FiBarChart2,
} from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface InventorySubNavProps {
  lowStockCount?: number;
}

export const InventorySubNav: React.FC<InventorySubNavProps> = ({ lowStockCount = 0 }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverInactiveBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const navItems = [
    { label: 'Overview', path: '/admin/inventory', icon: FiGrid, exact: true },
    { label: 'Ingredients', path: '/admin/inventory/ingredients', icon: FiBox },
    { label: 'Stock Ops & History', path: '/admin/inventory/stock', icon: FiActivity },
    { label: 'Suppliers', path: '/admin/inventory/suppliers', icon: FiTruck },
    { label: 'Purchase Orders', path: '/admin/inventory/purchases', icon: FiShoppingBag },
    {
      label: 'Stock Alerts',
      path: '/admin/inventory/alerts',
      icon: FiAlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'red',
    },
    { label: 'Waste & Spoilage', path: '/admin/inventory/waste', icon: FiTrash2 },
    { label: 'Valuation & Reports', path: '/admin/inventory/reports', icon: FiBarChart2 },
  ];

  return (
    <Box
      bg={bg}
      px={4}
      py={2.5}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      mb={6}
      boxShadow="sm"
      overflowX="auto"
      css={{
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
      }}
    >
      <Flex minW="max-content" gap={1.5} align="center">
        {navItems.map((item) => {
          const isActive = item.exact
            ? currentPath === item.path
            : currentPath.startsWith(item.path);

          return (
            <Button
              key={item.path}
              as={RouterLink}
              to={item.path}
              size="sm"
              variant="ghost"
              leftIcon={<item.icon />}
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : inactiveColor}
              fontWeight={isActive ? '600' : '500'}
              borderRadius="lg"
              _hover={{
                bg: isActive ? activeBg : hoverInactiveBg,
              }}
              px={3.5}
              py={1.5}
            >
              {item.label}
              {item.badge !== undefined && (
                <Badge
                  ml={2}
                  colorScheme={item.badgeColor || 'red'}
                  variant="solid"
                  borderRadius="full"
                  fontSize="xs"
                  px={1.5}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
};

