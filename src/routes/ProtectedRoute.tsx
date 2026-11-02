import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading, setPendingAction } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text fontSize="sm" color="gray.500">
            Verifying your session...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    setPendingAction({
      type: 'checkout',
      redirectTo: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
