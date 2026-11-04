import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Center, Spinner, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { hasRoleAccess, getRoleLoginPath } from '../utils/roleUtils';

interface RoleProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: readonly string[] | string[];
  loginPath?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  loginPath,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const bg = useColorModeValue('#FAF9F6', '#08080A');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');

  if (isLoading) {
    return (
      <Center minH="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color={goldAccent} thickness="3px" speed="0.8s" />
          <Text fontSize="sm" color={mutedColor} letterSpacing="0.05em">
            Verifying role authorizations...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If unauthenticated, redirect to appropriate role login
  if (!isAuthenticated || !user) {
    const targetLogin = loginPath || (allowedRoles.length > 0 ? getRoleLoginPath(allowedRoles[0]) : '/login');
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // Check role authorization
  const isAuthorized = hasRoleAccess(user.role, allowedRoles);

  if (!isAuthorized) {
    // Redirect to unauthorized 403 page with context
    return (
      <Navigate
        to="/unauthorized"
        state={{
          from: location,
          attemptedPath: location.pathname,
          userRole: user.role,
        }}
        replace
      />
    );
  }

  return children;
};

