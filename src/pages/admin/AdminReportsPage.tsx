import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Input,
  Select,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingBag,
  FiPercent,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiBox,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import {
  ISalesSummary,
  IDailySales,
  IBestsellerItem,
  IOrderAnalytics,
  IPaymentSummary,
} from '../../types';

const COLORS = ['#D4AF37', '#A47A3C', '#E5A93C', '#8C6226', '#F5D77F', '#C29B38'];

export const AdminReportsPage: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState<ISalesSummary | null>(null);
  const [dailySales, setDailySales] = useState<IDailySales[]>([]);
  const [bestsellers, setBestsellers] = useState<IBestsellerItem[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<IOrderAnalytics | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<IPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Date Range Controls
  const [periodPreset, setPeriodPreset] = useState<string>('30');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const days = periodPreset === 'custom' ? undefined : parseInt(periodPreset) || 30;

      const [summary, daily, topDishes, ordersAna, payments] = await Promise.all([
        reportService.getSalesSummary(startDate || undefined, endDate || undefined),
        reportService.getDailySales(days || 30),
        reportService.getBestsellers(8, startDate || undefined, endDate || undefined),
        reportService.getOrderAnalytics(startDate || undefined, endDate || undefined),
        reportService.getPaymentSummary(startDate || undefined, endDate || undefined),
      ]);

      setSalesSummary(summary);
      setDailySales(daily);
      setBestsellers(topDishes);
      setOrderAnalytics(ordersAna);
      setPaymentSummary(payments);
    } catch (err: any) {
      toast({
        title: 'Error loading analytics',
        description: err?.response?.data?.message || 'Could not fetch backend report data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (periodPreset !== 'custom') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - parseInt(periodPreset));
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [periodPreset]);

  useEffect(() => {
    fetchReports();
  }, [periodPreset]);

  const exportCSV = () => {
    if (dailySales.length === 0) {
      toast({ title: 'No data to export', status: 'warning', duration: 2000 });
      return;
    }

    const headers = 'Date,Order Count,Paid Order Count,Gross Sales,Discounts,Tax Collected,Revenue\n';
    const rows = dailySales
      .map(
        (d) =>
          `${d.date},${d.orderCount},${d.paidOrderCount},${d.grossSales},${d.discounts},${d.taxCollected},${d.revenue}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vyntra_Cafe_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout pageTitle="Financial Reports & Analytics">
      <Box>
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
              Business Intelligence & Auditing
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Aggregated accounting analytics, payment methods, and revenue performance.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/admin/inventory/reports"
              leftIcon={<FiBox />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
            >
              Inventory Valuation
            </Button>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={exportCSV}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Export CSV
            </Button>
            <Button
              leftIcon={<FiRefreshCw />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              _hover={{ opacity: 0.9 }}
              onClick={fetchReports}
            >
              Recalculate
            </Button>
          </HStack>
        </Flex>

        {/* Date Filter Bar */}
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align={{ base: 'stretch', md: 'center' }}
          >
            <Select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value)}
              size="sm"
              maxW={{ base: '100%', md: '200px' }}
              bg={innerCardBg}
              borderColor={borderColor}
              color={textColor}
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="custom">Custom Date Range</option>
            </Select>

            {periodPreset === 'custom' && (
              <HStack spacing={2} flex={1}>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="sm"
                  bg={innerCardBg}
                  borderColor={borderColor}
                  color={textColor}
                />
                <Text fontSize="xs" color={mutedColor}>to</Text>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="sm"
                  bg={innerCardBg}
                  borderColor={borderColor}
                  color={textColor}
                />
                <Button
                  size="sm"
                  bg={goldAccent}
                  color="black"
                  onClick={fetchReports}
                >
                  Apply
                </Button>
              </HStack>
            )}
          </Flex>
        </Box>

        {/* Sales KPI Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
          <Box p={5} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
              Paid Revenue
            </Text>
            <Heading fontSize="2xl" color={goldAccent} my={1} fontWeight="700">
              ₹{(salesSummary?.metrics?.paidRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Heading>
            <Text fontSize="11px" color={mutedColor}>
              From {salesSummary?.metrics?.paidOrders || 0} paid customer orders
            </Text>
          </Box>

          <Box p={5} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
              Net Sales
            </Text>
            <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
              ₹{(salesSummary?.metrics?.netSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Heading>
            <Text fontSize="11px" color={mutedColor}>
              Gross ₹{(salesSummary?.metrics?.grossSales || 0).toFixed(2)} - Discounts ₹{(salesSummary?.metrics?.totalDiscounts || 0).toFixed(2)}
            </Text>
          </Box>

          <Box p={5} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
              Average Order Value
            </Text>
            <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
              ₹{(salesSummary?.metrics?.averageOrderValue || 0).toFixed(2)}
            </Heading>
            <Text fontSize="11px" color={mutedColor}>
              Average per ticket settlement
            </Text>
          </Box>

          <Box p={5} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
              Tax Collected (GST)
            </Text>
            <Heading fontSize="2xl" color={textColor} my={1} fontWeight="700">
              ₹{(salesSummary?.metrics?.totalTaxCollected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Heading>
            <Text fontSize="11px" color={mutedColor}>
              Compliant accounting audit balance
            </Text>
          </Box>
        </SimpleGrid>

        {/* Visual Analytics Charts */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
          {/* Daily Sales Revenue Trend */}
          <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
              Daily Settlement & Revenue Trajectory
            </Heading>
            <Box h="280px" w="100%">
              {dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySales}>
                    <defs>
                      <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={goldAccent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={goldAccent} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
                    <XAxis dataKey="date" stroke={mutedColor} fontSize={10} tickFormatter={(d) => d.slice(5)} />
                    <YAxis stroke={mutedColor} fontSize={10} tickFormatter={(v) => `₹${v}`} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#151518', borderColor, borderRadius: '8px', color: '#FFF' }}
                      formatter={(v: any) => [`₹${v}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={goldAccent} strokeWidth={2.5} fill="url(#areaGold)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" color={mutedColor}>
                  <Text fontSize="sm">No sales figures recorded for period.</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Bestseller Dishes Bar Chart */}
          <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
              Top Revenue Generating Dishes
            </Heading>
            <Box h="280px" w="100%">
              {bestsellers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bestsellers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} horizontal={false} />
                    <XAxis type="number" stroke={mutedColor} fontSize={10} tickFormatter={(v) => `₹${v}`} />
                    <YAxis dataKey="name" type="category" stroke={mutedColor} fontSize={10} width={90} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#151518', borderColor, borderRadius: '8px', color: '#FFF' }}
                      formatter={(v: any) => [`₹${v}`, 'Total Revenue']}
                    />
                    <Bar dataKey="totalRevenue" fill={goldAccent} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" color={mutedColor}>
                  <Text fontSize="sm">Awaiting menu sales.</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Payment Method Breakdown */}
          <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
              Payment Methods Breakdown
            </Heading>
            <Box h="240px" w="100%">
              {paymentSummary && paymentSummary.byMethod && paymentSummary.byMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentSummary.byMethod}
                      dataKey="totalAmount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                    >
                      {paymentSummary.byMethod.map((_, i) => (
                        <Cell key={`pm-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#151518', borderColor, borderRadius: '8px', color: '#FFF' }}
                      formatter={(v: any) => [`₹${v}`, 'Collected']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span style={{ color: mutedColor, fontSize: '11px', textTransform: 'capitalize' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" color={mutedColor}>
                  <Text fontSize="sm">No payment transactions recorded.</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Dining vs Takeaway Distribution */}
          <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
              Channel Revenue Contribution
            </Heading>
            <Box h="240px" w="100%">
              {orderAnalytics && orderAnalytics.byType && orderAnalytics.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderAnalytics.byType}
                      dataKey="revenue"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                    >
                      {orderAnalytics.byType.map((_, i) => (
                        <Cell key={`ot-${i}`} fill={COLORS[(i + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#151518', borderColor, borderRadius: '8px', color: '#FFF' }}
                      formatter={(v: any) => [`₹${v}`, 'Revenue']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span style={{ color: mutedColor, fontSize: '11px', textTransform: 'capitalize' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Flex h="100%" justify="center" align="center" color={mutedColor}>
                  <Text fontSize="sm">No channel orders recorded.</Text>
                </Flex>
              )}
            </Box>
          </Box>
        </SimpleGrid>

        {/* Tabular Audit Breakdown */}
        <Box
          p={6}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
            Audit Ledger (Daily Accounting)
          </Heading>

          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color={mutedColor} borderColor={borderColor}>Settlement Date</Th>
                  <Th color={mutedColor} borderColor={borderColor}>Orders Count</Th>
                  <Th color={mutedColor} borderColor={borderColor}>Paid Orders</Th>
                  <Th color={mutedColor} borderColor={borderColor}>Gross Sales</Th>
                  <Th color={mutedColor} borderColor={borderColor}>Discounts</Th>
                  <Th color={mutedColor} borderColor={borderColor}>Tax (GST)</Th>
                  <Th color={mutedColor} borderColor={borderColor} textAlign="right">Net Revenue</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8}><Spinner color={goldAccent} /></Td>
                  </Tr>
                ) : dailySales.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8} color={mutedColor}>No historical ledger rows available.</Td>
                  </Tr>
                ) : (
                  dailySales.map((row) => (
                    <Tr key={row.date} _hover={{ bg: innerCardBg }}>
                      <Td fontWeight="600" color={textColor} borderColor={borderColor}>{row.date}</Td>
                      <Td color={mutedColor} borderColor={borderColor}>{row.orderCount}</Td>
                      <Td color={mutedColor} borderColor={borderColor}>{row.paidOrderCount}</Td>
                      <Td color={textColor} borderColor={borderColor}>₹{row.grossSales.toFixed(2)}</Td>
                      <Td color="green.400" borderColor={borderColor}>-₹{row.discounts.toFixed(2)}</Td>
                      <Td color={mutedColor} borderColor={borderColor}>₹{row.taxCollected.toFixed(2)}</Td>
                      <Td fontWeight="700" color={goldAccent} borderColor={borderColor} textAlign="right">
                        ₹{row.revenue.toFixed(2)}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </AdminLayout>
  );
};

