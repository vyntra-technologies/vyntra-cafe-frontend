import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const color = useColorModeValue('#1C1C1C', '#FFFFFF');

  return (
    <Box minH="100vh" bg={bg} color={color}>
      <AppRoutes />
    </Box>
  );
};

export default App;
