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
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
} from '@chakra-ui/react';
import {
  FiShield,
  FiDollarSign,
  FiShoppingBag,
  FiCoffee,
  FiUsers,
  FiArrowUpRight,
  FiTrendingUp,
  FiGrid,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { posService, ShiftSummary } from '../../services/pos.service';
import { waiterService } from '../../services/waiter.service';
import { kitchenService } from '../../services/kitchen.service';
import { tableService } from '../../services/table.service';
import { socketService } from '../../services/socket.service';
import { ITable, IOrder } from '../../types';
import toast from 'react-hot-toast';

export const ManagerDashboardPage: React.FC = () => {
  const [shift, setShift] = useState<ShiftSummary | null>(null);
  const [tables, setTables] = useState<ITable[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Theme tokens
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)');
  const mutedCol = useColorModeValue('#6B7280', '#9CA3AF');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');

  const fetchData = useCallback(async () => {
    try {
      const [shiftData, tableList, orderList] = await Promise.all([
        posService.getShiftSummary().catch(() => null),
        tableService.getAll().catch(() => []),
        posService.getOrders({ limit: 15 }).then((r) => r.orders).catch(() => []),
      ]);

      if (shiftData) setShift(shiftData);
      setTables(tableList);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to sync manager operations:', err);
      toast.error('Failed to load manager operations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleSync = () => {
      fetchData();
    };
    socketService.on('order:created', handleSync);
    socketService.on('order:updated', handleSync);
    socketService.on('billing:payment-recorded', handleSync);

    return () => {
      socketService.off('order:created', handleSync);
      socketService.off('order:updated', handleSync);
      socketService.off('billing:payment-recorded', handleSync);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculations
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  const totalTables = tables.length || 1;
  const occupancyRate = Math.round((occupiedTables / totalTables) * 100);

  const activeOrdersCount = orders.filter((o) =>
    ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(o.fulfillmentStatus)
  ).length;

  return (
    <StaffLayout
      terminalName="Operations & Duty Manager Portal"
      terminalBadge="Executive Control"
      badgeColor="yellow"
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
    >
      {/* Quick Launchpad to other terminals */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card
          as={RouterLink}
          to="/cashier/dashboard"
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="xl"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'green.400', transform: 'translateY(-2px)' }}
        >
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Box p={2.5} borderRadius="lg" bg="green.500" color="white">
                  <Icon as={FiDollarSign} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    POS Counter
                  </Text>
                  <Text fontSize="xs" color={mutedCol}>
                    Open Register & Billing
                  </Text>
                </VStack>
              </HStack>
              <Icon as={FiArrowUpRight} color={mutedCol} />
            </Flex>
          </CardBody>
        </Card>

        <Card
          as={RouterLink}
          to="/chef/dashboard"
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="xl"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'orange.400', transform: 'translateY(-2px)' }}
        >
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Box p={2.5} borderRadius="lg" bg="orange.500" color="white">
                  <Icon as={FiShoppingBag} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    Kitchen Display
                  </Text>
                  <Text fontSize="xs" color={mutedCol}>
                    Live Prep Queue
                  </Text>
                </VStack>
              </HStack>
              <Icon as={FiArrowUpRight} color={mutedCol} />
            </Flex>
          </CardBody>
        </Card>

        <Card
          as={RouterLink}
          to="/waiter/dashboard"
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="xl"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'teal.400', transform: 'translateY(-2px)' }}
        >
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Box p={2.5} borderRadius="lg" bg="teal.500" color="white">
                  <Icon as={FiCoffee} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    Floor Service
                  </Text>
                  <Text fontSize="xs" color={mutedCol}>
                    Tables & Waiter Tickets
                  </Text>
                </VStack>
              </HStack>
              <Icon as={FiArrowUpRight} color={mutedCol} />
            </Flex>
          </CardBody>
        </Card>

        <Card
          as={RouterLink}
          to="/admin/dashboard"
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="xl"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: gold, transform: 'translateY(-2px)' }}
        >
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Box p={2.5} borderRadius="lg" bg="yellow.500" color="black">
                  <Icon as={FiGrid} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    Admin Portal
                  </Text>
                  <Text fontSize="xs" color={mutedCol}>
                    System Analytics & Config
                  </Text>
                </VStack>
              </HStack>
              <Icon as={FiArrowUpRight} color={mutedCol} />
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* KPI Stats Row */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Shift Gross Sales
            </Text>
            <Heading size="lg" color={gold}>
              ₹{(shift?.totalCollected ?? 0).toFixed(2)}
            </Heading>
            <Text fontSize="10px" color="green.400" mt={1}>
              {shift?.successfulPayments ?? 0} Completed Bills
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Floor Occupancy
            </Text>
            <Heading size="lg" color={occupancyRate > 75 ? 'orange.400' : 'teal.400'}>
              {occupancyRate}%
            </Heading>
            <Progress
              value={occupancyRate}
              size="xs"
              colorScheme={occupancyRate > 75 ? 'orange' : 'teal'}
              borderRadius="full"
              mt={2}
            />
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Active Dining Tickets
            </Text>
            <Heading size="lg" color="blue.400">
              {activeOrdersCount}
            </Heading>
            <Text fontSize="10px" color={mutedCol} mt={1}>
              Across all dining sections
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Dining Capacity
            </Text>
            <Heading size="lg">
              {occupiedTables} / {tables.length}
            </Heading>
            <Text fontSize="10px" color={mutedCol} mt={1}>
              Active Dining Tables
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Split View: Live Floor Plan Status on Left, Real-Time Orders on Right */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Table Floor Overview */}
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl">
          <CardBody p={5}>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={MdTableRestaurant} color={gold} />
                <Heading size="sm">Restaurant Floor Layout</Heading>
              </HStack>
              <Button
                as={RouterLink}
                to="/waiter/dashboard"
                size="xs"
                variant="outline"
                borderColor={borderCol}
              >
                Open Waiter Floor
              </Button>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner color={gold} />
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={3}>
                {tables.map((tbl) => {
                  let badgeColor = 'gray';
                  if (tbl.status === 'available') badgeColor = 'green';
                  if (tbl.status === 'occupied') badgeColor = 'red';
                  if (tbl.status === 'reserved') badgeColor = 'purple';

                  return (
                    <Box
                      key={tbl._id}
                      p={3}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderCol}
                      bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                      textAlign="center"
                    >
                      <Text fontWeight="bold" fontSize="sm">
                        T-{tbl.tableNumber}
                      </Text>
                      <Text fontSize="10px" color={mutedCol}>
                        {tbl.capacity} Seats
                      </Text>
                      <Badge colorScheme={badgeColor} fontSize="9px" mt={1} textTransform="uppercase">
                        {tbl.status}
                      </Badge>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>

        {/* Live Active Orders Stream */}
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl">
          <CardBody p={5}>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={FiClock} color={gold} />
                <Heading size="sm">Recent Operational Orders</Heading>
              </HStack>
              <Button
                as={RouterLink}
                to="/cashier/dashboard"
                size="xs"
                variant="outline"
                borderColor={borderCol}
              >
                Open POS Register
              </Button>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner color={gold} />
              </Flex>
            ) : orders.length === 0 ? (
              <Text fontSize="sm" color={mutedCol} textAlign="center" py={8}>
                No orders registered for current shift.
              </Text>
            ) : (
              <TableContainer maxH="300px" overflowY="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Ticket</Th>
                      <Th>Table / Type</Th>
                      <Th>Status</Th>
                      <Th>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.slice(0, 8).map((ord) => (
                      <Tr key={ord._id}>
                        <Td fontWeight="bold">#{ord.orderNumber}</Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {ord.tableNumber ? `Table ${ord.tableNumber}` : ord.orderType}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              ord.fulfillmentStatus === 'ready_for_pickup'
                                ? 'yellow'
                                : ord.fulfillmentStatus === 'served'
                                ? 'teal'
                                : ord.fulfillmentStatus === 'preparing'
                                ? 'orange'
                                : 'blue'
                            }
                          >
                            {ord.fulfillmentStatus}
                          </Badge>
                        </Td>
                        <Td fontWeight="semibold" color={gold}>
                          ₹{ord.grandTotal.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </StaffLayout>
  );
};

