import React from 'react';
import { IconButton, useColorMode, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

export const ThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const iconColor = useColorModeValue('#B68A3A', '#D4A853');
  const borderColor = useColorModeValue('rgba(182, 138, 58, 0.3)', 'rgba(212, 168, 83, 0.3)');
  const hoverBg = useColorModeValue('rgba(182, 138, 58, 0.1)', 'rgba(212, 168, 83, 0.12)');

  return (
    <Tooltip label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'} placement="bottom">
      <IconButton
        aria-label="Toggle Theme"
        icon={isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
        onClick={toggleColorMode}
        variant="outline"
        size="sm"
        h="40px"
        w="40px"
        borderRadius="full"
        color={iconColor}
        borderColor={borderColor}
        _hover={{
          bg: hoverBg,
          transform: 'rotate(20deg) scale(1.08)',
          borderColor: isDark ? '#D4A853' : '#B68A3A',
          boxShadow: isDark ? '0 0 15px rgba(212, 168, 83, 0.3)' : '0 0 15px rgba(182, 138, 58, 0.25)',
        }}
        transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      />
    </Tooltip>
  );
};
