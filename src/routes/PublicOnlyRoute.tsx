import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Center, Spinner, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { getRoleDashboardPath } from '../utils/roleUtils';

interface PublicOnlyRouteProps {
  children: React.ReactElement;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const bg = useColorModeValue('#FAF9F6', '#08080A');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');

  if (isLoading) {
    return (
      <Center minH="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color={goldAccent} thickness="3px" speed="0.8s" />
          <Text fontSize="sm" color={mutedColor} letterSpacing="0.05em">
            Loading session...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If already authenticated, redirect to appropriate role dashboard
  if (isAuthenticated && user) {
    const destination = getRoleDashboardPath(user.role);
    return <Navigate to={destination} replace />;
  }

  return children;
};

