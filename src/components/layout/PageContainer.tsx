import React from 'react';
import { Box, Container, ContainerProps } from '@chakra-ui/react';

interface PageContainerProps extends ContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, maxW = '7xl', ...props }) => {
  return (
    <Box minH="calc(100vh - 160px)" py={{ base: 6, md: 10 }}>
      <Container maxW={maxW} px={{ base: 4, sm: 6, md: 8 }} {...props}>
        {children}
      </Container>
    </Box>
  );
};

