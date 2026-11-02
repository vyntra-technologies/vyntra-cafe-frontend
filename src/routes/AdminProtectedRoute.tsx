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
import { FiHome, FiLock, FiLogOut } from 'react-icons/fi';

const ADMIN_MANAGEMENT_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
];

export const AdminProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
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
            Verifying management session...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If unauthenticated, redirect to dedicated admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || 'Customer';
  const isAuthorized = ADMIN_MANAGEMENT_ROLES.includes(userRole);

  // If authenticated but unauthorized (Customer or non-management role)
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
            Administrator Privileges Required
          </Heading>

          <Text fontSize="sm" color={mutedColor} mb={6} lineHeight="tall">
            The Vyntra Cafe Operations Portal is restricted to verified Managers and System Administrators. Your account (<Text as="span" fontWeight="bold" color={goldAccent}>{user?.email}</Text>) has the role <Text as="span" fontWeight="bold" textTransform="uppercase">{userRole}</Text>.
          </Text>

          <HStack spacing={4} justify="center">
            <Button
              as={RouterLink}
              to="/"
              leftIcon={<FiHome />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
              size="md"
            >
              Return to Storefront
            </Button>
            <Button
              as={RouterLink}
              to="/admin/login"
              leftIcon={<FiLogOut />}
              bg={goldAccent}
              color="black"
              fontWeight="600"
              _hover={{ opacity: 0.9 }}
              size="md"
              onClick={() => logout()}
            >
              Switch Account
            </Button>
          </HStack>
        </Box>
      </Center>
    );
  }

  return children;
};

// Export alias for consistency
export const AdminAuthGuard = AdminProtectedRoute;
