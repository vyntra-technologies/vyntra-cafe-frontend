import React, { useEffect, useState } from 'react';
import {
  Box,
  Center,
  SimpleGrid,
  Flex,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingBag,
  FiClock,
  FiCalendar,
  FiAlertTriangle,
  FiArrowUpRight,
  FiRefreshCw,
  FiMoreVertical,
  FiExternalLink,
  FiPlus,
  FiCheckCircle,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reportService } from '../../services/report.service';
import { orderService } from '../../services/order.service';
import { reservationService } from '../../services/reservation.service';
import { tableService } from '../../services/table.service';
import {
  IDashboardMetrics,
  IDailySales,
  IOrder,
  IReservation,
  IOrderAnalytics,
  IBestsellerItem,
} from '../../types';

const PIE_COLORS = ['#D4AF37', '#A47A3C', '#E5A93C', '#8C6226', '#F5D77F'];

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [dailySales, setDailySales] = useState<IDailySales[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<IOrderAnalytics | null>(null);
  const [bestsellers, setBestsellers] = useState<IBestsellerItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [recentReservations, setRecentReservations] = useState<IReservation[]>([]);
  const [availableTablesCount, setAvailableTablesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [
        dashboardData,
        dailySalesData,
        analyticsData,
        bestsellersData,
        ordersRes,
        reservationsRes,
        availableTables,
      ] = await Promise.allSettled([
        reportService.getDashboard(),
        reportService.getDailySales(14),
        reportService.getOrderAnalytics(),
        reportService.getBestsellers(5),
        orderService.getAll({ limit: 5 }),
        reservationService.getAll({ limit: 5 }),
        tableService.getAvailableTables(),
      ]);

      if (dashboardData.status === 'fulfilled') setMetrics(dashboardData.value);
      if (dailySalesData.status === 'fulfilled') setDailySales(dailySalesData.value);
      if (analyticsData.status === 'fulfilled') setOrderAnalytics(analyticsData.value);
      if (bestsellersData.status === 'fulfilled') setBestsellers(bestsellersData.value);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.orders);
      if (reservationsRes.status === 'fulfilled') setRecentReservations(reservationsRes.value.reservations);
      if (availableTables.status === 'fulfilled') setAvailableTablesCount(availableTables.value.length);
    } catch {
      // Handled via individual promise states
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'green';
      case 'preparing':
      case 'pending':
        return 'yellow';
      case 'ready_for_pickup':
      case 'served':
        return 'purple';
      case 'cancelled':
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <AdminLayout pageTitle="Operations Overview">
      <Box>
        {/* Header Action Bar */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={8}
        >
          <Box>
            <Heading
              fontSize={{ base: '2xl', md: '3xl' }}
              fontFamily="heading"
              color={textColor}
              letterSpacing="-0.02em"
            >
              Executive Summary
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Real-time operational metrics and revenue analytics for Vyntra Cafe.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw className={isRefreshing ? 'spin-icon' : ''} />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchDashboardData}
              isLoading={isRefreshing}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync Metrics
            </Button>
            <Button
              as={RouterLink}
              to="/admin/orders"
              leftIcon={<FiPlus />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              _hover={{ opacity: 0.9 }}
            >
              Manage Orders
            </Button>
          </HStack>
        </Flex>

        {/* KPI Cards Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
          {/* Card 1: Today's Paid Revenue */}
          <Box
            p={5}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                  Today's Paid Revenue
                </Text>
                {isLoading ? (
                  <Skeleton h="32px" w="120px" my={2} />
                ) : (
                  <Heading fontSize="2xl" color={goldAccent} my={1} fontWeight="700">
                    ₹{(metrics?.today?.paidRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Heading>
                )}
                <Text fontSize="11px" color={mutedColor}>
                  Gross Sales: ₹{(metrics?.today?.grossSales || 0).toFixed(2)}
                </Text>
              </Box>
              <Center
                w={10}
                h={10}
                borderRadius="lg"
                bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
                color={goldAccent}
              >
                <Icon as={FiDollarSign} boxSize={5} />
              </Center>
            </Flex>
          </Box>

          {/* Card 2: Today's Orders */}
          <Box
            p={5}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                  Today's Orders
                </Text>
                {isLoading ? (
                  <Skeleton h="32px" w="80px" my={2} />
                ) : (
                  <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
                    {metrics?.today?.totalOrders || 0}
                  </Heading>
                )}
                <HStack spacing={1} fontSize="11px" color="orange.400">
                  <FiClock />
                  <Text>{metrics?.operationalAlerts?.activeOrders || 0} in active kitchen prep</Text>
                </HStack>
              </Box>
              <Center
                w={10}
                h={10}
                borderRadius="lg"
                bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
                color={goldAccent}
              >
                <Icon as={FiShoppingBag} boxSize={5} />
              </Center>
            </Flex>
          </Box>

          {/* Card 3: Table Capacity */}
          <Box
            p={5}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                  Available Tables
                </Text>
                {isLoading ? (
                  <Skeleton h="32px" w="80px" my={2} />
                ) : (
                  <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
                    {availableTablesCount}
                  </Heading>
                )}
                <Text fontSize="11px" color={mutedColor}>
                  Ready for immediate seating
                </Text>
              </Box>
              <Center
                w={10}
                h={10}
                borderRadius="lg"
                bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
                color={goldAccent}
              >
                <Icon as={MdTableRestaurant} boxSize={5} />
              </Center>
            </Flex>
          </Box>

          {/* Card 4: Reservations & Alerts */}
          <Box
            p={5}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                  Today's Bookings
                </Text>
                {isLoading ? (
                  <Skeleton h="32px" w="80px" my={2} />
                ) : (
                  <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
                    {metrics?.today?.reservations || 0}
                  </Heading>
                )}
                {metrics?.operationalAlerts?.lowStockItems ? (
                  <HStack
                    as={RouterLink}
                    to="/admin/inventory/alerts"
                    spacing={1}
                    fontSize="11px"
                    color="red.400"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    <FiAlertTriangle />
                    <Text>{metrics.operationalAlerts.lowStockItems} low stock ingredient alerts</Text>
                  </HStack>
                ) : (
                  <HStack
                    as={RouterLink}
                    to="/admin/inventory"
                    spacing={1}
                    fontSize="11px"
                    color="green.400"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    <FiCheckCircle />
                    <Text>Stock levels adequate</Text>
                  </HStack>
                )}
              </Box>
              <Center
                w={10}
                h={10}
                borderRadius="lg"
                bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
                color={goldAccent}
              >
                <Icon as={FiCalendar} boxSize={5} />
              </Center>
            </Flex>
          </Box>
        </SimpleGrid>

        {/* Visual Charts Row */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
          {/* Revenue Trend Chart (Spans 2 cols) */}
          <Box
            gridColumn={{ lg: 'span 2' }}
            p={6}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                  Financial Performance
                </Text>
                <Heading fontSize="lg" color={textColor} fontWeight="700">
                  Daily Sales Trend (Last 14 Days)
                </Heading>
              </Box>
              <Button
                as={RouterLink}
                to="/admin/reports"
                size="xs"
                variant="ghost"
                color={goldAccent}
                rightIcon={<FiArrowUpRight />}
              >
                View Detailed Reports
              </Button>
            </Flex>

            <Box h="280px" w="100%">
              {dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={goldAccent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={goldAccent} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke={mutedColor}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      stroke={mutedColor}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#151518',
                        borderColor: borderColor,
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={goldAccent}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goldGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" direction="column" color={mutedColor}>
                  <Text fontSize="sm">No historical sales data recorded yet.</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Order Types Distribution Chart */}
          <Box
            p={6}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Box mb={4}>
              <Text fontSize="xs" fontWeight="600" color={mutedColor} letterSpacing="0.05em" textTransform="uppercase">
                Fulfillment Distribution
              </Text>
              <Heading fontSize="lg" color={textColor} fontWeight="700">
                Order Types
              </Heading>
            </Box>

            <Box h="240px" w="100%">
              {orderAnalytics && orderAnalytics.byType && orderAnalytics.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderAnalytics.byType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {orderAnalytics.byType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#151518',
                        borderColor: borderColor,
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: mutedColor, fontSize: '11px', textTransform: 'capitalize' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" direction="column" color={mutedColor}>
                  <Text fontSize="sm">Awaiting order submissions.</Text>
                </Flex>
              )}
            </Box>

            {/* Quick Summary of Bestsellers */}
            <Box mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" fontWeight="700" color={textColor} mb={2}>
                Top Menu Dishes
              </Text>
              <VStack spacing={2} align="stretch">
                {bestsellers.slice(0, 3).map((item) => (
                  <Flex key={item.menuItemId} justify="space-between" fontSize="12px">
                    <Text color={textColor} fontWeight="500" isTruncated maxW="150px">
                      {item.name}
                    </Text>
                    <Text color={goldAccent} fontWeight="600">
                      {item.totalQuantitySold} sold
                    </Text>
                  </Flex>
                ))}
                {bestsellers.length === 0 && (
                  <Text fontSize="11px" color={mutedColor}>No dish trends recorded yet.</Text>
                )}
              </VStack>
            </Box>
          </Box>
        </SimpleGrid>

        {/* Operational Tables: Recent Orders & Recent Reservations */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Orders Card */}
          <Box
            p={6}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="center" mb={5}>
              <Box>
                <Heading fontSize="md" color={textColor} fontWeight="700">
                  Recent Kitchen Orders
                </Heading>
                <Text fontSize="xs" color={mutedColor}>
                  Real-time incoming customer ticket stream
                </Text>
              </Box>
              <Button
                as={RouterLink}
                to="/admin/orders"
                size="xs"
                variant="outline"
                borderColor={borderColor}
                color={goldAccent}
                rightIcon={<FiArrowUpRight />}
              >
                All Orders
              </Button>
            </Flex>

            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Order #</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Type</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Total</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Status</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentOrders.map((order) => (
                    <Tr key={order._id} _hover={{ bg: innerCardBg }}>
                      <Td fontWeight="600" color={textColor} borderColor={borderColor} py={3}>
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </Td>
                      <Td color={mutedColor} borderColor={borderColor} textTransform="capitalize" py={3}>
                        {order.orderType}
                      </Td>
                      <Td fontWeight="600" color={goldAccent} borderColor={borderColor} py={3}>
                        ₹{order.grandTotal.toFixed(2)}
                      </Td>
                      <Td borderColor={borderColor} py={3}>
                        <Badge
                          colorScheme={getStatusBadgeColor(order.fulfillmentStatus)}
                          variant="subtle"
                          fontSize="10px"
                          borderRadius="sm"
                          textTransform="uppercase"
                        >
                          {order.fulfillmentStatus.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor} textAlign="right" py={3}>
                        <IconButton
                          as={RouterLink}
                          to="/admin/orders"
                          aria-label="View order"
                          icon={<FiExternalLink />}
                          size="xs"
                          variant="ghost"
                          color={mutedColor}
                          _hover={{ color: goldAccent }}
                        />
                      </Td>
                    </Tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={8} color={mutedColor}>
                        No orders recorded today.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Recent Reservations Card */}
          <Box
            p={6}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="center" mb={5}>
              <Box>
                <Heading fontSize="md" color={textColor} fontWeight="700">
                  Upcoming Table Reservations
                </Heading>
                <Text fontSize="xs" color={mutedColor}>
                  Guest schedule and seating assignments
                </Text>
              </Box>
              <Button
                as={RouterLink}
                to="/admin/reservations"
                size="xs"
                variant="outline"
                borderColor={borderColor}
                color={goldAccent}
                rightIcon={<FiArrowUpRight />}
              >
                All Bookings
              </Button>
            </Flex>

            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Guest</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Party</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Time</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}>Status</Th>
                    <Th color={mutedColor} borderColor={borderColor} py={2.5}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentReservations.map((res) => (
                    <Tr key={res._id} _hover={{ bg: innerCardBg }}>
                      <Td fontWeight="600" color={textColor} borderColor={borderColor} py={3}>
                        {res.customerName}
                      </Td>
                      <Td color={mutedColor} borderColor={borderColor} py={3}>
                        {res.guestCount} guests
                      </Td>
                      <Td color={textColor} borderColor={borderColor} py={3}>
                        {res.reservationTime || new Date(res.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Td>
                      <Td borderColor={borderColor} py={3}>
                        <Badge
                          colorScheme={getStatusBadgeColor(res.status)}
                          variant="subtle"
                          fontSize="10px"
                          borderRadius="sm"
                          textTransform="uppercase"
                        >
                          {res.status}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor} textAlign="right" py={3}>
                        <IconButton
                          as={RouterLink}
                          to="/admin/reservations"
                          aria-label="View reservation"
                          icon={<FiExternalLink />}
                          size="xs"
                          variant="ghost"
                          color={mutedColor}
                          _hover={{ color: goldAccent }}
                        />
                      </Td>
                    </Tr>
                  ))}
                  {recentReservations.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={8} color={mutedColor}>
                        No pending reservations recorded.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </AdminLayout>
  );
};

