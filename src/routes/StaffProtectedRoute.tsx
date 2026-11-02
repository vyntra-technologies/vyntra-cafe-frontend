import React from 'react';
import { Navigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Center,
  Spinner,
  VStack,
  Text,
  Box,
  Heading,
  Button,
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiHome, FiLock, FiLogOut, FiBriefcase } from 'react-icons/fi';

export const ALL_STAFF_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
  'Service Staff',
  'WAITER',
  'Kitchen Staff',
  'CHEF',
  'Cashier',
  'CASHIER',
  'Inventory Manager',
];

export const WAITER_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
  'Service Staff',
  'WAITER',
];

export const KITCHEN_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
  'Kitchen Staff',
  'CHEF',
];

export const CASHIER_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
  'Cashier',
  'CASHIER',
];

export const MANAGEMENT_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
];

interface StaffProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export const StaffProtectedRoute: React.FC<StaffProtectedRouteProps> = ({
  children,
  allowedRoles = ALL_STAFF_ROLES,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  const bg = useColorModeValue('#FAF9F6', '#0B0B0D');
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.2)', 'rgba(212, 175, 55, 0.2)');

  if (isLoading) {
    return (
      <Center minH="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color={goldAccent} thickness="3px" />
          <Text fontSize="sm" color={mutedColor} letterSpacing="0.05em">
            Verifying staff credentials...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If unauthenticated, redirect to dedicated staff login
  if (!isAuthenticated) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || 'Customer';
  const isAuthorized = allowedRoles.includes(userRole);

  // If authenticated but unauthorized for this specific staff terminal
  if (!isAuthorized) {
    return (
      <Center minH="100vh" bg={bg} px={4}>
        <Box
          bg={cardBg}
          p={{ base: 8, md: 10 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          maxW="520px"
          textAlign="center"
          boxShadow="2xl"
        >
          <Center
            w={16}
            h={16}
            borderRadius="full"
            bg="red.500"
            color="white"
            mx="auto"
            mb={6}
            boxShadow="0 0 20px rgba(229, 62, 62, 0.4)"
          >
            <Icon as={FiLock} boxSize={8} />
          </Center>

          <Heading
            fontSize="2xl"
            fontFamily="heading"
            color={textColor}
            mb={2}
            letterSpacing="-0.02em"
          >
            Terminal Access Restricted
          </Heading>

          <Text fontSize="sm" color={mutedColor} mb={6} lineHeight="tall">
            This operational terminal is restricted to authorized staff roles.
            Your account (<Text as="span" fontWeight="bold" color={goldAccent}>{user?.email}</Text>) is currently assigned as <Text as="span" fontWeight="bold" textTransform="uppercase">{userRole}</Text>.
          </Text>

          <VStack spacing={3}>
            <Button
              as={RouterLink}
              to="/staff/login"
              w="full"
              bg={goldAccent}
              color="black"
              _hover={{ opacity: 0.9 }}
              leftIcon={<FiBriefcase />}
            >
              Switch Staff Account
            </Button>
            <HStack w="full" spacing={3}>
              <Button
                as={RouterLink}
                to="/"
                variant="outline"
                borderColor={borderColor}
                color={textColor}
                w="50%"
                leftIcon={<FiHome />}
              >
                Storefront
              </Button>
              <Button
                onClick={() => logout()}
                variant="ghost"
                color="red.400"
                _hover={{ bg: 'whiteAlpha.100' }}
                w="50%"
                leftIcon={<FiLogOut />}
              >
                Sign Out
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Center>
    );
  }

  return children;
};

