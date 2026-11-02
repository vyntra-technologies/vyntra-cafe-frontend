import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import {
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiCheck,
  FiShoppingBag,
  FiAlertCircle,
  FiRefreshCw,
  FiList,
} from 'react-icons/fi';
import { StaffLayout } from '../../components/staff/StaffLayout';
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

  // Time tracker for live elapsed timers
  const [, setTick] = useState(0);

  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)');
  const mutedCol = useColorModeValue('#6B7280', '#9CA3AF');
  const gold = useColorModeValue('#A87916', '#D4AF37');

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
      toast.error('Failed to sync kitchen queue');
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

    // 1-second interval to update elapsed cooking timers
    const timer = setInterval(() => setTick((t) => t + 1), 5000);

    // Socket.io sync
    const handleSync = () => {
      fetchData();
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
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAccept = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await kitchenService.acceptOrder(orderId);
      toast.success('Order confirmed in kitchen');
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
      toast.success('Prep started — clock ticking');
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
      toast.success('Food marked READY! Notification dispatched to service staff.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark order as ready');
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper for elapsed time
  const getElapsedMinutes = (dateStr: string) => {
    const elapsed = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  // Groups
  const placedOrders = orders.filter((o) => ['placed', 'confirmed'].includes(o.fulfillmentStatus));
  const preparingOrders = orders.filter((o) => o.fulfillmentStatus === 'preparing');
  const readyOrders = orders.filter((o) => o.fulfillmentStatus === 'ready_for_pickup');

  return (
    <StaffLayout
      terminalName="Kitchen Display System (KDS)"
      terminalBadge="Culinary Ops"
      badgeColor="orange"
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
    >
      {/* Kitchen Operations Stats Strip */}
      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Queue Pending
            </Text>
            <Heading size="lg" color="blue.400">
              {stats.pendingCount ?? placedOrders.length}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Currently Cooking
            </Text>
            <Heading size="lg" color="orange.400">
              {stats.preparingCount ?? preparingOrders.length}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Ready for Serving
            </Text>
            <Heading size="lg" color="yellow.400">
              {stats.readyCount ?? readyOrders.length}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Cooked Today
            </Text>
            <Heading size="lg" color="green.400">
              {stats.completedTodayCount ?? 0}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Avg Prep Time
            </Text>
            <Heading size="lg" color={gold}>
              {stats.avgPrepTimeMinutes ? `${stats.avgPrepTimeMinutes}m` : '14m'}
            </Heading>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs: Live Kitchen Kanban vs Finished History */}
      <Tabs colorScheme="orange" variant="enclosed">
        <TabList borderBottom="1px solid" borderColor={borderCol} mb={4}>
          <Tab fontWeight="bold" fontSize="sm">
            Live Cooking Stations ({orders.length})
          </Tab>
          <Tab fontWeight="bold" fontSize="sm" onClick={fetchHistory}>
            Completed History
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: KANBAN COLUMNS */}
          <TabPanel p={0}>
            {loading ? (
              <Flex justify="center" align="center" h="300px">
                <Spinner color={gold} size="xl" />
              </Flex>
            ) : orders.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={12} textAlign="center">
                <Heading size="md" mb={2}>
                  All orders cooked!
                </Heading>
                <Text color={mutedCol}>
                  No active orders currently waiting in the kitchen queue.
                </Text>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {/* COLUMN 1: NEW / CONFIRMED ORDERS */}
                <Box>
                  <HStack justify="space-between" mb={3} px={1}>
                    <HStack>
                      <Badge colorScheme="blue" fontSize="sm" px={2} py={0.5} borderRadius="md">
                        NEW TICKETS
                      </Badge>
                      <Text fontWeight="bold" fontSize="sm">
                        ({placedOrders.length})
                      </Text>
                    </HStack>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    {placedOrders.map((ord) => {
                      const elapsed = getElapsedMinutes(ord.createdAt);
                      const isUrgent = elapsed > 15;

                      return (
                        <Card
                          key={ord._id}
                          bg={cardBg}
                          border="1px solid"
                          borderColor={isUrgent ? 'red.500' : 'blue.500'}
                          borderRadius="xl"
                          boxShadow="sm"
                          overflow="hidden"
                        >
                          <Box bg="blue.500" h={1.5} />
                          <CardBody p={4}>
                            <Flex justify="space-between" align="start" mb={2}>
                              <VStack align="start" spacing={0}>
                                <Heading size="sm">Ticket #{ord.orderNumber}</Heading>
                                <HStack spacing={2} mt={1}>
                                  <Badge colorScheme="purple">{ord.orderType}</Badge>
                                  {ord.tableNumber && (
                                    <Badge colorScheme="teal">
                                      Table #{ord.tableNumber}
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                              <HStack
                                fontSize="xs"
                                color={isUrgent ? 'red.400' : mutedCol}
                                fontWeight="bold"
                              >
                                <Icon as={FiClock} />
                                <Text>{elapsed}m ago</Text>
                              </HStack>
                            </Flex>

                            <Divider my={3} borderColor={borderCol} />

                            {/* Dishes List */}
                            <VStack align="stretch" spacing={2} mb={4}>
                              {ord.items.map((it, idx) => (
                                <Box key={idx} p={2} bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')} borderRadius="md">
                                  <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" fontSize="sm">
                                      {it.quantity}x {it.name}
                                    </Text>
                                    {it.variantName && (
                                      <Badge fontSize="10px" colorScheme="gray">
                                        {it.variantName}
                                      </Badge>
                                    )}
                                  </Flex>
                                  {it.notes && (
                                    <Text fontSize="xs" color="orange.400" mt={1}>
                                      • Note: {it.notes}
                                    </Text>
                                  )}
                                </Box>
                              ))}
                            </VStack>

                            {ord.notes && (
                              <Alert status="info" size="xs" borderRadius="md" mb={4} py={1}>
                                <AlertIcon boxSize={3} />
                                <Text fontSize="xs">{ord.notes}</Text>
                              </Alert>
                            )}

                            <HStack spacing={2}>
                              {ord.fulfillmentStatus === 'placed' && (
                                <Button
                                  w="50%"
                                  size="sm"
                                  colorScheme="blue"
                                  isLoading={actionInProgress === ord._id}
                                  onClick={() => handleAccept(ord._id)}
                                >
                                  Accept Ticket
                                </Button>
                              )}
                              <Button
                                w={ord.fulfillmentStatus === 'placed' ? '50%' : 'full'}
                                size="sm"
                                colorScheme="orange"
                                leftIcon={<FiPlay />}
                                isLoading={actionInProgress === ord._id}
                                onClick={() => handleStartPreparing(ord._id)}
                              >
                                Start Cooking
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                </Box>

                {/* COLUMN 2: CURRENTLY PREPARING */}
                <Box>
                  <HStack justify="space-between" mb={3} px={1}>
                    <HStack>
                      <Badge colorScheme="orange" fontSize="sm" px={2} py={0.5} borderRadius="md">
                        PREPARING / COOKING
                      </Badge>
                      <Text fontWeight="bold" fontSize="sm">
                        ({preparingOrders.length})
                      </Text>
                    </HStack>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    {preparingOrders.map((ord) => {
                      const elapsed = getElapsedMinutes(ord.createdAt);
                      const isOverdue = elapsed > 25;

                      return (
                        <Card
                          key={ord._id}
                          bg={cardBg}
                          border="2px solid"
                          borderColor={isOverdue ? 'red.500' : 'orange.400'}
                          borderRadius="xl"
                          boxShadow="0 4px 15px rgba(237, 137, 54, 0.15)"
                          overflow="hidden"
                        >
                          <Box bg="orange.400" h={1.5} />
                          <CardBody p={4}>
                            <Flex justify="space-between" align="start" mb={2}>
                              <VStack align="start" spacing={0}>
                                <Heading size="sm">Ticket #{ord.orderNumber}</Heading>
                                <HStack spacing={2} mt={1}>
                                  <Badge colorScheme="purple">{ord.orderType}</Badge>
                                  {ord.tableNumber && (
                                    <Badge colorScheme="teal">
                                      Table #{ord.tableNumber}
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                              <Badge
                                colorScheme={isOverdue ? 'red' : 'orange'}
                                fontSize="xs"
                                px={2}
                                py={0.5}
                              >
                                {elapsed} min elapsed
                              </Badge>
                            </Flex>

                            <Divider my={3} borderColor={borderCol} />

                            <VStack align="stretch" spacing={2} mb={4}>
                              {ord.items.map((it, idx) => (
                                <Box key={idx} p={2} bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')} borderRadius="md">
                                  <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" fontSize="sm">
                                      {it.quantity}x {it.name}
                                    </Text>
                                    {it.variantName && (
                                      <Badge fontSize="10px" colorScheme="gray">
                                        {it.variantName}
                                      </Badge>
                                    )}
                                  </Flex>
                                  {it.notes && (
                                    <Text fontSize="xs" color="orange.400" mt={1}>
                                      • Note: {it.notes}
                                    </Text>
                                  )}
                                </Box>
                              ))}
                            </VStack>

                            <Button
                              w="full"
                              size="md"
                              colorScheme="green"
                              leftIcon={<FiCheckCircle />}
                              isLoading={actionInProgress === ord._id}
                              onClick={() => handleMarkReady(ord._id)}
                            >
                              Mark Ready to Serve
                            </Button>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                </Box>

                {/* COLUMN 3: READY FOR PICKUP */}
                <Box>
                  <HStack justify="space-between" mb={3} px={1}>
                    <HStack>
                      <Badge colorScheme="yellow" fontSize="sm" px={2} py={0.5} borderRadius="md">
                        READY FOR PICKUP
                      </Badge>
                      <Text fontWeight="bold" fontSize="sm">
                        ({readyOrders.length})
                      </Text>
                    </HStack>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    {readyOrders.map((ord) => (
                      <Card
                        key={ord._id}
                        bg={cardBg}
                        border="2px solid"
                        borderColor="yellow.400"
                        borderRadius="xl"
                        boxShadow="0 4px 15px rgba(236, 201, 75, 0.2)"
                        overflow="hidden"
                      >
                        <Box bg="yellow.400" h={1.5} />
                        <CardBody p={4}>
                          <Flex justify="space-between" align="start" mb={2}>
                            <VStack align="start" spacing={0}>
                              <Heading size="sm">Ticket #{ord.orderNumber}</Heading>
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme="teal">
                                  Table #{ord.tableNumber || 'N/A'}
                                </Badge>
                                <Badge colorScheme="purple">{ord.orderType}</Badge>
                              </HStack>
                            </VStack>
                            <Badge colorScheme="yellow" fontSize="xs">
                              Awaiting Server
                            </Badge>
                          </Flex>

                          <Divider my={3} borderColor={borderCol} />

                          <VStack align="stretch" spacing={1} mb={3}>
                            {ord.items.map((it, idx) => (
                              <Text key={idx} fontSize="xs" fontWeight="semibold">
                                ✓ {it.quantity}x {it.name}
                              </Text>
                            ))}
                          </VStack>

                          <Text fontSize="10px" color={mutedCol} textAlign="center">
                            Notification sent to service team.
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              </SimpleGrid>
            )}
          </TabPanel>

          {/* TAB 2: COMPLETED HISTORY */}
          <TabPanel p={0}>
            {historyOrders.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                <Text color={mutedCol}>No prior history loaded yet. Click to fetch history.</Text>
                <Button size="sm" mt={3} onClick={fetchHistory} leftIcon={<FiRefreshCw />}>
                  Load History
                </Button>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {historyOrders.map((ord) => (
                  <Card key={ord._id} bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
                    <CardBody p={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="xs">#{ord.orderNumber}</Heading>
                        <Badge colorScheme="green">Cooked & Completed</Badge>
                      </Flex>
                      <Text fontSize="xs" color={mutedCol} mb={2}>
                        Completed at: {new Date(ord.updatedAt).toLocaleTimeString()}
                      </Text>
                      <VStack align="stretch" spacing={1} fontSize="xs">
                        {ord.items.map((it, idx) => (
                          <Text key={idx}>
                            • {it.quantity}x {it.name}
                          </Text>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </StaffLayout>
  );
};

