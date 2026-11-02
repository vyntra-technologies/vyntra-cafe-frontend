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
  Input,
  Select,
  useColorModeValue,
  Icon,
  Tag,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiCoffee,
  FiCheckCircle,
  FiClock,
  FiBell,
  FiSend,
  FiDollarSign,
  FiTrash2,
  FiSearch,
  FiUser,
  FiCheck,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { WaiterLayout } from '../../components/staff/WaiterLayout';
import { waiterService } from '../../services/waiter.service';
import { menuService } from '../../services/menu.service';
import { socketService } from '../../services/socket.service';
import { ITable, IOrder, IMenuItem, TableStatus } from '../../types';
import toast from '../../utils/toast';

interface OrderItemDraft {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  variantName?: string;
  notes?: string;
}

export const WaiterDashboardPage: React.FC = () => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [readyOrders, setReadyOrders] = useState<IOrder[]>([]);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [tableSection, setTableSection] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<string>('active');
  const [activeTabName, setActiveTabName] = useState<string>('tables');

  const tabIndex = activeTabName === 'ready' ? 2 : activeTabName === 'orders' ? 1 : 0;
  const handleTabIndexChange = (index: number) => {
    if (index === 0) setActiveTabName('tables');
    else if (index === 1) setActiveTabName('orders');
    else if (index === 2) setActiveTabName('ready');
  };
  const handleNavTabChange = (tabId: string) => {
    setActiveTabName(tabId);
  };

  // New Order Modal State
  const {
    isOpen: isOrderModalOpen,
    onOpen: onOrderModalOpen,
    onClose: onOrderModalClose,
  } = useDisclosure();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [draftItems, setDraftItems] = useState<OrderItemDraft[]>([]);
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Item to Existing Order Modal
  const {
    isOpen: isAddItemOpen,
    onOpen: onAddItemOpen,
    onClose: onAddItemClose,
  } = useDisclosure();
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);

  // Theming
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)');
  const mutedCol = useColorModeValue('#6B7280', '#9CA3AF');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');

  const fetchData = useCallback(async () => {
    try {
      const [tList, oList, rList, mList] = await Promise.all([
        waiterService.getTables(),
        waiterService.getOrders(),
        waiterService.getReadyOrders(),
        menuService.getAll({ isAvailable: true, limit: 100 }).then((res) => res.items),
      ]);
      setTables(tList);
      setOrders(oList);
      setReadyOrders(rList);
      setMenuItems(mList);
    } catch (err: any) {
      console.error('Failed to load waiter data:', err);
      toast.error('Failed to sync waiter records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Socket.io real-time notifications
    const onOrderUpdate = () => {
      fetchData();
    };
    socketService.on('order:updated', onOrderUpdate);
    socketService.on('order:status-changed', onOrderUpdate);
    socketService.on('order:ready', onOrderUpdate);

    const interval = setInterval(fetchData, 15000); // 15s polling fallback

    return () => {
      socketService.off('order:updated', onOrderUpdate);
      socketService.off('order:status-changed', onOrderUpdate);
      socketService.off('order:ready', onOrderUpdate);
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenNewOrder = (tableId?: string) => {
    if (tableId) setSelectedTable(tableId);
    setDraftItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    onOrderModalOpen();
  };

  const addItemToDraft = (item: IMenuItem) => {
    setDraftItems((prev) => {
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
        },
      ];
    });
  };

  const updateDraftItemQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setDraftItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setDraftItems((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const updateDraftItemNote = (menuItemId: string, note: string) => {
    setDraftItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes: note } : i))
    );
  };

  const handleCreateOrder = async (sendDirectlyToKitchen: boolean = true) => {
    if (!selectedTable) {
      toast.error('Please select an active table');
      return;
    }
    if (draftItems.length === 0) {
      toast.error('Please add at least 1 menu item to the order');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await waiterService.createOrder({
        tableId: selectedTable,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        items: draftItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          variantName: i.variantName,
          notes: i.notes,
        })),
      });

      if (sendDirectlyToKitchen && order._id) {
        await waiterService.sendToKitchen(order._id);
        toast.success(`Order #${order.orderNumber} sent directly to kitchen!`);
      } else {
        toast.success(`Dine-in Order #${order.orderNumber} created!`);
      }

      onOrderModalClose();
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkServed = async (orderId: string) => {
    try {
      await waiterService.markServed(orderId);
      toast.success('Order marked as served to guests');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark order as served');
    }
  };

  const handleRequestBill = async (orderId: string) => {
    try {
      await waiterService.requestBill(orderId);
      toast.success('Bill request dispatched to Cashier terminal');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request bill');
    }
  };

  const handleSendToKitchen = async (orderId: string) => {
    try {
      await waiterService.sendToKitchen(orderId);
      toast.success('Order dispatched to Kitchen Display System');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch to kitchen');
    }
  };

  // Status badge styling helper
  const getTableColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'occupied':
        return 'red';
      case 'reserved':
        return 'purple';
      case 'cleaning':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <Badge colorScheme="blue">Placed</Badge>;
      case 'confirmed':
        return <Badge colorScheme="purple">Confirmed</Badge>;
      case 'preparing':
        return <Badge colorScheme="orange">Preparing</Badge>;
      case 'ready_for_pickup':
        return <Badge colorScheme="yellow">Ready for Pickup</Badge>;
      case 'served':
        return <Badge colorScheme="teal">Served</Badge>;
      case 'completed':
        return <Badge colorScheme="green">Completed</Badge>;
      case 'cancelled':
        return <Badge colorScheme="red">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Section list
  const sections = Array.from(new Set(tables.map((t) => t.section || 'General')));
  const filteredTables =
    tableSection === 'all' ? tables : tables.filter((t) => t.section === tableSection);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'active') {
      return ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(
        o.fulfillmentStatus
      );
    }
    if (orderFilter === 'served') return o.fulfillmentStatus === 'served';
    if (orderFilter === 'all') return true;
    return o.fulfillmentStatus === orderFilter;
  });

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  return (
    <WaiterLayout
      activeTab={activeTabName}
      onTabChange={handleNavTabChange}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      activeOrderCount={filteredOrders.length}
      readyOrderCount={readyOrders.length}
      onNewOrder={() => handleOpenNewOrder()}
    >
      {/* Top Banner Alert for Food Ready for Pickup */}
      {readyOrders.length > 0 && (
        <Alert
          status="warning"
          variant="solid"
          borderRadius="xl"
          mb={6}
          boxShadow="0 4px 15px rgba(237, 137, 54, 0.3)"
        >
          <AlertIcon as={FiBell} />
          <Box flex="1">
            <AlertTitle fontSize="sm" fontWeight="bold">
              Food Ready for Pickup ({readyOrders.length} order{readyOrders.length > 1 ? 's' : ''})
            </AlertTitle>
            <AlertDescription fontSize="xs">
              Kitchen has prepared orders ready to be picked up and served immediately:
              {' '}
              {readyOrders.map((ro) => `Table #${ro.tableNumber || (ro.tableId as any)?.tableNumber || 'N/A'}`).join(', ')}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* KPI Overview Strip */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
                  Total Tables
                </Text>
                <Heading size="lg">{tables.length}</Heading>
              </VStack>
              <Icon as={MdTableRestaurant} boxSize={8} color={gold} opacity={0.8} />
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
                  Available Tables
                </Text>
                <Heading size="lg" color="green.400">
                  {availableCount}
                </Heading>
              </VStack>
              <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} borderRadius="full">
                Open
              </Badge>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
                  Occupied Tables
                </Text>
                <Heading size="lg" color="red.400">
                  {occupiedCount}
                </Heading>
              </VStack>
              <Badge colorScheme="red" fontSize="xs" px={2} py={0.5} borderRadius="full">
                Dining
              </Badge>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl">
          <CardBody p={4}>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={mutedCol} textTransform="uppercase">
                  Ready to Serve
                </Text>
                <Heading size="lg" color="yellow.400">
                  {readyOrders.length}
                </Heading>
              </VStack>
              <Button
                size="sm"
                bg={gold}
                color="black"
                leftIcon={<FiPlus />}
                onClick={() => handleOpenNewOrder()}
                _hover={{ opacity: 0.9 }}
              >
                New Order
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Tabs: Floor Plan Tables vs Assigned Orders */}
      <Tabs index={tabIndex} onChange={handleTabIndexChange} colorScheme="teal" variant="enclosed">
        <TabList borderBottom="1px solid" borderColor={borderCol} mb={4}>
          <Tab fontWeight="bold" fontSize="sm">
            Floor Plan & Tables ({tables.length})
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            Active Service Orders ({filteredOrders.length})
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            Ready for Pickup ({readyOrders.length})
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: FLOOR PLAN & TABLES */}
          <TabPanel p={0}>
            {/* Section Filter Pills */}
            <HStack spacing={2} mb={4} overflowX="auto" pb={2}>
              <Tag
                size="lg"
                cursor="pointer"
                variant={tableSection === 'all' ? 'solid' : 'outline'}
                colorScheme="teal"
                onClick={() => setTableSection('all')}
              >
                All Sections ({tables.length})
              </Tag>
              {sections.map((sec) => (
                <Tag
                  key={sec}
                  size="lg"
                  cursor="pointer"
                  variant={tableSection === sec ? 'solid' : 'outline'}
                  colorScheme="teal"
                  onClick={() => setTableSection(sec)}
                >
                  {sec} ({tables.filter((t) => t.section === sec).length})
                </Tag>
              ))}
            </HStack>

            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner color={gold} size="xl" />
              </Flex>
            ) : filteredTables.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                <Text color={mutedCol}>No tables configured in this section.</Text>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={4}>
                {filteredTables.map((t) => {
                  const isReady = readyOrders.some(
                    (ro) =>
                      ro.tableId === t._id ||
                      (typeof ro.tableId === 'object' && ro.tableId?._id === t._id) ||
                      ro.tableNumber === t.tableNumber
                  );

                  return (
                    <Card
                      key={t._id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={isReady ? 'yellow.400' : borderCol}
                      borderRadius="2xl"
                      boxShadow={isReady ? '0 0 15px rgba(236, 201, 75, 0.3)' : 'sm'}
                      overflow="hidden"
                      transition="all 0.2s"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    >
                      <CardBody p={4}>
                        <Flex justify="space-between" align="center" mb={3}>
                          <HStack>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                            >
                              <Icon as={MdTableRestaurant} boxSize={5} color={gold} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="md">Table {t.tableNumber}</Heading>
                              <Text fontSize="10px" color={mutedCol} textTransform="uppercase">
                                {t.section} • {t.capacity} Seats
                              </Text>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getTableColor(t.status)} textTransform="uppercase">
                            {t.status}
                          </Badge>
                        </Flex>

                        {isReady && (
                          <Badge colorScheme="yellow" mb={2} w="full" textAlign="center" py={0.5}>
                            Food Ready to Serve!
                          </Badge>
                        )}

                        <VStack spacing={2} align="stretch" mt={3}>
                          {t.status === 'available' ? (
                            <Button
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<FiPlus />}
                              onClick={() => handleOpenNewOrder(t._id)}
                            >
                              Seat & Take Order
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              borderColor={borderCol}
                              leftIcon={<FiCoffee />}
                              onClick={() => handleOpenNewOrder(t._id)}
                            >
                              Add Order / Items
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* TAB 2: ACTIVE SERVICE ORDERS */}
          <TabPanel p={0}>
            <HStack spacing={2} mb={4}>
              {['active', 'placed', 'preparing', 'served', 'all'].map((filterKey) => (
                <Button
                  key={filterKey}
                  size="xs"
                  textTransform="capitalize"
                  variant={orderFilter === filterKey ? 'solid' : 'outline'}
                  colorScheme={orderFilter === filterKey ? 'teal' : undefined}
                  onClick={() => setOrderFilter(filterKey)}
                >
                  {filterKey}
                </Button>
              ))}
            </HStack>

            {filteredOrders.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                <Text color={mutedCol}>No active service orders currently found.</Text>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filteredOrders.map((ord) => {
                  const tableLabel =
                    ord.tableNumber ||
                    (typeof ord.tableId === 'object' ? ord.tableId?.tableNumber : 'Counter') ||
                    'N/A';

                  return (
                    <Card
                      key={ord._id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={ord.fulfillmentStatus === 'ready_for_pickup' ? 'yellow.400' : borderCol}
                      borderRadius="2xl"
                      boxShadow="sm"
                      overflow="hidden"
                    >
                      <CardBody p={4}>
                        <Flex justify="space-between" align="start" mb={2}>
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Heading size="sm">Order #{ord.orderNumber}</Heading>
                              <Badge colorScheme="purple">{ord.orderType}</Badge>
                            </HStack>
                            <Text fontSize="xs" color={mutedCol}>
                              Table: <Text as="span" fontWeight="bold">{tableLabel}</Text>
                              {ord.customerName && ` • Guest: ${ord.customerName}`}
                            </Text>
                          </VStack>
                          {getOrderStatusBadge(ord.fulfillmentStatus)}
                        </Flex>

                        <Divider my={2} borderColor={borderCol} />

                        {/* Order Items List */}
                        <VStack align="stretch" spacing={1} mb={3} maxH="130px" overflowY="auto">
                          {ord.items.map((it, idx) => (
                            <HStack key={idx} justify="space-between" fontSize="xs">
                              <Text>
                                <Text as="span" fontWeight="bold">
                                  {it.quantity}x
                                </Text>{' '}
                                {it.name}
                                {it.variantName && ` (${it.variantName})`}
                              </Text>
                              <Text fontWeight="semibold">₹{it.itemTotal || it.unitPrice * it.quantity}</Text>
                            </HStack>
                          ))}
                        </VStack>

                        {ord.notes && (
                          <Box bg={hoverBg} p={2} borderRadius="md" mb={3} fontSize="xs" color={mutedCol}>
                            <Text fontWeight="bold">Guest Note:</Text> {ord.notes}
                          </Box>
                        )}

                        <Flex justify="space-between" align="center" mb={3} fontSize="xs">
                          <Text color={mutedCol}>Total Amount</Text>
                          <Heading size="xs" color={gold}>
                            ₹{ord.grandTotal.toFixed(2)}
                          </Heading>
                        </Flex>

                        {/* Waiter Actions */}
                        <VStack spacing={2} align="stretch">
                          {ord.fulfillmentStatus === 'placed' && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              leftIcon={<FiSend />}
                              onClick={() => handleSendToKitchen(ord._id)}
                            >
                              Dispatch to Kitchen
                            </Button>
                          )}

                          {ord.fulfillmentStatus === 'ready_for_pickup' && (
                            <Button
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<FiCheckCircle />}
                              onClick={() => handleMarkServed(ord._id)}
                            >
                              Mark as Served
                            </Button>
                          )}

                          {ord.fulfillmentStatus === 'served' && (
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor={gold}
                              color={gold}
                              leftIcon={<FiDollarSign />}
                              onClick={() => handleRequestBill(ord._id)}
                            >
                              Request Bill from Cashier
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* TAB 3: READY FOR PICKUP */}
          <TabPanel p={0}>
            {readyOrders.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={borderCol} p={8} textAlign="center">
                <Text color={mutedCol}>No orders waiting for pickup. Kitchen is cooking smoothly!</Text>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {readyOrders.map((ord) => (
                  <Card
                    key={ord._id}
                    bg={cardBg}
                    border="2px solid"
                    borderColor="yellow.400"
                    borderRadius="2xl"
                    boxShadow="0 4px 20px rgba(236, 201, 75, 0.2)"
                  >
                    <CardBody p={5}>
                      <Flex justify="space-between" align="center" mb={3}>
                        <VStack align="start" spacing={0}>
                          <Heading size="md">
                            Table #{ord.tableNumber || (ord.tableId as any)?.tableNumber || 'N/A'}
                          </Heading>
                          <Text fontSize="xs" color={mutedCol}>
                            Order #{ord.orderNumber}
                          </Text>
                        </VStack>
                        <Badge colorScheme="yellow" fontSize="xs" px={2} py={1}>
                          READY
                        </Badge>
                      </Flex>

                      <VStack align="stretch" spacing={1} mb={4} fontSize="sm">
                        {ord.items.map((it, idx) => (
                          <HStack key={idx} justify="space-between">
                            <Text fontWeight="semibold">
                              {it.quantity}x {it.name}
                            </Text>
                            {it.notes && (
                              <Badge colorScheme="purple" fontSize="10px">
                                {it.notes}
                              </Badge>
                            )}
                          </HStack>
                        ))}
                      </VStack>

                      <Button
                        w="full"
                        colorScheme="teal"
                        size="md"
                        leftIcon={<FiCheck />}
                        onClick={() => handleMarkServed(ord._id)}
                      >
                        Confirm Served to Table
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* MODAL: CREATE DINE-IN ORDER */}
      <Modal isOpen={isOrderModalOpen} onClose={onOrderModalClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl">
          <ModalHeader>
            <HStack>
              <Icon as={FiCoffee} color={gold} />
              <Text>Create Dine-In Table Order</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Table Selector & Guest details */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" textTransform="uppercase">
                    Assign Table
                  </FormLabel>
                  <Select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    placeholder="Select table"
                    focusBorderColor={gold}
                  >
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table {t.tableNumber} ({t.section} • {t.status})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" textTransform="uppercase">
                    Guest Name (Optional)
                  </FormLabel>
                  <Input
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    focusBorderColor={gold}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" textTransform="uppercase">
                    Phone (Optional)
                  </FormLabel>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    focusBorderColor={gold}
                  />
                </FormControl>
              </SimpleGrid>

              <Divider borderColor={borderCol} />

              {/* Two Column Layout: Menu Browser on Left, Current Order Draft on Right */}
              <Grid templateColumns={{ base: '1fr', md: '1.2fr 1fr' }} gap={4}>
                {/* Left: Menu Picker */}
                <Box>
                  <HStack mb={3}>
                    <Input
                      placeholder="Search menu items..."
                      size="sm"
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      focusBorderColor={gold}
                    />
                  </HStack>

                  <VStack spacing={2} align="stretch" maxH="320px" overflowY="auto" pr={1}>
                    {menuItems
                      .filter((m) =>
                        m.name.toLowerCase().includes(menuSearch.toLowerCase())
                      )
                      .slice(0, 30)
                      .map((item) => (
                        <Flex
                          key={item._id}
                          p={2.5}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={borderCol}
                          justify="space-between"
                          align="center"
                          _hover={{ bg: hoverBg }}
                        >
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="bold">
                              {item.name}
                            </Text>
                            <Text fontSize="xs" color={gold} fontWeight="semibold">
                              ₹{item.basePrice}
                            </Text>
                          </VStack>
                          <Button
                            size="xs"
                            colorScheme="teal"
                            leftIcon={<FiPlus />}
                            onClick={() => addItemToDraft(item)}
                          >
                            Add
                          </Button>
                        </Flex>
                      ))}
                  </VStack>
                </Box>

                {/* Right: Order Cart Draft */}
                <Box
                  bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderCol}
                >
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" mb={2}>
                    Order Items ({draftItems.length})
                  </Text>

                  {draftItems.length === 0 ? (
                    <Flex justify="center" align="center" h="180px">
                      <Text fontSize="xs" color={mutedCol}>
                        Click Add on items to build this order.
                      </Text>
                    </Flex>
                  ) : (
                    <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
                      {draftItems.map((d) => (
                        <Box key={d.menuItemId} p={2} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderCol}>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="xs" fontWeight="bold">
                              {d.name}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold">
                              ₹{(d.basePrice * d.quantity).toFixed(2)}
                            </Text>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <HStack spacing={1}>
                              <IconButton
                                aria-label="decrease"
                                icon={<Text fontWeight="bold">-</Text>}
                                size="xs"
                                onClick={() => updateDraftItemQty(d.menuItemId, d.quantity - 1)}
                              />
                              <Text fontSize="xs" px={1} fontWeight="bold">
                                {d.quantity}
                              </Text>
                              <IconButton
                                aria-label="increase"
                                icon={<Text fontWeight="bold">+</Text>}
                                size="xs"
                                onClick={() => updateDraftItemQty(d.menuItemId, d.quantity + 1)}
                              />
                            </HStack>
                            <Input
                              placeholder="Notes: e.g. no onions"
                              size="xs"
                              w="140px"
                              value={d.notes || ''}
                              onChange={(e) => updateDraftItemNote(d.menuItemId, e.target.value)}
                            />
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  {draftItems.length > 0 && (
                    <Box mt={3} pt={2} borderTop="1px solid" borderColor={borderCol}>
                      <Flex justify="space-between" fontSize="sm" fontWeight="bold">
                        <Text>Subtotal Estimate</Text>
                        <Text color={gold}>
                          ₹
                          {draftItems
                            .reduce((sum, i) => sum + i.basePrice * i.quantity, 0)
                            .toFixed(2)}
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Box>
              </Grid>

              <FormControl mt={2}>
                <FormLabel fontSize="xs" textTransform="uppercase">
                  Special Order Instructions / Dietary Requests
                </FormLabel>
                <Input
                  placeholder="e.g. Customer has nut allergy, serve beverages first"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  focusBorderColor={gold}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onOrderModalClose}>
                Cancel
              </Button>
              <Button
                variant="outline"
                borderColor={gold}
                color={gold}
                isLoading={isSubmitting}
                onClick={() => handleCreateOrder(false)}
              >
                Save Ticket Only
              </Button>
              <Button
                colorScheme="teal"
                isLoading={isSubmitting}
                loadingText="Sending..."
                leftIcon={<FiSend />}
                onClick={() => handleCreateOrder(true)}
              >
                Send to Kitchen
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </WaiterLayout>
  );
};

