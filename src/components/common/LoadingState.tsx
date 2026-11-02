import React from 'react';
import { Box, SimpleGrid, Skeleton, SkeletonText, Stack, useColorModeValue } from '@chakra-ui/react';

interface LoadingStateProps {
  type?: 'cards' | 'list' | 'detail';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type = 'cards', count = 6 }) => {
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');

  if (type === 'cards') {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6} py={6}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            overflow="hidden"
            p={4}
          >
            <Skeleton height="180px" borderRadius="xl" mb={4} />
            <Skeleton height="20px" width="70%" mb={2} />
            <SkeletonText noOfLines={2} spacing="2" mb={4} />
            <Stack direction="row" justify="space-between" align="center">
              <Skeleton height="24px" width="30%" />
              <Skeleton height="36px" width="40%" borderRadius="xl" />
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  if (type === 'list') {
    return (
      <Stack spacing={4} py={6}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={5}
          >
            <Skeleton height="24px" width="40%" mb={3} />
            <SkeletonText noOfLines={2} spacing="2" />
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Box py={8}>
      <Skeleton height="350px" borderRadius="2xl" mb={6} />
      <Skeleton height="32px" width="50%" mb={4} />
      <SkeletonText noOfLines={4} spacing="3" mb={6} />
      <Skeleton height="48px" width="200px" borderRadius="xl" />
    </Box>
  );
};

