import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';

export const NotFoundPage: React.FC = () => {
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  return (
    <PageContainer>
      <VStack spacing={6} py={20} textAlign="center">
        <Text fontSize="7xl" lineHeight="1">☕</Text>
        <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          404 — Page Spilled
        </Heading>
        <Text fontSize="md" color={textColor} maxW="md">
          Looks like the table or page you are looking for has been cleared or doesn't exist.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          bg={accentColor}
          color={btnTextColor}
          _hover={{ opacity: 0.9 }}
          size="lg"
          borderRadius="2xl"
          px={8}
        >
          Return Home
        </Button>
      </VStack>
    </PageContainer>
  );
};
