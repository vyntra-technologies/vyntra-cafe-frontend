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
  Input,
  Select,
  Icon,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  RadioGroup,
  Radio,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingBag,
  FiCreditCard,
  FiSearch,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiPrinter,
  FiArrowRight,
  FiRefreshCw,
  FiFileText,
  FiEye,
  FiPieChart,
  FiClock,
  FiCheck,
  FiCopy,
} from 'react-icons/fi';
import { FaConciergeBell, FaReceipt, FaUtensils } from 'react-icons/fa';
import { MdTableRestaurant } from 'react-icons/md';
import { CashierLayout } from '../../components/staff/CashierLayout';
import {
  StatCard,
  SearchBar,
  FilterDropdown,
  DataTable,
  EmptyState,
  LoadingSkeleton,
  ConfirmationModal,
} from '../../components/staff/StaffCommonUI';
import { OrderDetailsDrawer } from '../../components/staff/OrderDetailsDrawer';
import { STAFF_COLORS } from '../../components/staff/StaffTheme';
import { posService, ShiftSummary, CreatePosOrderPayload } from '../../services/pos.service';
import { menuService } from '../../services/menu.service';
import { categoryService } from '../../services/category.service';
import { tableService } from '../../services/table.service';
import { socketService } from '../../services/socket.service';
import { IMenuItem, ICategory, ITable, IOrder, PaymentMethod } from '../../types';
import toast from '../../utils/toast';

interface PosCartItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  variantName?: string;
  notes?: string;
  taxPercentage: number;
}

