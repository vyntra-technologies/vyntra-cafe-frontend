import React, { useState, useEffect } from 'react';
import {
  Flex,
  HStack,
  Box,
  Text,
  Badge,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiRefreshCw,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiClock,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { STAFF_COLORS } from './StaffTheme';

export interface StaffHeaderProps {
  role: 'waiter' | 'chef' | 'cashier';
  pageTitle: string;
  breadcrumb?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onMobileMenuOpen: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  unreadNotifications?: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  role,
  pageTitle,
  breadcrumb,
  onRefresh,
  isRefreshing = false,
  onMobileMenuOpen,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
  unreadNotifications = 0,
  audioEnabled,
  onToggleAudio,
}) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeLabel = () => {
    switch (role) {
      case 'waiter':
        return 'WAITER';
      case 'chef':
        return 'HEAD CHEF';
      case 'cashier':
        return 'CASHIER';
      default:
        return 'STAFF';
    }
  };

  return (
    <Flex
      h="64px"
      bg={STAFF_COLORS.sidebar}
      borderBottomWidth="1px"
      borderColor={STAFF_COLORS.border}
      align="center"
      justify="space-between"
      px={{ base: 4, md: 6 }}
      position="sticky"
      top="0"
      zIndex="10"
      boxShadow="0 4px 20px rgba(0,0,0,0.25)"
    >
      {/* Left: Mobile Drawer Trigger & Titles */}
      <HStack spacing={{ base: 3, md: 4 }}>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Open sidebar menu"
          icon={<FiMenu />}
          size="sm"
          variant="outline"
          borderColor={STAFF_COLORS.border}
          color={STAFF_COLORS.text}
          onClick={onMobileMenuOpen}
          _hover={{ borderColor: STAFF_COLORS.primaryGold }}
        />

        <Box>
          {breadcrumb && (
            <Text
              fontSize="10px"
              color={STAFF_COLORS.secondaryText}
              textTransform="uppercase"
              letterSpacing="wider"
              display={{ base: 'none', sm: 'block' }}
            >
              {breadcrumb}
            </Text>
          )}
          <HStack spacing={2.5}>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="800"
              color={STAFF_COLORS.text}
              fontFamily="heading"
              letterSpacing="wide"
            >
              {pageTitle}
            </Text>
            <Badge
              display={{ base: 'none', sm: 'inline-flex' }}
              fontSize="9px"
              px={2}
              py={0.5}
              borderRadius="full"
              bg={STAFF_COLORS.goldSubtle}
              color={STAFF_COLORS.primaryGold}
              borderWidth="1px"
              borderColor={STAFF_COLORS.borderGold}
            >
              {getRoleBadgeLabel()}
            </Badge>
          </HStack>
        </Box>
      </HStack>

      {/* Right: Operational Controls, Clock, Alerts & Profile */}
      <HStack spacing={{ base: 2, md: 3 }}>
        {/* Live Socket Feed Indicator */}
        <HStack
          spacing={1.5}
          display={{ base: 'none', lg: 'flex' }}
          px={2.5}
          py={1}
          borderRadius="full"
          bg="rgba(34, 197, 94, 0.1)"
          borderWidth="1px"
          borderColor="rgba(34, 197, 94, 0.3)"
        >
          <Box w={2} h={2} borderRadius="full" bg={STAFF_COLORS.success} />
          <Text fontSize="10px" fontWeight="700" color={STAFF_COLORS.success} letterSpacing="wider">
            LIVE SYNC
          </Text>
        </HStack>

        {/* Live Clock */}
        <HStack
          spacing={1.5}
          display={{ base: 'none', md: 'flex' }}
          px={3}
          py={1}
          borderRadius="xl"
          bg={STAFF_COLORS.card}
          borderWidth="1px"
          borderColor={STAFF_COLORS.border}
          fontSize="xs"
          fontFamily="mono"
          color={STAFF_COLORS.text}
        >
          <Icon as={FiClock} color={STAFF_COLORS.primaryGold} />
          <Text fontWeight="600">{time}</Text>
        </HStack>

        {/* Audio Alert Toggle (If supported) */}
        {onToggleAudio && (
          <Tooltip label={audioEnabled ? 'Mute alert chimes' : 'Enable alert chimes'} hasArrow>
            <IconButton
              size="sm"
              variant="outline"
              borderColor={STAFF_COLORS.border}
              aria-label="Toggle audio alerts"
              icon={audioEnabled ? <FiVolume2 /> : <FiVolumeX />}
              color={audioEnabled ? STAFF_COLORS.primaryGold : STAFF_COLORS.mutedText}
              onClick={onToggleAudio}
              _hover={{ borderColor: STAFF_COLORS.primaryGold }}
            />
          </Tooltip>
        )}

        {/* Manual Refresh Button */}
        {onRefresh && (
          <Tooltip label="Refresh active records" hasArrow>
            <IconButton
              size="sm"
              variant="outline"
              borderColor={STAFF_COLORS.border}
              aria-label="Refresh view"
              icon={<FiRefreshCw className={isRefreshing ? 'spin-fast' : ''} />}
              color={STAFF_COLORS.text}
              onClick={onRefresh}
              isLoading={isRefreshing}
              _hover={{ borderColor: STAFF_COLORS.primaryGold }}
            />
          </Tooltip>
        )}

        {/* Notifications Icon Button */}
        {onOpenNotifications && (
          <Tooltip label="View notifications" hasArrow>
            <Box position="relative">
              <IconButton
                size="sm"
                variant="outline"
                borderColor={STAFF_COLORS.border}
                aria-label="View notifications"
                icon={<FiBell />}
                color={STAFF_COLORS.text}
                onClick={onOpenNotifications}
                _hover={{ borderColor: STAFF_COLORS.primaryGold }}
              />
              {unreadNotifications > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="9px"
                  px={1.5}
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Box>
          </Tooltip>
        )}

        {/* User Profile Menu Dropdown */}
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            p={1}
            borderRadius="full"
            _hover={{ bg: STAFF_COLORS.card }}
          >
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={user?.name || getRoleBadgeLabel()}
                bg={STAFF_COLORS.primaryGold}
                color="#0B0B0D"
                borderWidth="1.5px"
                borderColor={STAFF_COLORS.borderGold}
              />
              <Box textAlign="left" display={{ base: 'none', xl: 'block' }}>
                <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.text} lineHeight="1.1">
                  {user?.name || 'Staff User'}
                </Text>
                <Text fontSize="10px" color={STAFF_COLORS.secondaryText} textTransform="capitalize">
                  {role}
                </Text>
              </Box>
            </HStack>
          </MenuButton>

          <MenuList
            bg={STAFF_COLORS.sidebar}
            borderColor={STAFF_COLORS.border}
            borderWidth="1px"
            borderRadius="xl"
            p={2}
            boxShadow="0 8px 30px rgba(0,0,0,0.5)"
          >
            <Box px={3} py={2}>
              <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.text}>
                {user?.name || 'Staff User'}
              </Text>
              <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>
                {user?.email || 'staff@vyntracafe.com'}
              </Text>
            </Box>
            <MenuDivider borderColor={STAFF_COLORS.border} />
            {onOpenProfile && (
              <MenuItem
                icon={<FiUser />}
                bg="transparent"
                fontSize="xs"
                color={STAFF_COLORS.text}
                _hover={{ bg: STAFF_COLORS.card, color: STAFF_COLORS.primaryGold }}
                borderRadius="lg"
                onClick={onOpenProfile}
              >
                My Profile
              </MenuItem>
            )}
            {onOpenSettings && (
              <MenuItem
                icon={<FiSettings />}
                bg="transparent"
                fontSize="xs"
                color={STAFF_COLORS.text}
                _hover={{ bg: STAFF_COLORS.card, color: STAFF_COLORS.primaryGold }}
                borderRadius="lg"
                onClick={onOpenSettings}
              >
                Station Settings
              </MenuItem>
            )}
            <MenuDivider borderColor={STAFF_COLORS.border} />
            <MenuItem
              icon={<FiLogOut />}
              bg="transparent"
              fontSize="xs"
              color={STAFF_COLORS.danger}
              _hover={{ bg: STAFF_COLORS.dangerSubtle, color: STAFF_COLORS.danger }}
              borderRadius="lg"
              onClick={logout}
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

