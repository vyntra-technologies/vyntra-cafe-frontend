import React from 'react';
import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '☕',
  actionText,
  actionLink,
  onAction,
}) => {
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  return (
    <Box
      py={16}
      px={8}
      textAlign="center"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      maxW="xl"
      mx="auto"
      my={8}
    >
      <VStack spacing={4}>
        <Text fontSize="5xl">{icon}</Text>
        <Heading size="md" fontWeight="700">
          {title}
        </Heading>
        <Text fontSize="sm" color={textColor} maxW="md">
          {description}
        </Text>
        {actionText && (
          <Box pt={2}>
            {actionLink ? (
              <Button
                as={RouterLink}
                to={actionLink}
                bg={accentColor}
                color={btnTextColor}
                _hover={{ opacity: 0.9 }}
                borderRadius="xl"
              >
                {actionText}
              </Button>
            ) : (
              <Button
                onClick={onAction}
                bg={accentColor}
                color={btnTextColor}
                _hover={{ opacity: 0.9 }}
                borderRadius="xl"
              >
                {actionText}
              </Button>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