export const CashierDashboardPage: React.FC = () => {
  // Master data
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tables, setTables] = useState<ITable[]>([]);
  const [allOrders, setAllOrders] = useState<IOrder[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Drawer & Inspection State
  const [inspectedOrder, setInspectedOrder] = useState<IOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ordersSearchQuery, setOrdersSearchQuery] = useState<string>('');

  // POS Terminal State
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('takeaway');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmittingPosOrder, setIsSubmittingPosOrder] = useState(false);

  // Payment Settlement Modal
  const {
    isOpen: isPayOpen,
    onOpen: onPayOpen,
    onClose: onPayClose,
  } = useDisclosure();
  const [targetOrderForPayment, setTargetOrderForPayment] = useState<IOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderAmount, setTenderAmount] = useState<string>('');
  const [txnRef, setTxnRef] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Receipt Modal
  const {
    isOpen: isReceiptOpen,
    onOpen: onReceiptOpen,
    onClose: onReceiptClose,
  } = useDisclosure();
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<IOrder | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [mRes, cats, tbls, ordersRes, shift] = await Promise.all([
        menuService.getAll({ isAvailable: true, limit: 150 }).then((r) => r.items),
        categoryService.getAll().catch(() => []),
        tableService.getAll().catch(() => []),
        posService.getOrders({ limit: 100 }),
        posService.getShiftSummary().catch(() => null),
      ]);
      setMenuItems(mRes);
      setCategories(cats);
      setTables(tbls);
      setAllOrders(ordersRes.orders || []);
      setShiftSummary(shift);
    } catch (err: any) {
      console.error('Failed to load POS data:', err);
      toast.error('Failed to synchronize cashier data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Socket.io sync
    const onOrderChange = () => {
      fetchData();
    };
    socketService.on('order:created', onOrderChange);
    socketService.on('order:updated', onOrderChange);
    socketService.on('billing:payment-recorded', onOrderChange);

    const interval = setInterval(fetchData, 15000); // 15s polling fallback

    return () => {
      socketService.off('order:created', onOrderChange);
      socketService.off('order:updated', onOrderChange);
      socketService.off('billing:payment-recorded', onOrderChange);
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Unpaid Orders List
  const unpaidOrders = useMemo(() => {
    return allOrders.filter(
      (o) => o.paymentStatus !== 'paid' && o.fulfillmentStatus !== 'cancelled'
    );
  }, [allOrders]);

  // Paid Orders List
  const paidOrders = useMemo(() => {
    return allOrders.filter((o) => o.paymentStatus === 'paid');
  }, [allOrders]);

  // Derived Financial Statistics (Strictly real backend data)
  const stats = useMemo(() => {
    if (shiftSummary) {
      const cash = shiftSummary.methodBreakdown?.cash || 0;
      const online =
        (shiftSummary.methodBreakdown?.card || 0) +
        (shiftSummary.methodBreakdown?.upi || 0) +
        (shiftSummary.methodBreakdown?.online || 0) +
        (shiftSummary.methodBreakdown?.wallet || 0);

      return {
        todaySales: shiftSummary.totalCollected || shiftSummary.netRevenue || 0,
        totalTxns: shiftSummary.totalTransactions || paidOrders.length,
        paidOrdersCount: paidOrders.length,
        pendingPaymentsCount: unpaidOrders.length,
        cashCollection: cash,
        onlineCollection: online,
      };
    }

    // Fallback calculation from actual loaded orders
    const todaySales = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const cashCollection = paidOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const onlineCollection = todaySales - cashCollection;

    return {
      todaySales,
      totalTxns: paidOrders.length,
      paidOrdersCount: paidOrders.length,
      pendingPaymentsCount: unpaidOrders.length,
      cashCollection,
      onlineCollection,
    };
  }, [shiftSummary, paidOrders, unpaidOrders]);

  // POS Cart Management
  const handleAddToCart = (item: IMenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.menuItemId === item._id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          basePrice: item.basePrice,
          quantity: 1,
          taxPercentage: item.taxPercentage ?? 5,
        },
      ];
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity += delta;
      if (next[index].quantity <= 0) {
        return next.filter((_, i) => i !== index);
      }
      return next;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
  const cartDiscountAmount = (cartSubtotal * discountPercent) / 100;
  const cartTax = ((cartSubtotal - cartDiscountAmount) * 5) / 100;
  const cartTotal = cartSubtotal - cartDiscountAmount + cartTax;

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemCategory = typeof item.category === 'object' ? (item.category as any)?.name : item.category;
      const matchesCat = selectedCategory === 'all' || itemCategory === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Submit POS Order
  const handleSubmitPosOrder = async (settleImmediately: boolean = false) => {
    if (orderType === 'dine-in' && !selectedTableId) {
      toast.error('Please select an active table for dine-in');
      return;
    }
    if (cart.length === 0) {
      toast.error('Please add at least 1 menu item to the cart');
      return;
    }

    setIsSubmittingPosOrder(true);
    try {
      const payload: CreatePosOrderPayload = {
        orderType,
        tableId: orderType === 'dine-in' ? selectedTableId : undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          variantName: i.variantName,
          notes: i.notes,
        })),
      };

      const newOrder = await posService.createOrder(payload);

      toast.success(`POS Order #${newOrder.orderNumber} created!`);
      handleClearCart();
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');

      fetchData();

      if (settleImmediately && newOrder._id) {
        setTargetOrderForPayment(newOrder);
        setTenderAmount(String(newOrder.grandTotal));
        onPayOpen();
      } else {
        setActiveTab('bills');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place POS order');
    } finally {
      setIsSubmittingPosOrder(false);
    }
  };

  // Open Payment Settlement Modal for an existing order
  const handleOpenPayment = (order: IOrder) => {
    setTargetOrderForPayment(order);
    setTenderAmount(String(order.grandTotal));
    setTxnRef('');
    setPaymentMethod(order.paymentMethod || 'cash');
    onPayOpen();
  };

  // Process and Settle Payment (With Idempotency Lock)
  const handleProcessPayment = async () => {
    if (!targetOrderForPayment) return;

    if (isProcessingPayment) return; // Idempotency protection

    const parsedTender = parseFloat(tenderAmount);
    if (isNaN(parsedTender) || parsedTender < targetOrderForPayment.grandTotal) {
      if (paymentMethod === 'cash') {
        toast.error(`Tender amount must be at least ₹${targetOrderForPayment.grandTotal.toFixed(2)}`);
        return;
      }
    }

    setIsProcessingPayment(true);
    try {
      await posService.collectPayment(targetOrderForPayment._id, {
        amount: targetOrderForPayment.grandTotal,
        method: paymentMethod,
        transactionReference: txnRef.trim() || undefined,
      });

      toast.success(`Order #${targetOrderForPayment.orderNumber} settled successfully!`);
      onPayClose();

      // Open receipt automatically
      setActiveReceiptOrder({
        ...targetOrderForPayment,
        paymentStatus: 'paid',
        paymentMethod,
      });
      onReceiptOpen();

      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process payment settlement');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <CashierLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <LoadingSkeleton rows={5} />
      </CashierLayout>
    );
  }

  return (
    <CashierLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      unpaidBillsCount={unpaidOrders.length}
    >
      {/* VIEW 1: CASHIER DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <VStack spacing={6} align="stretch">
          {/* 6 Core Financial Stat Cards */}
          <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} spacing={{ base: 3, md: 4 }}>
            <StatCard
              title="Today's Sales"
              value={`₹${stats.todaySales.toFixed(0)}`}
              subtitle="Net Revenue"
              icon={FiDollarSign}
              colorScheme="gold"
              onClick={() => setActiveTab('shift')}
            />
            <StatCard
              title="Transactions"
              value={stats.totalTxns}
              subtitle="Settled Today"
              icon={FiFileText}
              colorScheme="blue"
              onClick={() => setActiveTab('transactions')}
            />
            <StatCard
              title="Paid Orders"
              value={stats.paidOrdersCount}
              subtitle="Cleared Bills"
              icon={FiCheckCircle}
              colorScheme="green"
              onClick={() => setActiveTab('orders')}
            />
            <StatCard
              title="Pending Bills"
              value={stats.pendingPaymentsCount}
              subtitle="Uncollected Dues"
              icon={FiClock}
              colorScheme="red"
              badge={stats.pendingPaymentsCount > 0 ? 'DUE' : undefined}
              onClick={() => setActiveTab('bills')}
            />
            <StatCard
              title="Cash Collection"
              value={`₹${stats.cashCollection.toFixed(0)}`}
              subtitle="In Cash Drawer"
              icon={FiDollarSign}
              colorScheme="yellow"
              onClick={() => setActiveTab('shift')}
            />
            <StatCard
              title="Online / Digital"
              value={`₹${stats.onlineCollection.toFixed(0)}`}
              subtitle="Card & UPI"
              icon={FiCreditCard}
              colorScheme="blue"
              onClick={() => setActiveTab('shift')}
            />
          </SimpleGrid>

          {/* Quick Action Navigation Buttons */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            <Button
              h="auto"
              py={4}
              bg={STAFF_COLORS.primaryGold}
              color="#0B0B0D"
              _hover={{ bg: STAFF_COLORS.lightGold }}
              borderRadius="2xl"
              leftIcon={<FiShoppingBag fontSize="20px" />}
              onClick={() => setActiveTab('pos')}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Open POS Terminal</Text>
                <Text fontSize="10px" opacity="0.8">Punch in new counter order</Text>
              </VStack>
            </Button>

            <Button
              h="auto"
              py={4}
              variant="outline"
              borderColor={STAFF_COLORS.border}
              color={STAFF_COLORS.text}
              _hover={{ borderColor: STAFF_COLORS.primaryGold, bg: STAFF_COLORS.card }}
              borderRadius="2xl"
              leftIcon={<FiDollarSign fontSize="20px" />}
              onClick={() => setActiveTab('bills')}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Settle Unpaid Bills ({unpaidOrders.length})</Text>
                <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>Process guest checkouts</Text>
              </VStack>
            </Button>

            <Button
              h="auto"
              py={4}
              variant="outline"
              borderColor={STAFF_COLORS.border}
              color={STAFF_COLORS.text}
              _hover={{ borderColor: STAFF_COLORS.primaryGold, bg: STAFF_COLORS.card }}
              borderRadius="2xl"
              leftIcon={<FiPieChart fontSize="20px" />}
              onClick={() => setActiveTab('shift')}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Shift Register Report</Text>
                <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>Review cash drawer & totals</Text>
              </VStack>
            </Button>
          </SimpleGrid>

          {/* Quick Settlement Queue Table */}
          <Box
            bg={STAFF_COLORS.card}
            borderWidth="1px"
            borderColor={STAFF_COLORS.border}
            borderRadius="2xl"
            p={5}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={2}>
                <Icon as={FiClock} color={STAFF_COLORS.warning} />
                <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text} textTransform="uppercase">
                  Unpaid Bills Queue ({unpaidOrders.length})
                </Text>
              </HStack>
              <Button size="xs" variant="ghost" color={STAFF_COLORS.primaryGold} onClick={() => setActiveTab('bills')}>
                View All Bills
              </Button>
            </Flex>

            {unpaidOrders.length === 0 ? (
              <EmptyState
                title="All Bills Settled"
                message="There are currently no outstanding unpaid checks."
                icon={FiCheckCircle}
              />
            ) : (
              <DataTable<IOrder>
                columns={[
                  {
                    header: 'Order #',
                    cell: (o) => (
                      <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                        #{o.orderNumber}
                      </Text>
                    ),
                  },
                  {
                    header: 'Table / Mode',
                    cell: (o) => (
                      <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                        {o.orderType === 'dine-in'
                          ? `Table #${o.tableNumber || (o.tableId as any)?.tableNumber || '-'}`
                          : 'Takeaway'}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Customer',
                    cell: (o) => <Text>{o.customerName || 'Walk-in'}</Text>,
                  },
                  {
                    header: 'Amount Due',
                    cell: (o) => (
                      <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontSize="sm">
                        ₹{o.grandTotal?.toFixed(2)}
                      </Text>
                    ),
                  },
                  {
                    header: 'Status',
                    cell: (o) => (
                      <Badge colorScheme="red">UNPAID</Badge>
                    ),
                  },
                  {
                    header: 'Action',
                    align: 'right',
                    cell: (o) => (
                      <Button
                        size="xs"
                        bg={STAFF_COLORS.primaryGold}
                        color="#0B0B0D"
                        _hover={{ bg: STAFF_COLORS.lightGold }}
                        borderRadius="lg"
                        onClick={() => handleOpenPayment(o)}
                      >
                        Settle Payment
                      </Button>
                    ),
                  },
                ]}
                data={unpaidOrders.slice(0, 5)}
              />
            )}
          </Box>
        </VStack>
      )}

      {/* VIEW 2: FULL POS TERMINAL */}
      {activeTab === 'pos' && (
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Left 2 Columns: Food Items & Categories */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack spacing={4} align="stretch">
              {/* Category Filter Pills & Search */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search POS menu catalog..."
                  maxW="300px"
                />

                <Select
                  size="sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  bg={STAFF_COLORS.card}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                  maxW="200px"
                >
                  <option value="all" style={{ background: STAFF_COLORS.sidebar }}>All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name} style={{ background: STAFF_COLORS.sidebar }}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </Flex>

              {/* Items Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={3}>
                {filteredMenuItems.map((item) => {
                  const cartItem = cart.find((c) => c.menuItemId === item._id);
                  const inCartQty = cartItem?.quantity || 0;

                  return (
                    <Box
                      key={item._id}
                      p={3.5}
                      borderRadius="2xl"
                      bg={STAFF_COLORS.card}
                      borderWidth="1px"
                      borderColor={inCartQty > 0 ? STAFF_COLORS.primaryGold : STAFF_COLORS.border}
                      transition="all 0.2s ease"
                      _hover={{ borderColor: STAFF_COLORS.borderGold }}
                    >
                      <Flex justify="space-between" align="flex-start" gap={2}>
                        <Box flex="1">
                          <HStack spacing={1.5} mb={1}>
                            <Badge
                              fontSize="9px"
                              colorScheme={item.isVegetarian ? 'green' : 'red'}
                            >
                              {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                            </Badge>
                          </HStack>

                          <Text fontSize="sm" fontWeight="700" color={STAFF_COLORS.text} noOfLines={1}>
                            {item.name}
                          </Text>

                          <Text fontSize="xs" fontWeight="800" color={STAFF_COLORS.primaryGold} mt={1}>
                            ₹{item.basePrice.toFixed(2)}
                          </Text>
                        </Box>

                        {item.images && item.images.length > 0 && (
                          <Image
                            src={item.images[0]}
                            alt={item.name}
                            w="48px"
                            h="48px"
                            borderRadius="xl"
                            objectFit="cover"
                            fallbackSrc="https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=100&q=80"
                          />
                        )}
                      </Flex>

                      <Button
                        mt={3}
                        size="xs"
                        w="100%"
                        bg={inCartQty > 0 ? STAFF_COLORS.goldSubtle : 'transparent'}
                        variant={inCartQty > 0 ? 'solid' : 'outline'}
                        borderColor={STAFF_COLORS.borderGold}
                        color={STAFF_COLORS.primaryGold}
                        _hover={{ bg: STAFF_COLORS.goldSubtle }}
                        borderRadius="xl"
                        leftIcon={<FiPlus />}
                        onClick={() => handleAddToCart(item)}
                      >
                        {inCartQty > 0 ? `In Cart (${inCartQty}) - Add More` : 'Add to Cart'}
                      </Button>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Right Column: Active POS Cart & Billing Summary */}
          <Box
            bg={STAFF_COLORS.card}
            borderWidth="1px"
            borderColor={STAFF_COLORS.border}
            borderRadius="2xl"
            p={5}
            h="fit-content"
            position="sticky"
            top="80px"
          >
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text} textTransform="uppercase">
                POS Register Cart
              </Text>
              {cart.length > 0 && (
                <Button size="xs" variant="ghost" colorScheme="red" onClick={handleClearCart}>
                  Clear
                </Button>
              )}
            </Flex>

            {/* Order Type Toggle */}
            <HStack spacing={2} mb={3}>
              <Button
                size="xs"
                flex="1"
                borderRadius="xl"
                variant={orderType === 'takeaway' ? 'solid' : 'outline'}
                bg={orderType === 'takeaway' ? STAFF_COLORS.primaryGold : 'transparent'}
                color={orderType === 'takeaway' ? '#0B0B0D' : STAFF_COLORS.secondaryText}
                borderColor={STAFF_COLORS.border}
                onClick={() => setOrderType('takeaway')}
              >
                Takeaway
              </Button>
              <Button
                size="xs"
                flex="1"
                borderRadius="xl"
                variant={orderType === 'dine-in' ? 'solid' : 'outline'}
                bg={orderType === 'dine-in' ? STAFF_COLORS.primaryGold : 'transparent'}
                color={orderType === 'dine-in' ? '#0B0B0D' : STAFF_COLORS.secondaryText}
                borderColor={STAFF_COLORS.border}
                onClick={() => setOrderType('dine-in')}
              >
                Dine-In
              </Button>
            </HStack>

            {/* Table Selection for Dine-in */}
            {orderType === 'dine-in' && (
              <Box mb={3}>
                <Select
                  size="sm"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                >
                  <option value="" style={{ background: STAFF_COLORS.sidebar }}>Select Table...</option>
                  {tables.map((tbl) => (
                    <option key={tbl._id} value={tbl._id} style={{ background: STAFF_COLORS.sidebar }}>
                      Table #{tbl.tableNumber} ({tbl.capacity} Seats)
                    </option>
                  ))}
                </Select>
              </Box>
            )}

            {/* Customer Inputs */}
            <VStack spacing={2} align="stretch" mb={3}>
              <SimpleGrid columns={2} spacing={2}>
                <Input
                  size="sm"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                />
                <Input
                  size="sm"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                />
              </SimpleGrid>
            </VStack>

            <Divider borderColor={STAFF_COLORS.border} mb={3} />

            {/* Items List in Cart */}
            <Box maxH="220px" overflowY="auto" mb={3} pr={1}>
              {cart.length === 0 ? (
                <Box py={6} textAlign="center" borderRadius="xl" bg={STAFF_COLORS.innerCard}>
                  <Text fontSize="xs" color={STAFF_COLORS.mutedText}>
                    Register cart is empty. Add menu items from catalog.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={2} align="stretch">
                  {cart.map((item, idx) => (
                    <Box
                      key={idx}
                      p={2.5}
                      borderRadius="xl"
                      bg={STAFF_COLORS.innerCard}
                      borderWidth="1px"
                      borderColor={STAFF_COLORS.border}
                    >
                      <Flex justify="space-between" align="center">
                        <Box flex="1" pr={2}>
                          <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.text}>
                            {item.name}
                          </Text>
                          <Text fontSize="10px" color={STAFF_COLORS.primaryGold}>
                            ₹{item.basePrice.toFixed(2)} × {item.quantity} = ₹{(item.basePrice * item.quantity).toFixed(2)}
                          </Text>
                        </Box>

                        <HStack spacing={1}>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Minus"
                            icon={<FiMinus />}
                            onClick={() => handleUpdateQty(idx, -1)}
                          />
                          <Text fontSize="xs" fontWeight="800" px={1}>
                            {item.quantity}
                          </Text>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Plus"
                            icon={<FiPlus />}
                            onClick={() => handleUpdateQty(idx, 1)}
                          />
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Remove"
                            icon={<FiTrash2 />}
                            onClick={() => handleRemoveFromCart(idx)}
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Totals Summary */}
            <VStack spacing={1.5} align="stretch" fontSize="xs" mb={4}>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Subtotal</Text>
                <Text color={STAFF_COLORS.text}>₹{cartSubtotal.toFixed(2)}</Text>
              </Flex>
              {cartDiscountAmount > 0 && (
                <Flex justify="space-between" color={STAFF_COLORS.success}>
                  <Text>Discount ({discountPercent}%)</Text>
                  <Text>-₹{cartDiscountAmount.toFixed(2)}</Text>
                </Flex>
              )}
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Taxes (CGST/SGST 5%)</Text>
                <Text color={STAFF_COLORS.text}>₹{cartTax.toFixed(2)}</Text>
              </Flex>
              <Divider borderColor={STAFF_COLORS.border} my={1} />
              <Flex justify="space-between" fontSize="sm">
                <Text fontWeight="800" color={STAFF_COLORS.text}>Grand Total</Text>
                <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontSize="md">
                  ₹{cartTotal.toFixed(2)}
                </Text>
              </Flex>
            </VStack>

            {/* Actions */}
            <VStack spacing={2} align="stretch">
              <Button
                bg={STAFF_COLORS.primaryGold}
                color="#0B0B0D"
                _hover={{ bg: STAFF_COLORS.lightGold }}
                borderRadius="xl"
                size="sm"
                onClick={() => handleSubmitPosOrder(true)}
                isLoading={isSubmittingPosOrder}
                isDisabled={cart.length === 0}
              >
                Pay & Settle Instantly
              </Button>

              <Button
                variant="outline"
                borderColor={STAFF_COLORS.border}
                borderRadius="xl"
                size="sm"
                onClick={() => handleSubmitPosOrder(false)}
                isLoading={isSubmittingPosOrder}
                isDisabled={cart.length === 0}
              >
                Create Order (Unpaid)
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      )}

      {/* VIEW 3: ACTIVE UNPAID BILLS */}
      {activeTab === 'bills' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Heading size="sm" color={STAFF_COLORS.text}>
                Active Unpaid Bills ({unpaidOrders.length})
              </Heading>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                Select an order to collect payment and generate the customer tax receipt.
              </Text>
            </Box>
            <Badge colorScheme="red" px={3} py={1} borderRadius="full">
              {unpaidOrders.length} Pending
            </Badge>
          </Flex>

          <DataTable<IOrder>
            columns={[
              {
                header: 'Order #',
                cell: (o) => (
                  <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                    #{o.orderNumber}
                  </Text>
                ),
              },
              {
                header: 'Table / Mode',
                cell: (o) => (
                  <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                    {o.orderType === 'dine-in'
                      ? `Table #${o.tableNumber || (o.tableId as any)?.tableNumber || '-'}`
                      : 'Takeaway'}
                  </Badge>
                ),
              },
              {
                header: 'Customer',
                cell: (o) => <Text>{o.customerName || 'Walk-in'}</Text>,
              },
              {
                header: 'Items',
                cell: (o) => (
                  <Text fontSize="xs" noOfLines={1} maxW="280px">
                    {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </Text>
                ),
              },
              {
                header: 'Total Amount',
                cell: (o) => (
                  <Text fontWeight="800" color={STAFF_COLORS.primaryGold}>
                    ₹{o.grandTotal?.toFixed(2)}
                  </Text>
                ),
              },
              {
                header: 'Payment Status',
                cell: (o) => <Badge colorScheme="red">UNPAID</Badge>,
              },
              {
                header: 'Actions',
                align: 'right',
                cell: (o) => (
                  <HStack spacing={2} justify="flex-end">
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
                    <Button
                      size="xs"
                      bg={STAFF_COLORS.primaryGold}
                      color="#0B0B0D"
                      _hover={{ bg: STAFF_COLORS.lightGold }}
                      borderRadius="lg"
                      onClick={() => handleOpenPayment(o)}
                    >
                      Process Payment
                    </Button>
                  </HStack>
                ),
              },
            ]}
            data={unpaidOrders}
            emptyMessage="Zero unpaid checks. All orders have been settled."
          />
        </VStack>
      )}

      {/* VIEW 4: ALL ORDERS RECORD */}
      {activeTab === 'orders' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchBar
              value={ordersSearchQuery}
              onChange={setOrdersSearchQuery}
              placeholder="Search by order # or guest..."
              maxW="300px"
            />
            <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
              Total {allOrders.length} orders
            </Text>
          </Flex>

          <DataTable<IOrder>
            columns={[
              {
                header: 'Order #',
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
                header: 'Destination',
                cell: (o) => (
                  <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                    {o.orderType === 'dine-in' ? `Table #${o.tableNumber || '-'}` : 'Takeaway'}
                  </Badge>
                ),
              },
              {
                header: 'Total',
                cell: (o) => <Text fontWeight="700">₹{o.grandTotal?.toFixed(2)}</Text>,
              },
              {
                header: 'Payment Status',
                cell: (o) => (
                  <Badge colorScheme={o.paymentStatus === 'paid' ? 'green' : 'red'}>
                    {o.paymentStatus.toUpperCase()}
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
                    View
                  </Button>
                ),
              },
            ]}
            data={allOrders.filter(
              (o) =>
                !ordersSearchQuery ||
                o.orderNumber.includes(ordersSearchQuery) ||
                (o.customerName && o.customerName.toLowerCase().includes(ordersSearchQuery.toLowerCase()))
            )}
            emptyMessage="No orders found."
          />
        </VStack>
      )}

      {/* VIEW 5: TRANSACTIONS AUDIT */}
      {activeTab === 'transactions' && (
        <VStack spacing={4} align="stretch">
          <Heading size="sm" color={STAFF_COLORS.text}>
            Audit Payment Transactions ({paidOrders.length})
          </Heading>

          <DataTable<IOrder>
            columns={[
              {
                header: 'Order Reference',
                cell: (o) => (
                  <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                    #{o.orderNumber}
                  </Text>
                ),
              },
              {
                header: 'Settlement Time',
                cell: (o) => (
                  <Text fontSize="xs">
                    {new Date(o.updatedAt || o.createdAt).toLocaleString('en-IN')}
                  </Text>
                ),
              },
              {
                header: 'Method',
                cell: (o) => (
                  <Badge colorScheme="yellow" textTransform="uppercase">
                    {o.paymentMethod}
                  </Badge>
                ),
              },
              {
                header: 'Amount Collected',
                cell: (o) => (
                  <Text fontWeight="800" color={STAFF_COLORS.success}>
                    ₹{o.grandTotal?.toFixed(2)}
                  </Text>
                ),
              },
              {
                header: 'Status',
                cell: () => <Badge colorScheme="green">CLEARED</Badge>,
              },
              {
                header: 'Receipt',
                align: 'right',
                cell: (o) => (
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor={STAFF_COLORS.border}
                    leftIcon={<FaReceipt />}
                    onClick={() => {
                      setActiveReceiptOrder(o);
                      onReceiptOpen();
                    }}
                  >
                    Receipt
                  </Button>
                ),
              },
            ]}
            data={paidOrders}
            emptyMessage="No transaction logs recorded yet today."
          />
        </VStack>
      )}

      {/* VIEW 6: RECEIPTS & INVOICE LOOKUP */}
      {activeTab === 'receipts' && (
        <VStack spacing={4} align="stretch">
          <Heading size="sm" color={STAFF_COLORS.text}>
            Receipts & Tax Invoices
          </Heading>

          <DataTable<IOrder>
            columns={[
              {
                header: 'Order #',
                cell: (o) => (
                  <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                    #{o.orderNumber}
                  </Text>
                ),
              },
              {
                header: 'Date',
                cell: (o) => (
                  <Text fontSize="xs">
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                ),
              },
              {
                header: 'Customer',
                cell: (o) => <Text>{o.customerName || 'Walk-in'}</Text>,
              },
              {
                header: 'Total',
                cell: (o) => <Text fontWeight="700">₹{o.grandTotal?.toFixed(2)}</Text>,
              },
              {
                header: 'Status',
                cell: (o) => (
                  <Badge colorScheme={o.paymentStatus === 'paid' ? 'green' : 'orange'}>
                    {o.paymentStatus.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Invoice',
                align: 'right',
                cell: (o) => (
                  <Button
                    size="xs"
                    bg={STAFF_COLORS.primaryGold}
                    color="#0B0B0D"
                    _hover={{ bg: STAFF_COLORS.lightGold }}
                    leftIcon={<FiPrinter />}
                    onClick={() => {
                      setActiveReceiptOrder(o);
                      onReceiptOpen();
                    }}
                  >
                    Print Receipt
                  </Button>
                ),
              },
            ]}
            data={allOrders}
            emptyMessage="No orders found."
          />
        </VStack>
      )}

      {/* VIEW 7: SHIFT REGISTER SUMMARY */}
      {activeTab === 'shift' && (
        <VStack spacing={6} align="stretch" maxW="3xl">
          <Box p={6} borderRadius="2xl" bg={STAFF_COLORS.card} borderWidth="1px" borderColor={STAFF_COLORS.border}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="md" color={STAFF_COLORS.primaryGold} fontFamily="heading">
                  Shift Register Summary
                </Heading>
                <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                  Audit trail and cash reconciliation for current register drawer.
                </Text>
              </Box>
              <Button size="xs" colorScheme="yellow" leftIcon={<FiPrinter />} onClick={handlePrintReceipt}>
                Print Shift Report
              </Button>
            </Flex>

            <Divider borderColor={STAFF_COLORS.border} mb={4} />

            <VStack spacing={3} align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Total Shift Revenue</Text>
                <Text fontWeight="800" color={STAFF_COLORS.text} fontSize="md">
                  ₹{stats.todaySales.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Cash in Drawer</Text>
                <Text fontWeight="800" color={STAFF_COLORS.primaryGold}>
                  ₹{stats.cashCollection.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Digital & Card Revenue</Text>
                <Text fontWeight="800" color="blue.400">
                  ₹{stats.onlineCollection.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Cleared Transactions</Text>
                <Text fontWeight="700">{stats.totalTxns} orders</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Uncollected Pending Dues</Text>
                <Text fontWeight="700" color="red.400">{stats.pendingPaymentsCount} orders</Text>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      )}

      {/* Payment Settlement Modal (With Idempotency Lock) */}
      <Modal isOpen={isPayOpen} onClose={onPayClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.8)" />
        <ModalContent
          bg={STAFF_COLORS.sidebar}
          borderColor={STAFF_COLORS.border}
          borderWidth="1px"
          borderRadius="2xl"
          color={STAFF_COLORS.text}
        >
          <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} fontSize="md">
            Settle Check: Order #{targetOrderForPayment?.orderNumber}
          </ModalHeader>
          <ModalCloseButton color={STAFF_COLORS.secondaryText} />
          <ModalBody py={5}>
            <VStack spacing={4} align="stretch">
              <Box p={3} borderRadius="xl" bg={STAFF_COLORS.card} borderWidth="1px" borderColor={STAFF_COLORS.border}>
                <Flex justify="space-between" align="baseline">
                  <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>Grand Total Due</Text>
                  <Text fontSize="xl" fontWeight="900" color={STAFF_COLORS.primaryGold}>
                    ₹{targetOrderForPayment?.grandTotal.toFixed(2)}
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.secondaryText} mb={2}>
                  Payment Method:
                </Text>
                <RadioGroup value={paymentMethod} onChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                  <Stack direction="row" spacing={4}>
                    <Radio value="cash" colorScheme="yellow">Cash</Radio>
                    <Radio value="card" colorScheme="yellow">Card</Radio>
                    <Radio value="upi" colorScheme="yellow">UPI / QR</Radio>
                    <Radio value="wallet" colorScheme="yellow">Wallet</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              {paymentMethod === 'cash' ? (
                <Box>
                  <Text fontSize="xs" color={STAFF_COLORS.secondaryText} mb={1}>
                    Tender Cash Received (₹):
                  </Text>
                  <Input
                    size="sm"
                    value={tenderAmount}
                    onChange={(e) => setTenderAmount(e.target.value)}
                    bg={STAFF_COLORS.innerCard}
                    borderColor={STAFF_COLORS.border}
                    borderRadius="xl"
                    color={STAFF_COLORS.text}
                  />
                  {parseFloat(tenderAmount) >= (targetOrderForPayment?.grandTotal || 0) && (
                    <Text fontSize="xs" color={STAFF_COLORS.success} mt={1} fontWeight="700">
                      Change to Return: ₹{(parseFloat(tenderAmount) - (targetOrderForPayment?.grandTotal || 0)).toFixed(2)}
                    </Text>
                  )}
                </Box>
              ) : (
                <Box>
                  <Text fontSize="xs" color={STAFF_COLORS.secondaryText} mb={1}>
                    Transaction Reference / Auth Code:
                  </Text>
                  <Input
                    size="sm"
                    placeholder="e.g. UPI Ref / POS Terminal Slip #"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    bg={STAFF_COLORS.innerCard}
                    borderColor={STAFF_COLORS.border}
                    borderRadius="xl"
                    color={STAFF_COLORS.text}
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border}>
            <Button variant="ghost" color={STAFF_COLORS.secondaryText} mr={3} onClick={onPayClose} size="sm">
              Cancel
            </Button>
            <Button
              bg={STAFF_COLORS.primaryGold}
              color="#0B0B0D"
              _hover={{ bg: STAFF_COLORS.lightGold }}
              borderRadius="xl"
              size="sm"
              onClick={handleProcessPayment}
              isLoading={isProcessingPayment}
            >
              Confirm Settlement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Official Tax Invoice & Thermal Receipt Modal */}
      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.8)" />
        <ModalContent
          bg={STAFF_COLORS.sidebar}
          borderColor={STAFF_COLORS.border}
          borderWidth="1px"
          borderRadius="2xl"
          color={STAFF_COLORS.text}
        >
          <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} className="no-print">
            <Flex justify="space-between" align="center">
              <Text fontSize="md">Customer Tax Invoice Receipt</Text>
              <Button size="xs" colorScheme="yellow" leftIcon={<FiPrinter />} onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            </Flex>
          </ModalHeader>
          <ModalCloseButton className="no-print" color={STAFF_COLORS.secondaryText} />
          <ModalBody py={5}>
            {activeReceiptOrder && (
              <Box id="printable-order-receipt" p={3} bg="#FFFFFF" color="#0B0B0D" borderRadius="xl">
                <VStack spacing={3} align="stretch" textAlign="center">
                  <Box borderBottomWidth="2px" borderColor="#000000" pb={2}>
                    <Text fontWeight="900" fontSize="lg" letterSpacing="widest">
                      VYNTRA CAFE
                    </Text>
                    <Text fontSize="10px" textTransform="uppercase">
                      Haute Gastronomie & Artisanal Roastery
                    </Text>
                    <Text fontSize="9px">GSTIN: 29AABCU9603R1ZV • Ph: +91 98765 43210</Text>
                  </Box>

                  <SimpleGrid columns={2} spacing={1} fontSize="xs" textAlign="left" pt={1}>
                    <Text>Order #{activeReceiptOrder.orderNumber}</Text>
                    <Text textAlign="right">{new Date(activeReceiptOrder.createdAt).toLocaleDateString('en-IN')}</Text>
                    <Text>Mode: {activeReceiptOrder.orderType.toUpperCase()}</Text>
                    <Text textAlign="right">Table: {activeReceiptOrder.tableNumber || 'Takeaway'}</Text>
                  </SimpleGrid>

                  <Table size="sm" variant="simple" my={1}>
                    <Thead>
                      <Tr borderBottomWidth="1px" borderColor="#000000">
                        <Th color="#000000" px={1} fontSize="10px">Item</Th>
                        <Th color="#000000" px={1} textAlign="center" fontSize="10px">Qty</Th>
                        <Th color="#000000" px={1} textAlign="right" fontSize="10px">Rate</Th>
                        <Th color="#000000" px={1} textAlign="right" fontSize="10px">Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {activeReceiptOrder.items?.map((it, idx) => (
                        <Tr key={idx} borderBottomWidth="1px" borderColor="#EEEEEE">
                          <Td px={1} py={1} fontSize="11px" fontWeight="600">{it.name}</Td>
                          <Td px={1} textAlign="center" fontSize="11px">{it.quantity}</Td>
                          <Td px={1} textAlign="right" fontSize="11px">₹{(it.unitPrice || it.basePrice).toFixed(2)}</Td>
                          <Td px={1} textAlign="right" fontSize="11px" fontWeight="700">₹{it.itemTotal.toFixed(2)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <VStack spacing={1} align="stretch" fontSize="xs" pt={1} textAlign="left">
                    <Flex justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text fontWeight="600">₹{activeReceiptOrder.subtotal?.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>GST Taxes (5%):</Text>
                      <Text fontWeight="600">₹{activeReceiptOrder.taxAmount?.toFixed(2)}</Text>
                    </Flex>
                    <Divider borderColor="#000000" my={1} />
                    <Flex justify="space-between" fontSize="sm" fontWeight="900">
                      <Text>GRAND TOTAL:</Text>
                      <Text>₹{activeReceiptOrder.grandTotal?.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="xs">
                      <Text>Settled Via:</Text>
                      <Text textTransform="uppercase">{activeReceiptOrder.paymentMethod} - PAID</Text>
                    </Flex>
                  </VStack>

                  <Box pt={3} borderTopWidth="1px" borderColor="#EEEEEE">
                    <Text fontSize="10px" fontWeight="700">
                      Thank You For Visiting Vyntra Cafe!
                    </Text>
                  </Box>
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border} className="no-print">
            <Button variant="ghost" onClick={onReceiptClose} size="sm">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Shared Order Details Drawer */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={inspectedOrder}
        role="cashier"
        onAction={(action, ord) => {
          if (action === 'process_payment') {
            handleOpenPayment(ord);
            setIsDrawerOpen(false);
          }
        }}
      />

      {/* Thermal & Page Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-order-receipt, #printable-order-receipt * {
            visibility: visible !important;
          }
          #printable-order-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            padding: 16px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </CashierLayout>
  );
};
