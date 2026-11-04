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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiCoffee,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrash2,
  FiSearch,
  FiUser,
  FiCheck,
  FiArrowRight,
  FiEye,
  FiSend,
  FiAlertCircle,
  FiGrid,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { FaConciergeBell, FaUtensils, FaReceipt } from 'react-icons/fa';
import { WaiterLayout } from '../../components/staff/WaiterLayout';
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
  // Master data
  const [tables, setTables] = useState<ITable[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [readyOrders, setReadyOrders] = useState<IOrder[]>([]);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Active view tab state (matches sidebar keys)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Drawer & Inspection State
  const [inspectedOrder, setInspectedOrder] = useState<IOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Bill Request Confirmation Modal State
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [targetOrderForBill, setTargetOrderForBill] = useState<IOrder | null>(null);
  const [billPaymentMethod, setBillPaymentMethod] = useState<string>('cash');

  // Filter States
  const [tableSectionFilter, setTableSectionFilter] = useState<string>('all');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Order Creation Form State
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [draftItems, setDraftItems] = useState<OrderItemDraft[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Fetch all waiter master data
  const fetchData = useCallback(async () => {
    try {
      const [tList, oList, rList, mList] = await Promise.all([
        waiterService.getTables(),
        waiterService.getOrders(),
        waiterService.getReadyOrders(),
        menuService.getAll({ isAvailable: true, limit: 120 }).then((res) => res.items),
      ]);
      setTables(tList);
      setOrders(oList);
      setReadyOrders(rList);
      setMenuItems(mList);
    } catch (err: any) {
      console.error('Failed to load waiter data:', err);
      toast.error('Failed to synchronize waiter records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Socket.io real-time subscriptions
    const onOrderUpdate = () => {
      fetchData();
    };
    socketService.on('order:updated', onOrderUpdate);
    socketService.on('order:status-changed', onOrderUpdate);
    socketService.on('order:ready', onOrderUpdate);
    socketService.on('table:status_changed', onOrderUpdate);

    const interval = setInterval(fetchData, 15000); // 15s polling fallback

    return () => {
      socketService.off('order:updated', onOrderUpdate);
      socketService.off('order:status-changed', onOrderUpdate);
      socketService.off('order:ready', onOrderUpdate);
      socketService.off('table:status_changed', onOrderUpdate);
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Mark order as served
  const handleMarkServed = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      await waiterService.markServed(orderId);
      toast.success('Order marked as served to table');
      fetchData();
      if (inspectedOrder?._id === orderId) {
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionInProgress(null);
    }
  };

  // Request bill for order
  const handleRequestBill = async () => {
    if (!targetOrderForBill) return;
    setActionInProgress(targetOrderForBill._id);
    try {
      await waiterService.requestBill(targetOrderForBill._id, billPaymentMethod);
      toast.success(`Bill requested for Order #${targetOrderForBill.orderNumber}`);
      setBillModalOpen(false);
      setTargetOrderForBill(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request bill');
    } finally {
      setActionInProgress(null);
    }
  };

  // New Order Draft Management
  const handleAddItemToDraft = (item: IMenuItem) => {
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

  const handleUpdateDraftQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setDraftItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setDraftItems((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleUpdateDraftNote = (menuItemId: string, note: string) => {
    setDraftItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes: note } : i))
    );
  };

  const draftSubtotal = useMemo(() => {
    return draftItems.reduce((acc, i) => acc + i.basePrice * i.quantity, 0);
  }, [draftItems]);

  const draftEstimatedTax = draftSubtotal * 0.05;
  const draftTotal = draftSubtotal + draftEstimatedTax;

  // Submit Floor Order to Kitchen
  const handleSubmitFloorOrder = async () => {
    if (orderType === 'dine-in' && !selectedTableId) {
      toast.error('Please assign a dining table for this dine-in order');
      return;
    }
    if (draftItems.length === 0) {
      toast.error('Please select at least one dish from the menu');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const created = await waiterService.createOrder({
        tableId: selectedTableId || tables[0]?._id,
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

      if (created?._id) {
        await waiterService.sendToKitchen(created._id).catch(() => {});
        toast.success(`Order #${created.orderNumber} successfully transmitted to kitchen!`);
      }

      // Reset Draft
      setDraftItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      setActiveTab('active_orders');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit floor order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Categories derivation
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((m) => {
      const cat = typeof m.category === 'object' ? (m.category as any)?.name : m.category;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [menuItems]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        !menuSearchQuery ||
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));

      const itemCategory = typeof item.category === 'object' ? (item.category as any)?.name : item.category;
      const matchesCategory = selectedCategory === 'all' || itemCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearchQuery, selectedCategory]);

  // Derived Statistics (Real backend data)
  const assignedTablesCount = useMemo(() => {
    return tables.filter((t) => t.status === 'occupied').length;
  }, [tables]);

  const availableTablesCount = useMemo(() => {
    return tables.filter((t) => t.status === 'available').length;
  }, [tables]);

  const activeOrdersList = useMemo(() => {
    return orders.filter((o) =>
      ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(o.fulfillmentStatus)
    );
  }, [orders]);

  const servedOrdersList = useMemo(() => {
    return orders.filter((o) => ['served', 'completed'].includes(o.fulfillmentStatus));
  }, [orders]);

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesSection = tableSectionFilter === 'all' || t.section === tableSectionFilter;
      const matchesStatus = tableStatusFilter === 'all' || t.status === tableStatusFilter;
      return matchesSection && matchesStatus;
    });
  }, [tables, tableSectionFilter, tableStatusFilter]);

  // Unique Sections
  const tableSections = useMemo(() => {
    const s = new Set<string>();
    tables.forEach((t) => t.section && s.add(t.section));
    return Array.from(s);
  }, [tables]);

  if (loading) {
    return (
      <WaiterLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <LoadingSkeleton rows={5} />
      </WaiterLayout>
    );
  }

  return (
    <WaiterLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={handleRefresh}
      isRefreshing={refreshing}
      activeOrderCount={activeOrdersList.length}
      readyOrderCount={readyOrders.length}
    >
      {/* VIEW 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <VStack spacing={6} align="stretch">
          {/* 5 Core Stat Cards */}
          <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} spacing={{ base: 3, md: 4 }}>
            <StatCard
              title="Assigned Tables"
              value={assignedTablesCount}
              subtitle="Currently Occupied"
              icon={MdTableRestaurant}
              colorScheme="yellow"
              onClick={() => {
                setTableStatusFilter('occupied');
                setActiveTab('tables');
              }}
            />
            <StatCard
              title="Available Tables"
              value={availableTablesCount}
              subtitle="Ready for Seating"
              icon={FiCheckCircle}
              colorScheme="green"
              onClick={() => {
                setTableStatusFilter('available');
                setActiveTab('tables');
              }}
            />
            <StatCard
              title="Active Orders"
              value={activeOrdersList.length}
              subtitle="Floor In-Progress"
              icon={FiClock}
              colorScheme="blue"
              onClick={() => setActiveTab('active_orders')}
            />
            <StatCard
              title="Ready for Service"
              value={readyOrders.length}
              subtitle="Chef Completed"
              icon={FaConciergeBell}
              colorScheme="red"
              badge={readyOrders.length > 0 ? 'URGENT' : undefined}
              onClick={() => setActiveTab('ready')}
            />
            <StatCard
              title="Served Today"
              value={servedOrdersList.length}
              subtitle="Delivered Dishes"
              icon={FiCheck}
              colorScheme="gold"
              onClick={() => setActiveTab('served_orders')}
            />
          </SimpleGrid>

          {/* Priority Alert Strip: Orders Ready for Pickup from Kitchen */}
          {readyOrders.length > 0 && (
            <Box
              p={4}
              borderRadius="2xl"
              bg="rgba(34, 197, 94, 0.12)"
              borderWidth="1px"
              borderColor={STAFF_COLORS.success}
              boxShadow="0 4px 20px rgba(34, 197, 94, 0.15)"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <Flex
                    w="10"
                    h="10"
                    borderRadius="full"
                    bg={STAFF_COLORS.success}
                    color="#0B0B0D"
                    align="center"
                    justify="center"
                    fontSize="lg"
                  >
                    <FaConciergeBell />
                  </Flex>
                  <Box>
                    <HStack spacing={2}>
                      <Text fontWeight="800" fontSize="sm" color={STAFF_COLORS.text}>
                        {readyOrders.length} Order{readyOrders.length > 1 ? 's' : ''} Ready for Service
                      </Text>
                      <Badge colorScheme="green" fontSize="9px">PICKUP NOW</Badge>
                    </HStack>
                    <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                      Kitchen has completed preparation. Pick up and deliver to guests promptly.
                    </Text>
                  </Box>
                </HStack>

                <Button
                  size="sm"
                  bg={STAFF_COLORS.success}
                  color="#0B0B0D"
                  _hover={{ opacity: 0.9 }}
                  borderRadius="xl"
                  leftIcon={<FiCheckCircle />}
                  onClick={() => setActiveTab('ready')}
                >
                  Deliver Dishes
                </Button>
              </Flex>
            </Box>
          )}

          {/* Quick Action Shortcuts */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            <Button
              h="auto"
              py={4}
              bg={STAFF_COLORS.primaryGold}
              color="#0B0B0D"
              _hover={{ bg: STAFF_COLORS.lightGold }}
              borderRadius="2xl"
              leftIcon={<FiPlus fontSize="20px" />}
              onClick={() => {
                setOrderType('dine-in');
                setActiveTab('new_order');
              }}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Take New Floor Order</Text>
                <Text fontSize="10px" opacity="0.8">Select table & transmit dishes</Text>
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
              leftIcon={<MdTableRestaurant fontSize="20px" />}
              onClick={() => setActiveTab('tables')}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Table Floor Map</Text>
                <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>Review availability & seat guests</Text>
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
              leftIcon={<FiClock fontSize="20px" />}
              onClick={() => setActiveTab('active_orders')}
            >
              <VStack align="flex-start" spacing={0} ml={2}>
                <Text fontWeight="800" fontSize="sm">Active Orders ({activeOrdersList.length})</Text>
                <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>Track preparation progress</Text>
              </VStack>
            </Button>
          </SimpleGrid>

          {/* Two-Column Section: Active Tables Snapshot & Recent Active Orders */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Tables Snapshot */}
            <Box
              bg={STAFF_COLORS.card}
              borderWidth="1px"
              borderColor={STAFF_COLORS.border}
              borderRadius="2xl"
              p={5}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={2}>
                  <Icon as={MdTableRestaurant} color={STAFF_COLORS.primaryGold} />
                  <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text} textTransform="uppercase">
                    Floor Tables Status ({tables.length})
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost" color={STAFF_COLORS.primaryGold} onClick={() => setActiveTab('tables')}>
                  View All Tables
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                {tables.slice(0, 9).map((t) => (
                  <Box
                    key={t._id}
                    p={3}
                    borderRadius="xl"
                    bg={STAFF_COLORS.innerCard}
                    borderWidth="1px"
                    borderColor={
                      t.status === 'occupied'
                        ? 'rgba(245, 158, 11, 0.4)'
                        : t.status === 'available'
                        ? 'rgba(34, 197, 94, 0.3)'
                        : STAFF_COLORS.border
                    }
                    cursor="pointer"
                    _hover={{ borderColor: STAFF_COLORS.primaryGold }}
                    onClick={() => {
                      if (t.status === 'available') {
                        setSelectedTableId(t._id);
                        setActiveTab('new_order');
                      } else {
                        setActiveTab('tables');
                      }
                    }}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="800" fontSize="sm" color={STAFF_COLORS.text}>
                        Table #{t.tableNumber}
                      </Text>
                      <Badge
                        fontSize="9px"
                        colorScheme={
                          t.status === 'available'
                            ? 'green'
                            : t.status === 'occupied'
                            ? 'orange'
                            : t.status === 'reserved'
                            ? 'blue'
                            : 'purple'
                        }
                      >
                        {t.status}
                      </Badge>
                    </Flex>
                    <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>
                      {t.capacity} Guests • {t.section}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Active Floor Orders Mini Feed */}
            <Box
              bg={STAFF_COLORS.card}
              borderWidth="1px"
              borderColor={STAFF_COLORS.border}
              borderRadius="2xl"
              p={5}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={2}>
                  <Icon as={FiClock} color={STAFF_COLORS.primaryGold} />
                  <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text} textTransform="uppercase">
                    Active Floor Tickets ({activeOrdersList.length})
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost" color={STAFF_COLORS.primaryGold} onClick={() => setActiveTab('active_orders')}>
                  View All Orders
                </Button>
              </Flex>

              {activeOrdersList.length === 0 ? (
                <EmptyState
                  title="No Active Orders"
                  message="All floor guests have been served or there are no pending orders."
                  icon={FiCoffee}
                />
              ) : (
                <VStack spacing={2.5} align="stretch" maxH="320px" overflowY="auto" pr={1}>
                  {activeOrdersList.slice(0, 5).map((order) => (
                    <Box
                      key={order._id}
                      p={3}
                      borderRadius="xl"
                      bg={STAFF_COLORS.innerCard}
                      borderWidth="1px"
                      borderColor={STAFF_COLORS.border}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Text fontWeight="800" fontSize="xs" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                            #{order.orderNumber}
                          </Text>
                          <Badge colorScheme={order.orderType === 'dine-in' ? 'orange' : 'teal'} fontSize="9px">
                            {order.orderType === 'dine-in'
                              ? `T-${order.tableNumber || (order.tableId as any)?.tableNumber || 'Table'}`
                              : 'Takeaway'}
                          </Badge>
                          <Badge
                            colorScheme={
                              order.fulfillmentStatus === 'ready_for_pickup'
                                ? 'green'
                                : order.fulfillmentStatus === 'preparing'
                                ? 'yellow'
                                : 'blue'
                            }
                            fontSize="9px"
                          >
                            {order.fulfillmentStatus.replace(/_/g, ' ')}
                          </Badge>
                        </HStack>

                        <HStack spacing={2}>
                          <Text fontWeight="700" fontSize="xs" color={STAFF_COLORS.text}>
                            ₹{order.grandTotal?.toFixed(0)}
                          </Text>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="View order"
                            icon={<FiEye />}
                            onClick={() => {
                              setInspectedOrder(order);
                              setIsDrawerOpen(true);
                            }}
                          />
                        </HStack>
                      </Flex>
                      <Text fontSize="10px" color={STAFF_COLORS.secondaryText} mt={1} noOfLines={1}>
                        {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </SimpleGrid>
        </VStack>
      )}

      {/* VIEW 2: TABLES MANAGEMENT */}
      {activeTab === 'tables' && (
        <VStack spacing={5} align="stretch">
          {/* Filter Bar */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3} wrap="wrap">
              <Select
                size="sm"
                value={tableSectionFilter}
                onChange={(e) => setTableSectionFilter(e.target.value)}
                bg={STAFF_COLORS.card}
                borderColor={STAFF_COLORS.border}
                borderRadius="xl"
                color={STAFF_COLORS.text}
                maxW="180px"
              >
                <option value="all" style={{ background: STAFF_COLORS.sidebar }}>All Dining Sections</option>
                {tableSections.map((sec) => (
                  <option key={sec} value={sec} style={{ background: STAFF_COLORS.sidebar }}>{sec}</option>
                ))}
              </Select>

              <Select
                size="sm"
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                bg={STAFF_COLORS.card}
                borderColor={STAFF_COLORS.border}
                borderRadius="xl"
                color={STAFF_COLORS.text}
                maxW="160px"
              >
                <option value="all" style={{ background: STAFF_COLORS.sidebar }}>All Statuses</option>
                <option value="available" style={{ background: STAFF_COLORS.sidebar }}>Available</option>
                <option value="occupied" style={{ background: STAFF_COLORS.sidebar }}>Occupied</option>
                <option value="reserved" style={{ background: STAFF_COLORS.sidebar }}>Reserved</option>
                <option value="cleaning" style={{ background: STAFF_COLORS.sidebar }}>Cleaning</option>
              </Select>
            </HStack>

            <HStack spacing={2}>
              <Badge colorScheme="green" px={2} py={0.5} borderRadius="md">
                Available: {availableTablesCount}
              </Badge>
              <Badge colorScheme="orange" px={2} py={0.5} borderRadius="md">
                Occupied: {assignedTablesCount}
              </Badge>
            </HStack>
          </Flex>

          {/* Tables Grid */}
          {filteredTables.length === 0 ? (
            <EmptyState
              title="No Tables Found"
              message="No dining tables match the selected section or availability filter."
              icon={MdTableRestaurant}
            />
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={4}>
              {filteredTables.map((tbl) => {
                const activeOrderForTable = orders.find(
                  (o) =>
                    (o.tableId === tbl._id || (o.tableId as any)?._id === tbl._id) &&
                    ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(o.fulfillmentStatus)
                );

                return (
                  <Box
                    key={tbl._id}
                    p={5}
                    borderRadius="2xl"
                    bg={STAFF_COLORS.card}
                    borderWidth="1px"
                    borderColor={
                      tbl.status === 'occupied'
                        ? 'rgba(245, 158, 11, 0.4)'
                        : tbl.status === 'available'
                        ? 'rgba(34, 197, 94, 0.3)'
                        : STAFF_COLORS.border
                    }
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: STAFF_COLORS.primaryGold,
                      transform: 'translateY(-2px)',
                    }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Box>
                        <Text fontSize="lg" fontWeight="800" color={STAFF_COLORS.text}>
                          Table #{tbl.tableNumber}
                        </Text>
                        <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                          {tbl.capacity} Guests • {tbl.section}
                        </Text>
                      </Box>
                      <Badge
                        fontSize="10px"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        colorScheme={
                          tbl.status === 'available'
                            ? 'green'
                            : tbl.status === 'occupied'
                            ? 'orange'
                            : tbl.status === 'reserved'
                            ? 'blue'
                            : 'purple'
                        }
                      >
                        {tbl.status}
                      </Badge>
                    </Flex>

                    {/* Active Order information if occupied */}
                    {activeOrderForTable && (
                      <Box
                        p={2.5}
                        borderRadius="xl"
                        bg={STAFF_COLORS.innerCard}
                        borderWidth="1px"
                        borderColor={STAFF_COLORS.border}
                        mb={3}
                        fontSize="xs"
                      >
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                            #{activeOrderForTable.orderNumber}
                          </Text>
                          <Badge
                            fontSize="9px"
                            colorScheme={
                              activeOrderForTable.fulfillmentStatus === 'ready_for_pickup'
                                ? 'green'
                                : 'yellow'
                            }
                          >
                            {activeOrderForTable.fulfillmentStatus.replace(/_/g, ' ')}
                          </Badge>
                        </Flex>
                        <Text fontSize="10px" color={STAFF_COLORS.secondaryText} noOfLines={1}>
                          {activeOrderForTable.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </Text>
                      </Box>
                    )}

                    {/* Contextual Actions */}
                    <HStack spacing={2} pt={2}>
                      {tbl.status === 'available' ? (
                        <Button
                          size="xs"
                          w="100%"
                          bg={STAFF_COLORS.primaryGold}
                          color="#0B0B0D"
                          _hover={{ bg: STAFF_COLORS.lightGold }}
                          borderRadius="lg"
                          leftIcon={<FiPlus />}
                          onClick={() => {
                            setSelectedTableId(tbl._id);
                            setOrderType('dine-in');
                            setActiveTab('new_order');
                          }}
                        >
                          Create Order
                        </Button>
                      ) : activeOrderForTable ? (
                        <>
                          <Button
                            size="xs"
                            flex="1"
                            variant="outline"
                            borderColor={STAFF_COLORS.border}
                            borderRadius="lg"
                            leftIcon={<FiEye />}
                            onClick={() => {
                              setInspectedOrder(activeOrderForTable);
                              setIsDrawerOpen(true);
                            }}
                          >
                            View Order
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor={STAFF_COLORS.borderGold}
                            color={STAFF_COLORS.primaryGold}
                            borderRadius="lg"
                            leftIcon={<FaReceipt />}
                            onClick={() => {
                              setTargetOrderForBill(activeOrderForTable);
                              setBillModalOpen(true);
                            }}
                          >
                            Bill
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="xs"
                          w="100%"
                          variant="outline"
                          borderColor={STAFF_COLORS.border}
                          borderRadius="lg"
                          onClick={() => {
                            setSelectedTableId(tbl._id);
                            setActiveTab('new_order');
                          }}
                        >
                          Seat Guests
                        </Button>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>
      )}

      {/* VIEW 3: NEW FLOOR ORDER TERMINAL */}
      {activeTab === 'new_order' && (
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Left 2 Columns: Dynamic Categories & Menu Catalog */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack spacing={4} align="stretch">
              {/* Category Filter Pills & Search */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <SearchBar
                  value={menuSearchQuery}
                  onChange={setMenuSearchQuery}
                  placeholder="Search dishes, drinks, bakery..."
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
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} style={{ background: STAFF_COLORS.sidebar }}>{cat}</option>
                  ))}
                </Select>
              </Flex>

              {/* Menu Items Grid */}
              {filteredMenuItems.length === 0 ? (
                <EmptyState
                  title="No Menu Items Found"
                  message="No matching dishes or beverages found for this search."
                  icon={FiCoffee}
                />
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={3}>
                  {filteredMenuItems.map((item) => {
                    const draftQty = draftItems.find((d) => d.menuItemId === item._id)?.quantity || 0;

                    return (
                      <Box
                        key={item._id}
                        p={3.5}
                        borderRadius="2xl"
                        bg={STAFF_COLORS.card}
                        borderWidth="1px"
                        borderColor={draftQty > 0 ? STAFF_COLORS.primaryGold : STAFF_COLORS.border}
                        transition="all 0.2s ease"
                        _hover={{ borderColor: STAFF_COLORS.borderGold }}
                      >
                        <Flex justify="space-between" align="flex-start" gap={2}>
                          <Box flex="1">
                            <HStack spacing={1.5} mb={1}>
                              <Badge
                                fontSize="9px"
                                px={1.5}
                                borderRadius="sm"
                                colorScheme={item.isVegetarian ? 'green' : 'red'}
                              >
                                {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                              </Badge>
                              {item.isBestseller && (
                                <Badge fontSize="9px" px={1.5} borderRadius="sm" colorScheme="yellow">
                                  BESTSELLER
                                </Badge>
                              )}
                            </HStack>

                            <Text fontSize="sm" fontWeight="700" color={STAFF_COLORS.text} noOfLines={1}>
                              {item.name}
                            </Text>

                            <Text fontSize="xs" fontWeight="800" color={STAFF_COLORS.primaryGold} mt={1}>
                              ₹{item.basePrice.toFixed(2)}
                            </Text>
                          </Box>

                          {/* Item Thumbnail if available */}
                          {item.images && item.images.length > 0 && (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              w="50px"
                              h="50px"
                              borderRadius="xl"
                              objectFit="cover"
                              fallbackSrc="https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=100&q=80"
                            />
                          )}
                        </Flex>

                        {/* Quantity Incrementer or Add Button */}
                        <Box mt={3}>
                          {draftQty > 0 ? (
                            <HStack justify="space-between" bg={STAFF_COLORS.innerCard} borderRadius="xl" p={1}>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Decrease"
                                icon={<Text fontWeight="900">-</Text>}
                                onClick={() => handleUpdateDraftQty(item._id, draftQty - 1)}
                              />
                              <Text fontSize="xs" fontWeight="800" color={STAFF_COLORS.primaryGold}>
                                {draftQty}
                              </Text>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Increase"
                                icon={<Text fontWeight="900">+</Text>}
                                onClick={() => handleUpdateDraftQty(item._id, draftQty + 1)}
                              />
                            </HStack>
                          ) : (
                            <Button
                              size="xs"
                              w="100%"
                              variant="outline"
                              borderColor={STAFF_COLORS.border}
                              borderRadius="xl"
                              leftIcon={<FiPlus />}
                              onClick={() => handleAddItemToDraft(item)}
                              _hover={{ borderColor: STAFF_COLORS.primaryGold, bg: STAFF_COLORS.goldSubtle }}
                            >
                              Add Dish
                            </Button>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}
            </VStack>
          </Box>

          {/* Right Column: Floor Order Summary Draft */}
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
            <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text} textTransform="uppercase" letterSpacing="wider" mb={4}>
              Order Summary Draft
            </Text>

            <VStack spacing={3} align="stretch" mb={4}>
              {/* Table Selector */}
              <Box>
                <Text fontSize="xs" color={STAFF_COLORS.secondaryText} mb={1}>
                  Select Floor Table:
                </Text>
                <Select
                  size="sm"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                >
                  <option value="" style={{ background: STAFF_COLORS.sidebar }}>Choose Table...</option>
                  {tables.map((tbl) => (
                    <option key={tbl._id} value={tbl._id} style={{ background: STAFF_COLORS.sidebar }}>
                      Table #{tbl.tableNumber} ({tbl.capacity} Guests - {tbl.status})
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Guest Details (Optional) */}
              <SimpleGrid columns={2} spacing={2}>
                <Input
                  size="sm"
                  placeholder="Guest Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                />
                <Input
                  size="sm"
                  placeholder="Guest Phone (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  bg={STAFF_COLORS.innerCard}
                  borderColor={STAFF_COLORS.border}
                  borderRadius="xl"
                  color={STAFF_COLORS.text}
                />
              </SimpleGrid>

              <Input
                size="sm"
                placeholder="Kitchen Notes (e.g. less spicy, allergy)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                bg={STAFF_COLORS.innerCard}
                borderColor={STAFF_COLORS.border}
                borderRadius="xl"
                color={STAFF_COLORS.text}
              />
            </VStack>

            <Divider borderColor={STAFF_COLORS.border} mb={3} />

            {/* Draft Items List */}
            <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.secondaryText} mb={2}>
              Dishes in Bag ({draftItems.length})
            </Text>

            {draftItems.length === 0 ? (
              <Box py={6} textAlign="center" borderRadius="xl" bg={STAFF_COLORS.innerCard} mb={4}>
                <Text fontSize="xs" color={STAFF_COLORS.mutedText}>
                  No dishes added to order yet. Click "+" on any item from the left menu.
                </Text>
              </Box>
            ) : (
              <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto" mb={4} pr={1}>
                {draftItems.map((item) => (
                  <Box
                    key={item.menuItemId}
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
                          aria-label="Decrease"
                          icon={<Text fontWeight="900">-</Text>}
                          onClick={() => handleUpdateDraftQty(item.menuItemId, item.quantity - 1)}
                        />
                        <Text fontSize="xs" fontWeight="800" px={1}>
                          {item.quantity}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Increase"
                          icon={<Text fontWeight="900">+</Text>}
                          onClick={() => handleUpdateDraftQty(item.menuItemId, item.quantity + 1)}
                        />
                        <IconButton
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Remove"
                          icon={<FiTrash2 />}
                          onClick={() => handleUpdateDraftQty(item.menuItemId, 0)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Calculations Breakdown */}
            <VStack spacing={1.5} align="stretch" fontSize="xs" mb={4}>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Subtotal</Text>
                <Text color={STAFF_COLORS.text}>₹{draftSubtotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={STAFF_COLORS.secondaryText}>Est. Taxes (5%)</Text>
                <Text color={STAFF_COLORS.text}>₹{draftEstimatedTax.toFixed(2)}</Text>
              </Flex>
              <Divider borderColor={STAFF_COLORS.border} my={1} />
              <Flex justify="space-between" fontSize="sm">
                <Text fontWeight="800" color={STAFF_COLORS.text}>
                  Total
                </Text>
                <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontSize="md">
                  ₹{draftTotal.toFixed(2)}
                </Text>
              </Flex>
            </VStack>

            <Button
              w="100%"
              bg={STAFF_COLORS.primaryGold}
              color="#0B0B0D"
              _hover={{ bg: STAFF_COLORS.lightGold }}
              borderRadius="xl"
              leftIcon={<FiSend />}
              onClick={handleSubmitFloorOrder}
              isLoading={isSubmittingOrder}
              isDisabled={draftItems.length === 0 || !selectedTableId}
            >
              Transmit Order to Kitchen
            </Button>
          </Box>
        </SimpleGrid>
      )}

      {/* VIEW 4: READY FOR SERVICE ORDERS */}
      {activeTab === 'ready' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="sm" color={STAFF_COLORS.text}>
                Dishes Ready for Floor Delivery
              </Heading>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                These orders have completed kitchen preparation and require immediate server pickup.
              </Text>
            </Box>
            <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="xs">
              {readyOrders.length} Ready
            </Badge>
          </Flex>

          {readyOrders.length === 0 ? (
            <EmptyState
              title="No Orders Waiting for Delivery"
              message="All prepared dishes have been delivered to tables or kitchen is still cooking."
              icon={FaConciergeBell}
            />
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
              {readyOrders.map((order) => (
                <Box
                  key={order._id}
                  p={5}
                  borderRadius="2xl"
                  bg={STAFF_COLORS.card}
                  borderWidth="1px"
                  borderColor={STAFF_COLORS.success}
                  boxShadow="0 4px 20px rgba(34, 197, 94, 0.15)"
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box>
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                          #{order.orderNumber}
                        </Text>
                        <Badge colorScheme="green" fontSize="10px">READY</Badge>
                      </HStack>
                      <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.text} mt={1}>
                        {order.orderType === 'dine-in'
                          ? `Deliver to Table #${order.tableNumber || (order.tableId as any)?.tableNumber || 'Assigned'}`
                          : 'Counter Pickup / Takeaway'}
                      </Text>
                    </Box>

                    <Button
                      size="sm"
                      bg={STAFF_COLORS.success}
                      color="#0B0B0D"
                      _hover={{ opacity: 0.9 }}
                      borderRadius="xl"
                      leftIcon={<FiCheckCircle />}
                      onClick={() => handleMarkServed(order._id)}
                      isLoading={actionInProgress === order._id}
                    >
                      Serve
                    </Button>
                  </Flex>

                  <Divider borderColor={STAFF_COLORS.border} mb={3} />

                  <VStack spacing={1.5} align="stretch" fontSize="xs" mb={3}>
                    {order.items?.map((it, idx) => (
                      <Flex key={idx} justify="space-between">
                        <Text color={STAFF_COLORS.text}>
                          {it.quantity}x {it.name}
                        </Text>
                        {it.variantName && (
                          <Text color={STAFF_COLORS.secondaryText}>{it.variantName}</Text>
                        )}
                      </Flex>
                    ))}
                  </VStack>

                  {order.notes && (
                    <Box p={2} borderRadius="lg" bg="rgba(245, 158, 11, 0.1)" mb={3}>
                      <Text fontSize="10px" color={STAFF_COLORS.warning} fontStyle="italic">
                        Note: "{order.notes}"
                      </Text>
                    </Box>
                  )}

                  <Button
                    size="xs"
                    w="100%"
                    variant="outline"
                    borderColor={STAFF_COLORS.border}
                    borderRadius="lg"
                    leftIcon={<FiEye />}
                    onClick={() => {
                      setInspectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View Ticket Details
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      )}

      {/* VIEW 5: ACTIVE FLOOR ORDERS */}
      {activeTab === 'active_orders' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchBar
              value={orderSearchQuery}
              onChange={setOrderSearchQuery}
              placeholder="Search active orders by order # or table..."
              maxW="320px"
            />
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
              {activeOrdersList.length} Active Floor Orders
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
                      ? `Table #${o.tableNumber || (o.tableId as any)?.tableNumber || 'Assigned'}`
                      : 'Takeaway'}
                  </Badge>
                ),
              },
              {
                header: 'Dishes',
                cell: (o) => (
                  <Text fontSize="xs" noOfLines={1} maxW="240px">
                    {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </Text>
                ),
              },
              {
                header: 'Status',
                cell: (o) => (
                  <Badge
                    colorScheme={
                      o.fulfillmentStatus === 'ready_for_pickup'
                        ? 'green'
                        : o.fulfillmentStatus === 'preparing'
                        ? 'yellow'
                        : 'blue'
                    }
                  >
                    {o.fulfillmentStatus.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Total',
                cell: (o) => (
                  <Text fontWeight="700">₹{o.grandTotal?.toFixed(2)}</Text>
                ),
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
                      variant="outline"
                      borderColor={STAFF_COLORS.borderGold}
                      color={STAFF_COLORS.primaryGold}
                      leftIcon={<FaReceipt />}
                      onClick={() => {
                        setTargetOrderForBill(o);
                        setBillModalOpen(true);
                      }}
                    >
                      Bill
                    </Button>
                  </HStack>
                ),
              },
            ]}
            data={activeOrdersList.filter(
              (o) =>
                !orderSearchQuery ||
                o.orderNumber.includes(orderSearchQuery) ||
                (o.tableNumber && o.tableNumber.includes(orderSearchQuery))
            )}
            emptyMessage="No active floor orders in progress."
          />
        </VStack>
      )}

      {/* VIEW 6: SERVED ORDERS TODAY */}
      {activeTab === 'served_orders' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="sm" color={STAFF_COLORS.text}>
                Served Orders Record
              </Heading>
              <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
                Dishes successfully handed over to guests today.
              </Text>
            </Box>
            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
              {servedOrdersList.length} Served
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
                header: 'Table',
                cell: (o) => (
                  <Text fontWeight="600">
                    {o.tableNumber ? `Table #${o.tableNumber}` : 'Takeaway'}
                  </Text>
                ),
              },
              {
                header: 'Customer',
                cell: (o) => <Text>{o.customerName || 'Guest'}</Text>,
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
                header: 'Payment',
                cell: (o) => (
                  <Badge colorScheme={o.paymentStatus === 'paid' ? 'green' : 'orange'}>
                    {o.paymentStatus.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Total',
                cell: (o) => <Text fontWeight="700">₹{o.grandTotal?.toFixed(2)}</Text>,
              },
              {
                header: 'Actions',
                align: 'right',
                cell: (o) => (
                  <Button
                    size="xs"
                    variant="ghost"
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
            data={servedOrdersList}
            emptyMessage="No served orders recorded yet today."
          />
        </VStack>
      )}

      {/* VIEW 7: ORDER HISTORY */}
      {activeTab === 'order_history' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchBar
              value={orderSearchQuery}
              onChange={setOrderSearchQuery}
              placeholder="Search historical records..."
              maxW="300px"
            />
            <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
              Showing all {orders.length} order entries
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
                header: 'Table / Mode',
                cell: (o) => (
                  <Badge colorScheme={o.orderType === 'dine-in' ? 'orange' : 'teal'}>
                    {o.orderType === 'dine-in' ? `Table #${o.tableNumber || '-'}` : 'Takeaway'}
                  </Badge>
                ),
              },
              {
                header: 'Status',
                cell: (o) => (
                  <Badge
                    colorScheme={
                      o.fulfillmentStatus === 'completed'
                        ? 'green'
                        : o.fulfillmentStatus === 'cancelled'
                        ? 'red'
                        : 'yellow'
                    }
                  >
                    {o.fulfillmentStatus.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Total',
                cell: (o) => <Text fontWeight="700">₹{o.grandTotal?.toFixed(2)}</Text>,
              },
              {
                header: 'Details',
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
                    Inspect
                  </Button>
                ),
              },
            ]}
            data={orders.filter(
              (o) =>
                !orderSearchQuery ||
                o.orderNumber.includes(orderSearchQuery) ||
                (o.customerName && o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()))
            )}
            emptyMessage="No order records located."
          />
        </VStack>
      )}

      {/* VIEW 8: MENU CATALOG REFERENCE */}
      {activeTab === 'menu' && (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <SearchBar
              value={menuSearchQuery}
              onChange={setMenuSearchQuery}
              placeholder="Search reference catalog..."
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
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} style={{ background: STAFF_COLORS.sidebar }}>{cat}</option>
              ))}
            </Select>
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
            {filteredMenuItems.map((item) => (
              <Box
                key={item._id}
                p={4}
                borderRadius="2xl"
                bg={STAFF_COLORS.card}
                borderWidth="1px"
                borderColor={STAFF_COLORS.border}
              >
                <Flex justify="space-between" align="flex-start">
                  <Box flex="1">
                    <HStack spacing={2} mb={1}>
                      <Badge
                        fontSize="9px"
                        colorScheme={item.isVegetarian ? 'green' : 'red'}
                      >
                        {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                      </Badge>
                      {item.isGlutenFree && (
                        <Badge fontSize="9px" colorScheme="purple">
                          GLUTEN-FREE
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" fontWeight="800" color={STAFF_COLORS.text}>
                      {item.name}
                    </Text>
                    <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.primaryGold} mt={0.5}>
                      ₹{item.basePrice.toFixed(2)}
                    </Text>
                    {item.description && (
                      <Text fontSize="11px" color={STAFF_COLORS.secondaryText} mt={1} noOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </Box>
                  {item.images && item.images.length > 0 && (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      w="56px"
                      h="56px"
                      borderRadius="xl"
                      objectFit="cover"
                      fallbackSrc="https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=100&q=80"
                    />
                  )}
                </Flex>

                {item.allergens && item.allergens.length > 0 && (
                  <Text fontSize="10px" color="orange.400" mt={2}>
                    Allergens: {item.allergens.join(', ')}
                  </Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* Shared Order Details Drawer */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={inspectedOrder}
        role="waiter"
        onAction={(action, ord) => {
          if (action === 'mark_served') {
            handleMarkServed(ord._id);
          } else if (action === 'request_bill') {
            setTargetOrderForBill(ord);
            setIsDrawerOpen(false);
            setBillModalOpen(true);
          }
        }}
        actionLoading={!!actionInProgress}
      />

      {/* Request Bill Confirmation Modal */}
      <ConfirmationModal
        isOpen={billModalOpen}
        onClose={() => {
          setBillModalOpen(false);
          setTargetOrderForBill(null);
        }}
        onConfirm={handleRequestBill}
        title={`Request Bill for Order #${targetOrderForBill?.orderNumber || ''}`}
        message={`Are you ready to request the checkout bill for Table #${
          targetOrderForBill?.tableNumber || 'this table'
        }? The cashier will prepare the settlement invoice.`}
        confirmText="Confirm Bill Request"
        colorScheme="gold"
        isLoading={!!actionInProgress}
      />
    </WaiterLayout>
  );
};
