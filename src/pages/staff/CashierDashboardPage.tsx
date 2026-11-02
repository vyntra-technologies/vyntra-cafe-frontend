import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Grid,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  Card,
  CardBody,
  Input,
  Select,
  useColorModeValue,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingBag,
  FiCoffee,
  FiCreditCard,
  FiSearch,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiPrinter,
  FiArrowRight,
  FiRefreshCw,
  FiPercent,
  FiFileText,
} from 'react-icons/fi';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { posService, ShiftSummary, CreatePosOrderPayload } from '../../services/pos.service';
import { menuService } from '../../services/menu.service';
import { categoryService } from '../../services/category.service';
import { tableService } from '../../services/table.service';
import { socketService } from '../../services/socket.service';
import { IMenuItem, ICategory, ITable, IOrder, PaymentMethod } from '../../types';
import toast from 'react-hot-toast';

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
  const [pendingOrders, setPendingOrders] = useState<IOrder[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // POS Cart State
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('takeaway');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Payment Settlement Modal
  const {
    isOpen: isPayOpen,
    onOpen: onPayOpen,
    onClose: onPayClose,
  } = useDisclosure();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderAmount, setTenderAmount] = useState<string>('');
  const [txnRef, setTxnRef] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [targetOrderForPayment, setTargetOrderForPayment] = useState<IOrder | null>(null);

  // Receipt Modal
  const {
    isOpen: isReceiptOpen,
    onOpen: onReceiptOpen,
    onClose: onReceiptClose,
  } = useDisclosure();
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Theme tokens
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)');
  const mutedCol = useColorModeValue('#6B7280', '#9CA3AF');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');

  const fetchData = useCallback(async () => {
    try {
      const [mRes, cats, tbls, pendingRes, shift] = await Promise.all([
        menuService.getAll({ isAvailable: true, limit: 150 }),
        categoryService.getAll().catch(() => []),
        tableService.getAll().catch(() => []),
        posService.getOrders({ paymentStatus: 'pending', limit: 50 }).catch(() => ({ orders: [] })),
        posService.getShiftSummary().catch(() => null),
      ]);

      setMenuItems(mRes.items);
      setCategories(cats);
      setTables(tbls);
      setPendingOrders(pendingRes.orders);
      if (shift) setShiftSummary(shift);
    } catch (err) {
      console.error('Failed to sync POS terminal data:', err);
      toast.error('Failed to load POS catalog');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const onOrderChange = () => {
      fetchData();
    };
    socketService.on('order:created', onOrderChange);
    socketService.on('order:updated', onOrderChange);
    socketService.on('billing:payment-recorded', onOrderChange);

    return () => {
      socketService.off('order:created', onOrderChange);
      socketService.off('order:updated', onOrderChange);
      socketService.off('billing:payment-recorded', onOrderChange);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Cart operations
  const addToCart = (item: IMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          basePrice: item.basePrice,
          quantity: 1,
          taxPercentage: item.taxPercentage || 5,
        },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedTableId('');
    setOrderNotes('');
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  // 5% standard restaurant GST/tax
  const taxAmount = parseFloat((discountedSubtotal * 0.05).toFixed(2));
  const grandTotal = parseFloat((discountedSubtotal + taxAmount).toFixed(2));

  // Payment triggers
  const handleCheckoutNewOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (orderType === 'dine-in' && !selectedTableId) {
      toast.error('Please select an active table for dine-in');
      return;
    }
    setTargetOrderForPayment(null);
    setTenderAmount(grandTotal.toString());
    setPaymentMethod('cash');
    setTxnRef('');
    onPayOpen();
  };

  const handlePayExistingOrder = (order: IOrder) => {
    setTargetOrderForPayment(order);
    setTenderAmount(order.grandTotal.toString());
    setPaymentMethod('cash');
    setTxnRef('');
    onPayOpen();
  };

  const handleProcessSettlement = async () => {
    const payAmt = parseFloat(tenderAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessingPayment(true);
    try {
      let orderIdToBill = targetOrderForPayment?._id;

      // If this is a newly created order from POS cart
      if (!orderIdToBill) {
        const payload: CreatePosOrderPayload = {
          orderType,
          tableId: orderType === 'dine-in' ? selectedTableId : undefined,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          notes: orderNotes.trim() || undefined,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes,
          })),
        };

        const newOrder = await posService.createOrder(payload);
        orderIdToBill = newOrder._id;

        // Apply discount if provided
        if (discountPercent > 0) {
          await posService.applyDiscount(orderIdToBill, {
            discountType: 'percentage',
            discountValue: discountPercent,
            reason: `Cashier discount (${discountPercent}%)`,
          }).catch(() => {});
        }
      }

      // Collect Payment
      await posService.collectPayment(orderIdToBill, {
        amount: payAmt,
        method: paymentMethod,
        transactionReference: txnRef.trim() || undefined,
      });

      // Fetch official receipt
      const receipt = await posService.getReceipt(orderIdToBill).catch(() => null);
      if (receipt) {
        setReceiptData(receipt);
      }

      toast.success('Payment successfully recorded & bill settled!');
      onPayClose();

      if (!targetOrderForPayment) {
        clearCart();
      }

      if (receipt) {
        onReceiptOpen();
      }

      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Payment processing failed';
      toast.error(msg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Change calculator
  const tenderNumber = parseFloat(tenderAmount) || 0;
  const currentTotal = targetOrderForPayment ? targetOrderForPayment.grandTotal : grandTotal;
  const changeDue = Math.max(0, tenderNumber - currentTotal);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      (typeof item.category === 'object'
        ? item.category._id === selectedCategory
        : item.category === selectedCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <StaffLayout
      terminalName="Cashier POS Terminal"
      terminalBadge="Point of Sale & Billing"
      badgeColor="green"
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
    >
      {/* Shift Revenue Strip */}
      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Shift Total Sales
            </Text>
            <Heading size="lg" color={gold}>
              ₹{(shiftSummary?.totalCollected ?? 0).toFixed(2)}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Cash Drawer
            </Text>
            <Heading size="lg" color="green.400">
              ₹{(shiftSummary?.methodBreakdown?.cash ?? 0).toFixed(2)}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              UPI / QR
            </Text>
            <Heading size="lg" color="teal.400">
              ₹{(shiftSummary?.methodBreakdown?.upi ?? 0).toFixed(2)}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Card POS
            </Text>
            <Heading size="lg" color="blue.400">
              ₹{(shiftSummary?.methodBreakdown?.card ?? 0).toFixed(2)}
            </Heading>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
              Pending Bills
            </Text>
            <Heading size="lg" color="red.400">
              {pendingOrders.length}
            </Heading>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Terminal Tabs */}
      <Tabs colorScheme="green" variant="enclosed">
        <TabList borderBottom="1px solid" borderColor={borderCol} mb={4}>
          <Tab fontWeight="bold" fontSize="sm">
            POS Register (New Ticket)
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            Unsettled Tables & Bills ({pendingOrders.length})
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: POS REGISTER */}
          <TabPanel p={0}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 420px' }} gap={6}>
              {/* LEFT: PRODUCTS / MENU TILES */}
              <Box>
                {/* Search & Categories Bar */}
                <Flex gap={3} mb={4} flexWrap="wrap">
                  <Input
                    placeholder="Search menu items..."
                    maxW="300px"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    focusBorderColor={gold}
                    bg={cardBg}
                  />

                  <HStack spacing={2} overflowX="auto" pb={1} flex="1">
                    <Button
                      size="sm"
                      variant={selectedCategory === 'all' ? 'solid' : 'outline'}
                      colorScheme={selectedCategory === 'all' ? 'green' : undefined}
                      borderColor={borderCol}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All ({menuItems.length})
                    </Button>
                    {categories.map((c) => (
                      <Button
                        key={c._id}
                        size="sm"
                        variant={selectedCategory === c._id ? 'solid' : 'outline'}
                        colorScheme={selectedCategory === c._id ? 'green' : undefined}
                        borderColor={borderCol}
                        onClick={() => setSelectedCategory(c._id)}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </HStack>
                </Flex>

                {/* Items Grid */}
                {loading ? (
                  <Flex justify="center" align="center" h="300px">
                    <Spinner color={gold} size="xl" />
                  </Flex>
                ) : filteredItems.length === 0 ? (
                  <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                    <Text color={mutedCol}>No menu items found.</Text>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4, xl: 4 }} spacing={3}>
                    {filteredItems.map((item) => (
                      <Card
                        key={item._id}
                        bg={cardBg}
                        border="1px solid"
                        borderColor={borderCol}
                        borderRadius="xl"
                        cursor="pointer"
                        transition="all 0.15s"
                        _hover={{
                          borderColor: gold,
                          transform: 'translateY(-2px)',
                          boxShadow: 'md',
                        }}
                        onClick={() => addToCart(item)}
                      >
                        <CardBody p={3}>
                          <Flex justify="space-between" align="start" mb={2}>
                            <Badge
                              colorScheme={item.isVegetarian ? 'green' : 'red'}
                              fontSize="9px"
                            >
                              {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                            </Badge>
                            <Text fontWeight="bold" fontSize="sm" color={gold}>
                              ₹{item.basePrice}
                            </Text>
                          </Flex>
                          <Text fontWeight="bold" fontSize="xs" noOfLines={2} mb={2}>
                            {item.name}
                          </Text>
                          <Button
                            size="xs"
                            w="full"
                            colorScheme="green"
                            variant="subtle"
                            leftIcon={<FiPlus />}
                          >
                            Add
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              {/* RIGHT: POS CART TICKET */}
              <Box>
                <Card
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderCol}
                  borderRadius="2xl"
                  boxShadow="lg"
                  position="sticky"
                  top="80px"
                >
                  <CardBody p={5}>
                    {/* Order Type Header */}
                    <Flex justify="space-between" align="center" mb={4}>
                      <HStack>
                        <Icon as={FiShoppingBag} color={gold} />
                        <Heading size="sm">Current Ticket</Heading>
                      </HStack>
                      {cart.length > 0 && (
                        <Button size="xs" variant="ghost" color="red.400" onClick={clearCart}>
                          Clear
                        </Button>
                      )}
                    </Flex>

                    {/* Dine-in vs Takeaway Selector */}
                    <RadioGroup
                      value={orderType}
                      onChange={(val: any) => setOrderType(val)}
                      mb={4}
                    >
                      <Stack direction="row" spacing={4}>
                        <Radio value="takeaway">Takeaway Counter</Radio>
                        <Radio value="dine-in">Dine-In Table</Radio>
                      </Stack>
                    </RadioGroup>

                    {/* Table Dropdown (if Dine-in) */}
                    {orderType === 'dine-in' && (
                      <FormControl mb={3} isRequired>
                        <FormLabel fontSize="xs">Assign Table</FormLabel>
                        <Select
                          size="sm"
                          placeholder="Select table"
                          value={selectedTableId}
                          onChange={(e) => setSelectedTableId(e.target.value)}
                          focusBorderColor={gold}
                        >
                          {tables.map((t) => (
                            <option key={t._id} value={t._id}>
                              Table {t.tableNumber} ({t.section} • {t.status})
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Optional Customer info */}
                    <HStack spacing={2} mb={3}>
                      <Input
                        placeholder="Customer name (optional)"
                        size="xs"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        focusBorderColor={gold}
                      />
                      <Input
                        placeholder="Phone (optional)"
                        size="xs"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        focusBorderColor={gold}
                      />
                    </HStack>

                    <Divider borderColor={borderCol} my={2} />

                    {/* Cart Items List */}
                    <VStack
                      spacing={2}
                      align="stretch"
                      maxH="240px"
                      overflowY="auto"
                      my={2}
                      pr={1}
                    >
                      {cart.length === 0 ? (
                        <Flex justify="center" align="center" h="140px">
                          <Text fontSize="xs" color={mutedCol}>
                            Select items from catalog to build ticket.
                          </Text>
                        </Flex>
                      ) : (
                        cart.map((item) => (
                          <Flex
                            key={item.menuItemId}
                            justify="space-between"
                            align="center"
                            p={2}
                            borderRadius="lg"
                            bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                          >
                            <VStack align="start" spacing={0} flex="1">
                              <Text fontSize="xs" fontWeight="bold">
                                {item.name}
                              </Text>
                              <Text fontSize="10px" color={mutedCol}>
                                ₹{item.basePrice} ea
                              </Text>
                            </VStack>

                            <HStack spacing={1}>
                              <IconButton
                                aria-label="minus"
                                icon={<FiMinus />}
                                size="xs"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              />
                              <Text fontSize="xs" fontWeight="bold" w="20px" textAlign="center">
                                {item.quantity}
                              </Text>
                              <IconButton
                                aria-label="plus"
                                icon={<FiPlus />}
                                size="xs"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              />
                            </HStack>

                            <Text fontSize="xs" fontWeight="bold" w="60px" textAlign="right">
                              ₹{(item.basePrice * item.quantity).toFixed(2)}
                            </Text>
                          </Flex>
                        ))
                      )}
                    </VStack>

                    <Divider borderColor={borderCol} my={3} />

                    {/* Discount & Totals Breakdown */}
                    <VStack spacing={2} align="stretch" fontSize="xs">
                      <Flex justify="space-between">
                        <Text color={mutedCol}>Subtotal</Text>
                        <Text fontWeight="medium">₹{subtotal.toFixed(2)}</Text>
                      </Flex>

                      <HStack justify="space-between">
                        <HStack spacing={1}>
                          <Text color={mutedCol}>Discount %</Text>
                          {[0, 5, 10, 15].map((pct) => (
                            <Button
                              key={pct}
                              size="xs"
                              variant={discountPercent === pct ? 'solid' : 'outline'}
                              colorScheme={discountPercent === pct ? 'yellow' : undefined}
                              h="20px"
                              px={1.5}
                              fontSize="10px"
                              onClick={() => setDiscountPercent(pct)}
                            >
                              {pct}%
                            </Button>
                          ))}
                        </HStack>
                        <Text color="red.400">-₹{discountAmount.toFixed(2)}</Text>
                      </HStack>

                      <Flex justify="space-between">
                        <Text color={mutedCol}>GST / Restaurant Tax (5%)</Text>
                        <Text fontWeight="medium">₹{taxAmount.toFixed(2)}</Text>
                      </Flex>

                      <Divider borderColor={borderCol} my={1} />

                      <Flex justify="space-between" fontSize="md" fontWeight="bold">
                        <Text>Grand Total</Text>
                        <Text color={gold}>₹{grandTotal.toFixed(2)}</Text>
                      </Flex>
                    </VStack>

                    {/* Action Button */}
                    <Button
                      w="full"
                      mt={4}
                      colorScheme="green"
                      size="lg"
                      fontSize="sm"
                      fontWeight="bold"
                      rightIcon={<FiArrowRight />}
                      isDisabled={cart.length === 0}
                      onClick={handleCheckoutNewOrder}
                    >
                      COLLECT PAYMENT (₹{grandTotal.toFixed(2)})
                    </Button>
                  </CardBody>
                </Card>
              </Box>
            </Grid>
          </TabPanel>

          {/* TAB 2: UNSETTLED TABLES & BILLS */}
          <TabPanel p={0}>
            {pendingOrders.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                <Text color={mutedCol}>All table bills are fully settled! No pending balances.</Text>
              </Card>
            ) : (
              <TableContainer bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                <Table variant="simple" size="sm">
                  <Thead bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}>
                    <Tr>
                      <Th>Order #</Th>
                      <Th>Table / Type</Th>
                      <Th>Items Count</Th>
                      <Th>Fulfillment</Th>
                      <Th>Total Due</Th>
                      <Th>Created</Th>
                      <Th textAlign="right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingOrders.map((ord) => (
                      <Tr key={ord._id}>
                        <Td fontWeight="bold">#{ord.orderNumber}</Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {ord.tableNumber ? `Table #${ord.tableNumber}` : ord.orderType}
                          </Badge>
                        </Td>
                        <Td>{ord.items.length} dishes</Td>
                        <Td>
                          <Badge colorScheme="orange">{ord.fulfillmentStatus}</Badge>
                        </Td>
                        <Td fontWeight="bold" color={gold}>
                          ₹{ord.grandTotal.toFixed(2)}
                        </Td>
                        <Td color={mutedCol} fontSize="xs">
                          {new Date(ord.createdAt).toLocaleTimeString()}
                        </Td>
                        <Td textAlign="right">
                          <Button
                            size="xs"
                            colorScheme="green"
                            leftIcon={<FiDollarSign />}
                            onClick={() => handlePayExistingOrder(ord)}
                          >
                            Collect Bill
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* PAYMENT TENDER MODAL */}
      <Modal isOpen={isPayOpen} onClose={onPayClose} size="lg">
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl">
          <ModalHeader>
            <HStack>
              <Icon as={FiCreditCard} color={gold} />
              <Text>Record Customer Payment</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')} borderRadius="xl" textAlign="center">
                <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
                  Total Balance Due
                </Text>
                <Heading size="xl" color={gold}>
                  ₹{currentTotal.toFixed(2)}
                </Heading>
              </Box>

              {/* Payment Methods */}
              <FormControl>
                <FormLabel fontSize="xs" textTransform="uppercase">
                  Select Payment Method
                </FormLabel>
                <SimpleGrid columns={4} spacing={2}>
                  {(['cash', 'upi', 'card', 'online'] as PaymentMethod[]).map((m) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={paymentMethod === m ? 'solid' : 'outline'}
                      colorScheme={paymentMethod === m ? 'green' : undefined}
                      borderColor={borderCol}
                      textTransform="uppercase"
                      onClick={() => setPaymentMethod(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </SimpleGrid>
              </FormControl>

              {/* If Cash: Quick Denominations & Calculator */}
              {paymentMethod === 'cash' && (
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" mb={2}>
                    Quick Cash Presets
                  </Text>
                  <HStack spacing={2} mb={3}>
                    {[currentTotal, 100, 200, 500, 2000].map((amt, idx) => (
                      <Button
                        key={idx}
                        size="xs"
                        variant="outline"
                        borderColor={borderCol}
                        onClick={() => setTenderAmount(amt.toString())}
                      >
                        ₹{amt}
                      </Button>
                    ))}
                  </HStack>

                  <FormControl>
                    <FormLabel fontSize="xs">Amount Tendered</FormLabel>
                    <Input
                      type="number"
                      value={tenderAmount}
                      onChange={(e) => setTenderAmount(e.target.value)}
                      focusBorderColor={gold}
                      fontSize="lg"
                      fontWeight="bold"
                    />
                  </FormControl>

                  {changeDue > 0 && (
                    <Box mt={3} p={3} bg="green.500" color="white" borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" textTransform="uppercase" fontWeight="bold">
                        Change Return to Customer
                      </Text>
                      <Heading size="md">₹{changeDue.toFixed(2)}</Heading>
                    </Box>
                  )}
                </Box>
              )}

              {/* If UPI or Card: Txn Reference */}
              {(paymentMethod === 'upi' || paymentMethod === 'card') && (
                <FormControl>
                  <FormLabel fontSize="xs">Transaction / Approval Reference (Optional)</FormLabel>
                  <Input
                    placeholder="e.g. UPI Ref / Last 4 digits"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    focusBorderColor={gold}
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onPayClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FiCheckCircle />}
                isLoading={isProcessingPayment}
                loadingText="Recording..."
                onClick={handleProcessSettlement}
              >
                Confirm Payment & Issue Receipt
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* RECEIPT PREVIEW MODAL */}
      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="md">
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl">
          <ModalHeader>
            <HStack>
              <Icon as={FiFileText} color={gold} />
              <Text>Customer Bill Receipt</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {receiptData ? (
              <VStack
                spacing={3}
                align="stretch"
                p={4}
                bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                borderRadius="xl"
                fontFamily="mono"
                fontSize="xs"
              >
                <VStack spacing={0} textAlign="center">
                  <Heading size="sm" fontFamily="heading">
                    VYNTRA CAFE
                  </Heading>
                  <Text fontSize="10px">Premium Dining & Specialty Brews</Text>
                  <Text fontSize="10px">GSTIN: 27AABCV1234F1Z0</Text>
                </VStack>

                <Divider borderColor={borderCol} />

                <Flex justify="space-between">
                  <Text>Receipt #: {receiptData.billNumber || 'REC-001'}</Text>
                  <Text>{new Date().toLocaleDateString()}</Text>
                </Flex>

                <Flex justify="space-between">
                  <Text>Order: #{receiptData.order?.orderNumber || 'ORD-NEW'}</Text>
                  <Text>Type: {receiptData.order?.orderType?.toUpperCase()}</Text>
                </Flex>

                <Divider borderColor={borderCol} />

                {/* Items */}
                <VStack align="stretch" spacing={1}>
                  {(receiptData.order?.items || []).map((it: any, idx: number) => (
                    <Flex key={idx} justify="space-between">
                      <Text>
                        {it.quantity}x {it.name}
                      </Text>
                      <Text>₹{(it.unitPrice * it.quantity).toFixed(2)}</Text>
                    </Flex>
                  ))}
                </VStack>

                <Divider borderColor={borderCol} />

                <Flex justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text>₹{receiptData.order?.subtotal?.toFixed(2)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Tax (GST):</Text>
                  <Text>₹{receiptData.order?.taxAmount?.toFixed(2)}</Text>
                </Flex>
                <Flex justify="space-between" fontWeight="bold" fontSize="sm">
                  <Text>PAID IN FULL:</Text>
                  <Text>₹{receiptData.order?.grandTotal?.toFixed(2)}</Text>
                </Flex>

                <Divider borderColor={borderCol} />
                <Text textAlign="center" fontSize="10px">
                  Thank you for dining with Vyntra Cafe!
                </Text>
              </VStack>
            ) : (
              <Text fontSize="sm" color={mutedCol}>
                Loading receipt details...
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                borderColor={gold}
                color={gold}
                leftIcon={<FiPrinter />}
                onClick={() => window.print()}
              >
                Print Slip
              </Button>
              <Button colorScheme="green" onClick={onReceiptClose}>
                Done
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </StaffLayout>
  );
};

