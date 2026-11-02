import React from 'react';
import { HStack, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import { FiMinus, FiPlus } from 'react-icons/fi';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const bg = useColorModeValue('#FFFFFF', '#171717');

  const btnSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
  const textPx = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  return (
    <HStack
      borderWidth="1px"
      borderColor={borderColor}
      bg={bg}
      borderRadius="xl"
      p={1}
      spacing={0}
      alignItems="center"
    >
      <IconButton
        aria-label="Decrease quantity"
        icon={<FiMinus />}
        size={btnSize}
        variant="ghost"
        borderRadius="lg"
        isDisabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <Text
        px={textPx}
        fontWeight="700"
        fontSize={size === 'sm' ? 'xs' : 'sm'}
        minW={size === 'sm' ? '24px' : '32px'}
        textAlign="center"
      >
        {value}
      </Text>
      <IconButton
        aria-label="Increase quantity"
        icon={<FiPlus />}
        size={btnSize}
        variant="ghost"
        borderRadius="lg"
        isDisabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </HStack>
  );
};

