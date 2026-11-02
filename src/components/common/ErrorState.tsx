import React from 'react';
import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while connecting to the cafe servers. Please try again.',
  onRetry,
}) => {
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  return (
    <Box
      py={14}
      px={8}
      textAlign="center"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      maxW="lg"
      mx="auto"
      my={8}
    >
      <VStack spacing={4}>
        <Box color="red.400" fontSize="4xl">
          <FiAlertCircle />
        </Box>
        <Heading size="md" fontWeight="700">
          {title}
        </Heading>
        <Text fontSize="sm" color={textColor} maxW="sm">
          {message}
        </Text>
        {onRetry && (
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={onRetry}
            borderColor={accentColor}
            color={accentColor}
            variant="outline"
            borderRadius="xl"
            _hover={{ bg: useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)') }}
            mt={2}
          >
            Retry Connection
          </Button>
        )}
      </VStack>
    </Box>
  );
};

