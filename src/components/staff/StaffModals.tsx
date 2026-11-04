import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Box,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Icon,
  Select,
} from '@chakra-ui/react';
import {
  FiUser,
  FiBell,
  FiSettings,
  FiVolume2,
  FiVolumeX,
  FiClock,
  FiShield,
  FiLogOut,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { STAFF_COLORS } from './StaffTheme';

// 1. StaffNotificationsModal
export interface StaffNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type?: 'order' | 'kitchen' | 'billing';
  }>;
}

export const StaffNotificationsModal: React.FC<StaffNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
}) => {
  const [items, setItems] = useState(notifications);

  const clearAll = () => {
    setItems([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg={STAFF_COLORS.sidebar}
        borderColor={STAFF_COLORS.border}
        borderWidth="1px"
        borderRadius="2xl"
        color={STAFF_COLORS.text}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} py={4}>
          <HStack justify="space-between" pr={6}>
            <HStack spacing={2}>
              <Icon as={FiBell} color={STAFF_COLORS.primaryGold} />
              <Text fontSize="md">Notifications & Alerts</Text>
            </HStack>
            {items.length > 0 && (
              <Button size="xs" variant="ghost" color={STAFF_COLORS.secondaryText} onClick={clearAll}>
                Clear All
              </Button>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={STAFF_COLORS.secondaryText} />
        <ModalBody py={4} maxH="400px" overflowY="auto">
          {items.length === 0 ? (
            <Box py={8} textAlign="center">
              <Icon as={FiCheckCircle} color={STAFF_COLORS.success} boxSize={8} mb={2} />
              <Text fontSize="sm" fontWeight="600" color={STAFF_COLORS.text}>
                All Caught Up!
              </Text>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                No pending queue alerts or order notifications.
              </Text>
            </Box>
          ) : (
            <VStack spacing={2.5} align="stretch">
              {items.map((n) => (
                <Box
                  key={n.id}
                  p={3}
                  borderRadius="xl"
                  bg={STAFF_COLORS.card}
                  borderWidth="1px"
                  borderColor={STAFF_COLORS.border}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.text}>
                      {n.title}
                    </Text>
                    <Text fontSize="10px" color={STAFF_COLORS.mutedText}>
                      {n.time}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                    {n.message}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border}>
          <Button size="sm" variant="ghost" onClick={onClose} borderRadius="xl">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// 2. StaffProfileModal
export interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTitle: string;
  onLogout: () => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  roleTitle,
  onLogout,
}) => {
  const { user } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg={STAFF_COLORS.sidebar}
        borderColor={STAFF_COLORS.border}
        borderWidth="1px"
        borderRadius="2xl"
        color={STAFF_COLORS.text}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} py={4}>
          <HStack spacing={2}>
            <Icon as={FiUser} color={STAFF_COLORS.primaryGold} />
            <Text fontSize="md">Staff Profile</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={STAFF_COLORS.secondaryText} />
        <ModalBody py={5}>
          <VStack spacing={4} align="center" textAlign="center">
            <Avatar
              size="xl"
              name={user?.name || roleTitle}
              bg={STAFF_COLORS.primaryGold}
              color="#0B0B0D"
              borderWidth="2px"
              borderColor={STAFF_COLORS.borderGold}
            />

            <Box>
              <Text fontSize="lg" fontWeight="800" color={STAFF_COLORS.text}>
                {user?.name || 'Vyntra Staff'}
              </Text>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText} mt={0.5}>
                {user?.email || 'staff@vyntracafe.com'}
              </Text>
              <Badge
                mt={2}
                px={3}
                py={0.5}
                borderRadius="full"
                bg={STAFF_COLORS.goldSubtle}
                color={STAFF_COLORS.primaryGold}
                borderWidth="1px"
                borderColor={STAFF_COLORS.borderGold}
              >
                {user?.role?.toUpperCase() || roleTitle.toUpperCase()}
              </Badge>
            </Box>

            <Divider borderColor={STAFF_COLORS.border} />

            <VStack spacing={2} align="stretch" w="100%" fontSize="xs">
              <HStack justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Station Assignment</Text>
                <Text fontWeight="600" color={STAFF_COLORS.text}>{roleTitle} Console</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Session Status</Text>
                <HStack spacing={1}>
                  <Box w={2} h={2} borderRadius="full" bg={STAFF_COLORS.success} />
                  <Text color={STAFF_COLORS.success} fontWeight="700">Active Live</Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border}>
          <Button
            w="100%"
            colorScheme="red"
            variant="outline"
            size="sm"
            borderRadius="xl"
            leftIcon={<FiLogOut />}
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            End Shift & Log Out
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// 3. StaffSettingsModal
export interface StaffSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTitle: string;
}

export const StaffSettingsModal: React.FC<StaffSettingsModalProps> = ({
  isOpen,
  onClose,
  roleTitle,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState('15');
  const [compactView, setCompactView] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg={STAFF_COLORS.sidebar}
        borderColor={STAFF_COLORS.border}
        borderWidth="1px"
        borderRadius="2xl"
        color={STAFF_COLORS.text}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} py={4}>
          <HStack spacing={2}>
            <Icon as={FiSettings} color={STAFF_COLORS.primaryGold} />
            <Text fontSize="md">{roleTitle} Terminal Settings</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={STAFF_COLORS.secondaryText} />
        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb="0" fontSize="sm" color={STAFF_COLORS.text}>
                  Live Audio Chime
                </FormLabel>
                <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                  Play alert chime when new orders or tickets arrive
                </Text>
              </Box>
              <Switch
                isChecked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                colorScheme="yellow"
              />
            </FormControl>

            <Divider borderColor={STAFF_COLORS.border} />

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb="0" fontSize="sm" color={STAFF_COLORS.text}>
                  Compact Card Grid
                </FormLabel>
                <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                  Display more tickets in smaller cards for high volume
                </Text>
              </Box>
              <Switch
                isChecked={compactView}
                onChange={(e) => setCompactView(e.target.checked)}
                colorScheme="yellow"
              />
            </FormControl>

            <Divider borderColor={STAFF_COLORS.border} />

            <Box>
              <FormLabel fontSize="sm" color={STAFF_COLORS.text} mb={1}>
                Controlled Polling Sync Rate
              </FormLabel>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText} mb={2}>
                Frequency to sync orders if WebSocket temporarily lags
              </Text>
              <Select
                size="sm"
                value={autoRefreshSecs}
                onChange={(e) => setAutoRefreshSecs(e.target.value)}
                bg={STAFF_COLORS.card}
                borderColor={STAFF_COLORS.border}
                borderRadius="xl"
                color={STAFF_COLORS.text}
              >
                <option value="10" style={{ background: STAFF_COLORS.sidebar }}>Every 10 seconds (High Speed)</option>
                <option value="15" style={{ background: STAFF_COLORS.sidebar }}>Every 15 seconds (Standard Recommended)</option>
                <option value="30" style={{ background: STAFF_COLORS.sidebar }}>Every 30 seconds (Balanced)</option>
              </Select>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border}>
          <Button
            size="sm"
            bg={STAFF_COLORS.primaryGold}
            color="#0B0B0D"
            _hover={{ bg: STAFF_COLORS.lightGold }}
            borderRadius="xl"
            onClick={onClose}
          >
            Save Preferences
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

