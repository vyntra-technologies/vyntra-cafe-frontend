import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  Icon,
  Divider,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiClock,
  FiCheckCircle,
  FiCheck,
  FiShoppingBag,
  FiAlertCircle,
  FiEye,
  FiList,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import { FaFire, FaUtensils, FaConciergeBell } from 'react-icons/fa';
import { ChefLayout } from '../../components/staff/ChefLayout';
import {
  StatCard,
  SearchBar,
  DataTable,
  EmptyState,
  LoadingSkeleton,
} from '../../components/staff/StaffCommonUI';
import { OrderTicketCard } from '../../components/staff/OrderTicketCard';
import { OrderDetailsDrawer } from '../../components/staff/OrderDetailsDrawer';
import { STAFF_COLORS } from '../../components/staff/StaffTheme';
import { kitchenService, KitchenDashboardStats } from '../../services/kitchen.service';
import { socketService } from '../../services/socket.service';
import { IOrder } from '../../types';
import toast from '../../utils/toast';

export const KitchenDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<IOrder[]>([]);
  const [stats, setStats] = useState<KitchenDashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Active view tab state (matches sidebar keys)
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Drawer inspection state
  const [inspectedOrder, setInspectedOrder] = useState<IOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Elapsed timer ticker (forces re-render every 5 seconds for live timers)
  const [, setTick] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [oList, sData] = await Promise.all([
        kitchenService.getOrders(),
        kitchenService.getDashboard().catch(() => ({})),
      ]);
      setOrders(oList);
      setStats(sData);
    } catch (err: any) {
      console.error('Failed to load kitchen display:', err);
      toast.error('Failed to synchronize kitchen queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const hist = await kitchenService.getHistory();
      setHistoryOrders(hist);
    } catch (err) {
      console.error('Failed to load kitchen history:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // 5-second interval to update elapsed cooking timers
    const timer = setInterval(() => setTick((t) => t + 1), 5000);

    // Socket.io sync & sound alert
    const handleSync = () => {
      fetchData();
      if (audioEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
      }
    };

    socketService.on('order:created', handleSync);
    socketService.on('order:updated', handleSync);
    socketService.on('kitchen:order-received', handleSync);

    return () => {
      clearInterval(timer);
      socketService.off('order:created', handleSync);
      socketService.off('order:updated', handleSync);
      socketService.off('kitchen:order-received', handleSync);
    };
  }, [fetchData, audioEnabled]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    if (activeTab === 'completed' || activeTab === 'order_history') {
      fetchHistory();
    }
  };

  // Kitchen Actions
  const handleAccept = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await kitchenService.acceptOrder(orderId);
      toast.success('Order ticket accepted into kitchen');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await kitchenService.startPreparing(orderId);
      toast.success('Preparation underway — cooking timer active');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start preparation');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await kitchenService.markReady(orderId);
      toast.success('Dishes marked ready — floor server alerted!');
      fetchData();
      if (inspectedOrder?._id === orderId) {
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark order as ready');
    } finally {
      setActionInProgress(null);
    }
  };

  // Ticket Grouping for 3 Kanban Columns
  const newTickets = useMemo(() => {
    return orders.filter((o) => ['placed', 'confirmed'].includes(o.fulfillmentStatus));
  }, [orders]);

  const preparingTickets = useMemo(() => {
    return orders.filter((o) => o.fulfillmentStatus === 'preparing');
  }, [orders]);

  const readyTickets = useMemo(() => {
    return orders.filter((o) => o.fulfillmentStatus === 'ready_for_pickup');
  }, [orders]);

  const completedTodayCount = stats.completedTodayCount ?? historyOrders.length;

  // Queue Load calculation
  const totalActive = newTickets.length + preparingTickets.length;
  const queueLoad = useMemo(() => {
    if (totalActive >= 10) return { label: 'PEAK LOAD', colorScheme: 'red' as const };
    if (totalActive >= 5) return { label: 'MODERATE', colorScheme: 'yellow' as const };
    return { label: 'OPTIMAL', colorScheme: 'green' as const };
  }, [totalActive]);

  if (loading) {
    return (
      <ChefLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <LoadingSkeleton rows={5} />
      </ChefLayout>
    );
  }

  return (
    <ChefLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'completed' || tab === 'order_history') {
          fetchHistory();
        }
      }}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      pendingTicketCount={newTickets.length}
      preparingTicketCount={preparingTickets.length}
      readyTicketCount={readyTickets.length}
      activeTicketCount={totalActive}
      audioEnabled={audioEnabled}
      onToggleAudio={() => setAudioEnabled(!audioEnabled)}
    >
      <VStack spacing={6} align="stretch">
        {/* 5 Core Dashboard Stat Cards */}
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} spacing={{ base: 3, md: 4 }}>
          <StatCard
            title="New Tickets"
            value={newTickets.length}
            subtitle="Requires Confirmation"
            icon={FiClock}
            colorScheme="yellow"
            badge={newTickets.length > 0 ? 'ACTION' : undefined}
            onClick={() => setActiveTab('new_tickets')}
          />
          <StatCard
            title="Preparing Orders"
            value={preparingTickets.length}
            subtitle="On Stove / Prep Table"
            icon={FaUtensils}
            colorScheme="yellow"
            onClick={() => setActiveTab('preparing')}
          />
          <StatCard
            title="Ready for Pickup"
            value={readyTickets.length}
            subtitle="Waiting for Server"
            icon={FaConciergeBell}
            colorScheme="green"
            badge={readyTickets.length > 0 ? 'READY' : undefined}
            onClick={() => setActiveTab('ready')}
          />
          <StatCard
            title="Completed Today"
            value={completedTodayCount}
            subtitle="Fulfilled Tickets"
            icon={FiCheckCircle}
            colorScheme="gold"
            onClick={() => {
              fetchHistory();
              setActiveTab('completed');
            }}
          />
          <StatCard
            title="Kitchen Load"
            value={queueLoad.label}
            subtitle={`${totalActive} Active Tickets`}
            icon={FaFire}
            colorScheme={queueLoad.colorScheme}
            badge={queueLoad.label}
            onClick={() => setActiveTab('overview')}
          />
        </SimpleGrid>

        {/* VIEW 1: KITCHEN OVERVIEW (3-COLUMN KANBAN KDS) */}
        {activeTab === 'overview' && (
          <Box>
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
              <Box>
                <Heading size="sm" color={STAFF_COLORS.text} letterSpacing="wide">
                  Kitchen Display System (KDS) Live Kanban
                </Heading>
                <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                  Drag-free touch columns. Live cooking timers update automatically.
                </Text>
              </Box>

              <HStack spacing={2}>
                <Badge colorScheme="yellow" px={2.5} py={1} borderRadius="full" fontSize="xs">
                  {newTickets.length} In Queue
                </Badge>
                <Badge colorScheme="orange" px={2.5} py={1} borderRadius="full" fontSize="xs">
                  {preparingTickets.length} Cooking
                </Badge>
                <Badge colorScheme="green" px={2.5} py={1} borderRadius="full" fontSize="xs">
                  {readyTickets.length} Ready
                </Badge>
              </HStack>
            </Flex>

            {/* 3 Kanban Columns */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} alignItems="flex-start">
              {/* Column 1: New Tickets */}
              <Box
                bg={STAFF_COLORS.sidebar}
                borderWidth="1px"
                borderColor={STAFF_COLORS.border}
                borderRadius="2xl"
                p={4}
              >
                <Flex justify="space-between" align="center" pb={3} mb={3} borderBottomWidth="2px" borderColor={STAFF_COLORS.warning}>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color={STAFF_COLORS.warning} />
                    <Text fontWeight="800" fontSize="sm" color={STAFF_COLORS.text} textTransform="uppercase">
                      1. New Tickets
                    </Text>
                  </HStack>
                  <Badge colorScheme="yellow" borderRadius="full" px={2}>
                    {newTickets.length}
                  </Badge>
                </Flex>

                {newTickets.length === 0 ? (
                  <Box py={8} textAlign="center">
                    <Text fontSize="xs" color={STAFF_COLORS.mutedText}>
                      No incoming tickets pending review.
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {newTickets.map((ticket) => (
                      <OrderTicketCard
                        key={ticket._id}
                        order={ticket}
                        role="chef"
                        onAction={(action, ord) => {
                          if (action === 'accept') handleAccept(ord._id);
                          else if (action === 'start_preparing') handleStartPreparing(ord._id);
                        }}
                        onViewDetails={(ord) => {
                          setInspectedOrder(ord);
                          setIsDrawerOpen(true);
                        }}
                        isLoading={actionInProgress === ticket._id}
                      />
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Column 2: Preparing / Cooking */}
              <Box
                bg={STAFF_COLORS.sidebar}
                borderWidth="1px"
                borderColor={STAFF_COLORS.border}
                borderRadius="2xl"
                p={4}
              >
                <Flex justify="space-between" align="center" pb={3} mb={3} borderBottomWidth="2px" borderColor="orange.400">
                  <HStack spacing={2}>
                    <Icon as={FaUtensils} color="orange.400" />
                    <Text fontWeight="800" fontSize="sm" color={STAFF_COLORS.text} textTransform="uppercase">
                      2. In Preparation
                    </Text>
                  </HStack>
                  <Badge colorScheme="orange" borderRadius="full" px={2}>
                    {preparingTickets.length}
                  </Badge>
                </Flex>

                {preparingTickets.length === 0 ? (
                  <Box py={8} textAlign="center">
                    <Text fontSize="xs" color={STAFF_COLORS.mutedText}>
                      No tickets currently on stove or preparation table.
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {preparingTickets.map((ticket) => (
                      <OrderTicketCard
                        key={ticket._id}
                        order={ticket}
                        role="chef"
                        onAction={(action, ord) => {
                          if (action === 'mark_ready') handleMarkReady(ord._id);
                        }}
                        onViewDetails={(ord) => {
                          setInspectedOrder(ord);
                          setIsDrawerOpen(true);
                        }}
                        isLoading={actionInProgress === ticket._id}
                      />
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Column 3: Ready for Pickup */}
              <Box
                bg={STAFF_COLORS.sidebar}
                borderWidth="1px"
                borderColor={STAFF_COLORS.border}
                borderRadius="2xl"
                p={4}
              >
                <Flex justify="space-between" align="center" pb={3} mb={3} borderBottomWidth="2px" borderColor={STAFF_COLORS.success}>
                  <HStack spacing={2}>
                    <Icon as={FaConciergeBell} color={STAFF_COLORS.success} />
                    <Text fontWeight="800" fontSize="sm" color={STAFF_COLORS.text} textTransform="uppercase">
                      3. Ready for Service
                    </Text>
                  </HStack>
                  <Badge colorScheme="green" borderRadius="full" px={2}>
                    {readyTickets.length}
                  </Badge>
                </Flex>

                {readyTickets.length === 0 ? (
                  <Box py={8} textAlign="center">
                    <Text fontSize="xs" color={STAFF_COLORS.mutedText}>
                      All plated dishes have been picked up by waitstaff.
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {readyTickets.map((ticket) => (
                      <OrderTicketCard
                        key={ticket._id}
                        order={ticket}
                        role="chef"
                        onViewDetails={(ord) => {
                          setInspectedOrder(ord);
                          setIsDrawerOpen(true);
                        }}
                        isLoading={actionInProgress === ticket._id}
                      />
                    ))}
                  </VStack>
                )}
              </Box>
            </SimpleGrid>
          </Box>
        )}

        {/* VIEW 2: NEW TICKETS SPECIFIC LIST */}
        {activeTab === 'new_tickets' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm" color={STAFF_COLORS.text}>
                Incoming Kitchen Orders ({newTickets.length})
              </Heading>
              <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">
                Action Required
              </Badge>
            </Flex>

            {newTickets.length === 0 ? (
              <EmptyState
                title="No Incoming Tickets"
                message="All new tickets have been acknowledged and sent to the cooking line."
                icon={FiClock}
              />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                {newTickets.map((ticket) => (
                  <OrderTicketCard
                    key={ticket._id}
                    order={ticket}
                    role="chef"
                    onAction={(action, ord) => {
                      if (action === 'accept') handleAccept(ord._id);
                      else if (action === 'start_preparing') handleStartPreparing(ord._id);
                    }}
                    onViewDetails={(ord) => {
                      setInspectedOrder(ord);
                      setIsDrawerOpen(true);
                    }}
                    isLoading={actionInProgress === ticket._id}
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}

        {/* VIEW 3: PREPARING / COOKING LIST */}
        {activeTab === 'preparing' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm" color={STAFF_COLORS.text}>
                Active Cooking & Preparation ({preparingTickets.length})
              </Heading>
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                Timers Running
              </Badge>
            </Flex>

            {preparingTickets.length === 0 ? (
              <EmptyState
                title="No Dishes Currently In Preparation"
                message="Start cooking tickets from the New Tickets queue."
                icon={FaUtensils}
              />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                {preparingTickets.map((ticket) => (
                  <OrderTicketCard
                    key={ticket._id}
                    order={ticket}
                    role="chef"
                    onAction={(action, ord) => {
                      if (action === 'mark_ready') handleMarkReady(ord._id);
                    }}
                    onViewDetails={(ord) => {
                      setInspectedOrder(ord);
                      setIsDrawerOpen(true);
                    }}
                    isLoading={actionInProgress === ticket._id}
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}

        {/* VIEW 4: READY FOR PICKUP */}
        {activeTab === 'ready' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm" color={STAFF_COLORS.text}>
                Ready for Server Pickup ({readyTickets.length})
              </Heading>
              <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                Plated & Staged
              </Badge>
            </Flex>

            {readyTickets.length === 0 ? (
              <EmptyState
                title="Staging Counter Clear"
                message="No dishes waiting for waiter pickup."
                icon={FaConciergeBell}
              />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                {readyTickets.map((ticket) => (
                  <OrderTicketCard
                    key={ticket._id}
                    order={ticket}
                    role="chef"
                    onViewDetails={(ord) => {
                      setInspectedOrder(ord);
                      setIsDrawerOpen(true);
                    }}
                    isLoading={actionInProgress === ticket._id}
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}

        {/* VIEW 5: SERVED / COMPLETED */}
        {activeTab === 'completed' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm" color={STAFF_COLORS.text}>
                Culinary Records Served Today
              </Heading>
              <Badge colorScheme="gold" px={3} py={1} borderRadius="full">
                {historyOrders.length} Fulfilled
              </Badge>
            </Flex>

            <DataTable<IOrder>
              columns={[
                {
                  header: 'Ticket #',
                  cell: (o) => (
                    <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                      #{o.orderNumber}
                    </Text>
                  ),
                },
                {
                  header: 'Destination',
                  cell: (o) => (
                    <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                      {o.orderType === 'dine-in' ? `Table #${o.tableNumber || '-'}` : 'Takeaway'}
                    </Badge>
                  ),
                },
                {
                  header: 'Dishes Prepared',
                  cell: (o) => (
                    <Text fontSize="xs" noOfLines={1} maxW="340px">
                      {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>
                  ),
                },
                {
                  header: 'Completion Status',
                  cell: (o) => (
                    <Badge colorScheme="green">
                      {o.fulfillmentStatus.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: 'Action',
                  align: 'right',
                  cell: (o) => (
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor={STAFF_COLORS.border}
                      leftIcon={<FiEye />}
                      onClick={() => {
                        setInspectedOrder(o);
                        setIsDrawerOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  ),
                },
              ]}
              data={historyOrders}
              emptyMessage="No completed tickets logged yet today."
            />
          </VStack>
        )}

        {/* VIEW 6: ORDER HISTORY */}
        {activeTab === 'order_history' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search ticket history by order #..."
                maxW="300px"
              />
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                Showing {historyOrders.length} historical logs
              </Text>
            </Flex>

            <DataTable<IOrder>
              columns={[
                {
                  header: 'Ticket #',
                  cell: (o) => (
                    <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                      #{o.orderNumber}
                    </Text>
                  ),
                },
                {
                  header: 'Date & Time',
                  cell: (o) => (
                    <Text fontSize="xs">
                      {new Date(o.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  ),
                },
                {
                  header: 'Table / Mode',
                  cell: (o) => (
                    <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                      {o.orderType === 'dine-in' ? `Table #${o.tableNumber || '-'}` : 'Takeaway'}
                    </Badge>
                  ),
                },
                {
                  header: 'Items List',
                  cell: (o) => (
                    <Text fontSize="xs" noOfLines={1} maxW="320px">
                      {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>
                  ),
                },
                {
                  header: 'Fulfillment',
                  cell: (o) => (
                    <Badge colorScheme={o.fulfillmentStatus === 'completed' ? 'green' : 'yellow'}>
                      {o.fulfillmentStatus.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: 'View',
                  align: 'right',
                  cell: (o) => (
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor={STAFF_COLORS.border}
                      leftIcon={<FiEye />}
                      onClick={() => {
                        setInspectedOrder(o);
                        setIsDrawerOpen(true);
                      }}
                    >
                      Ticket
                    </Button>
                  ),
                },
              ]}
              data={historyOrders.filter(
                (o) => !searchQuery || o.orderNumber.includes(searchQuery)
              )}
              emptyMessage="No kitchen records found."
            />
          </VStack>
        )}
      </VStack>

      {/* Reusable Order Details Drawer (Pricing hidden for Chef role) */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={inspectedOrder}
        role="chef"
        onAction={(action, ord) => {
          if (action === 'accept') handleAccept(ord._id);
          else if (action === 'start_preparing') handleStartPreparing(ord._id);
          else if (action === 'mark_ready') handleMarkReady(ord._id);
        }}
        actionLoading={!!actionInProgress}
      />
    </ChefLayout>
  );
};
