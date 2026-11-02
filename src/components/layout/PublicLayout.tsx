import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const color = useColorModeValue('#1C1C1C', '#FFFFFF');

  return (
    <Box minH="100vh" bg={bg} color={color} display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" flex="1">
        {children || <Outlet />}
      </Box>
      <Footer />
    </Box>
  );
};

