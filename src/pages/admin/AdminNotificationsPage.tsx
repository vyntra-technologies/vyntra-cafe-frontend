import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Badge,
  IconButton,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
  Divider,
} from '@chakra-ui/react';
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
  FiShoppingBag,
  FiCalendar,
  FiUserCheck,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { notificationService } from '../../services/notification.service';
import { socketService } from '../../services/socket.service';
import { INotification } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterUnread, setFilterUnread] = useState<boolean>(false);

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      toast({
        title: 'Error loading notifications',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleRealtime = () => {
      fetchNotifications();
    };

    socketService.on('new_order', handleRealtime);
    socketService.on('order_status_updated', handleRealtime);
    socketService.on('cancellation_request', handleRealtime);

    return () => {
      socketService.off('new_order', handleRealtime);
      socketService.off('order_status_updated', handleRealtime);
      socketService.off('cancellation_request', handleRealtime);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast({ title: 'Alert marked as read', status: 'info', duration: 1500 });
    } catch {
      // Fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({ title: 'All operational alerts marked read', status: 'success', duration: 2000 });
    } catch {
      // Fallback
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast({ title: 'Alert deleted', status: 'info', duration: 1500 });
    } catch {
      // Fallback
    }
  };

  const displayedList = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return FiShoppingBag;
      case 'reservation':
        return FiCalendar;
      case 'staff':
        return FiUserCheck;
      default:
        return FiAlertCircle;
    }
  };

  return (
    <AdminLayout pageTitle="Operational Notifications">
      <Box maxW="1000px" mx="auto">
        {/* Header Bar */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading
              fontSize={{ base: '2xl', md: '3xl' }}
              fontFamily="heading"
              color={textColor}
              letterSpacing="-0.02em"
            >
              Operations Inbox
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Live alerts for new customer orders, table reservations, and cancellation requests.
            </Text>
          </Box>

          <HStack spacing={3}>
            {unreadCount > 0 && (
              <Button
                leftIcon={<FiCheck />}
                variant="outline"
                borderColor={borderColor}
                color={goldAccent}
                size="sm"
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
            <Button
              leftIcon={<FiRefreshCw />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              onClick={fetchNotifications}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {/* Filter Tabs */}
        <Tabs
          variant="line"
          colorScheme="yellow"
          onChange={(idx) => setFilterUnread(idx === 1)}
          mb={6}
        >
          <TabList borderColor={borderColor}>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              All Alerts ({notifications.length})
            </Tab>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              Unread
              {unreadCount > 0 && (
                <Badge ml={2} bg="red.500" color="white" borderRadius="full">
                  {unreadCount}
                </Badge>
              )}
            </Tab>
          </TabList>
        </Tabs>

        {/* Notifications List */}
        <Box
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {isLoading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner size="lg" color={goldAccent} />
            </Flex>
          ) : displayedList.length === 0 ? (
            <Box p={12} textAlign="center" color={mutedColor}>
              <Icon as={FiBell} boxSize={12} color={goldAccent} mb={3} />
              <Heading fontSize="md" color={textColor} fontWeight="600">
                {filterUnread ? 'No unread notifications' : 'Your notifications inbox is empty'}
              </Heading>
              <Text fontSize="xs" mt={1}>
                New system events and tickets will appear here in real time.
              </Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch" divider={<Divider borderColor={borderColor} />}>
              {displayedList.map((item) => {
                const IconComponent = getTypeIcon(item.type);
                return (
                  <Flex
                    key={item._id}
                    p={5}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    direction={{ base: 'column', sm: 'row' }}
                    gap={3}
                    bg={item.isRead ? 'transparent' : useColorModeValue('rgba(168, 121, 22, 0.04)', 'rgba(212, 175, 55, 0.04)')}
                    transition="all 0.15s ease"
                    _hover={{ bg: innerCardBg }}
                  >
                    <HStack spacing={4} align="flex-start" flex={1}>
                      <Flex
                        w={10}
                        h={10}
                        borderRadius="lg"
                        bg={item.isRead ? innerCardBg : useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)')}
                        color={item.isRead ? mutedColor : goldAccent}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={IconComponent} boxSize={5} />
                      </Flex>

                      <Box>
                        <HStack spacing={2} mb={1}>
                          <Text
                            fontWeight={item.isRead ? '600' : '700'}
                            color={textColor}
                            fontSize="sm"
                          >
                            {item.title}
                          </Text>
                          {!item.isRead && (
                            <Badge bg={goldAccent} color="black" fontSize="9px" borderRadius="sm">
                              NEW
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={mutedColor} lineHeight="tall">
                          {item.message}
                        </Text>
                        <HStack spacing={1} color={mutedColor} fontSize="11px" mt={2}>
                          <FiClock />
                          <Text>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                        </HStack>
                      </Box>
                    </HStack>

                    <HStack spacing={2} alignSelf={{ base: 'flex-end', sm: 'center' }}>
                      {!item.isRead && (
                        <IconButton
                          aria-label="Mark as read"
                          icon={<FiCheck />}
                          size="xs"
                          variant="ghost"
                          color={goldAccent}
                          _hover={{ bg: innerCardBg }}
                          onClick={() => handleMarkAsRead(item._id)}
                        />
                      )}
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        size="xs"
                        variant="ghost"
                        color="red.400"
                        _hover={{ bg: 'rgba(229, 62, 62, 0.1)' }}
                        onClick={() => handleDelete(item._id)}
                      />
                    </HStack>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>
      </Box>
    </AdminLayout>
  );
};

