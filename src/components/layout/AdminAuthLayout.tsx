import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

interface AdminAuthLayoutProps {
  children?: React.ReactNode;
}

export const AdminAuthLayout: React.FC<AdminAuthLayoutProps> = ({ children }) => {
  const bg = useColorModeValue('#FAF9F6', '#0B0B0D');
  const color = useColorModeValue('#171717', '#FFFFFF');

  return (
    <Box minH="100vh" bg={bg} color={color} position="relative" overflowX="hidden">
      {children || <Outlet />}
    </Box>
  );
};

