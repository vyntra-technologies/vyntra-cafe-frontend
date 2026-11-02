import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
  Spinner,
  Center,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPrinter,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { orderService } from '../../services/order.service';
import { socketService } from '../../services/socket.service';
import { IOrder, FulfillmentStatus, PaymentStatus, OrderType } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [cancellationRequests, setCancellationRequests] = useState<IOrder[]>([]); 
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Status Update & Cancellation Modal States
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isStatusModalOpen,
    onOpen: onStatusModalOpen,
    onClose: onStatusModalClose,
  } = useDisclosure();
  const {
    isOpen: isCancelReviewOpen,
    onOpen: onCancelReviewOpen,
    onClose: onCancelReviewClose,
  } = useDisclosure();

  const [newStatus, setNewStatus] = useState<FulfillmentStatus>('preparing');
  const [statusNote, setStatusNote] = useState<string>('');
  const [cancelDecision, setCancelDecision] = useState<'approve' | 'reject'>('approve');
  const [cancelReviewNote, setCancelReviewNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await orderService.getAll({
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        orderType: orderTypeFilter || undefined,
      });
      setOrders(res.orders);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || res.orders.length);
      }
    } catch (err: any) {
      toast({
        title: 'Failed to fetch orders',
        description: err?.response?.data?.message || 'Error communicating with backend',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCancellations = async () => {
    try {
      const pending = await orderService.listCancellationRequests();
      setCancellationRequests(pending);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCancellations();

    const handleRealtimeOrder = () => {
      fetchOrders();
      fetchCancellations();
    };

    socketService.on('new_order', handleRealtimeOrder);
    socketService.on('order_status_updated', handleRealtimeOrder);
    socketService.on('cancellation_request', handleRealtimeOrder);

    return () => {
      socketService.off('new_order', handleRealtimeOrder);
      socketService.off('order_status_updated', handleRealtimeOrder);
      socketService.off('cancellation_request', handleRealtimeOrder);
    };
  }, [page, statusFilter, paymentStatusFilter, orderTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsSubmitting(true);
      const updated = await orderService.updateStatus(selectedOrder._id, newStatus, statusNote);
      toast({
        title: 'Status Updated',
        description: `Order #${updated.orderNumber} updated to ${newStatus.toUpperCase()}`,
        status: 'success',
        duration: 3000,
      });
      onStatusModalClose();
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.response?.data?.message || 'Unauthorized or invalid status transition',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancellationDecision = async () => {
    if (!selectedOrder) return;
    try {
      setIsSubmitting(true);
      if (cancelDecision === 'approve') {
        await orderService.approveCancellation(selectedOrder._id, cancelReviewNote);
        toast({
          title: 'Cancellation Approved',
          description: `Order #${selectedOrder.orderNumber} has been officially cancelled.`,
          status: 'info',
          duration: 3000,
        });
      } else {
        await orderService.rejectCancellation(selectedOrder._id, cancelReviewNote);
        toast({
          title: 'Cancellation Rejected',
          description: `Customer cancellation request for order #${selectedOrder.orderNumber} was declined.`,
          status: 'warning',
          duration: 3000,
        });
      }
      onCancelReviewClose();
      fetchOrders();
      fetchCancellations();
    } catch (err: any) {
      toast({
        title: 'Decision Error',
        description: err?.response?.data?.message || 'Failed to submit cancellation decision',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'served':
        return <Badge colorScheme="green" variant="subtle">{status.toUpperCase()}</Badge>;
      case 'ready_for_pickup':
        return <Badge colorScheme="purple" variant="solid">READY</Badge>;
      case 'preparing':
        return <Badge colorScheme="yellow" variant="solid">PREPARING</Badge>;
      case 'confirmed':
      case 'placed':
        return <Badge colorScheme="blue" variant="subtle">{status.toUpperCase()}</Badge>;
      case 'cancelled':
        return <Badge colorScheme="red" variant="subtle">CANCELLED</Badge>;
      default:
        return <Badge colorScheme="gray">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge colorScheme="green">PAID</Badge>;
      case 'pending':
        return <Badge colorScheme="orange">PENDING</Badge>;
      case 'refunded':
        return <Badge colorScheme="purple">REFUNDED</Badge>;
      default:
        return <Badge colorScheme="red">FAILED</Badge>;
    }
  };

  return (
    <AdminLayout pageTitle="Order Management">
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
              Order Central
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Live order fulfillment, ticket management, and cancellation reviews.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={() => {
                fetchOrders();
                fetchCancellations();
              }}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Refresh Tickets
            </Button>
          </HStack>
        </Flex>

        {/* Tab Controls: Active / All Orders vs Pending Cancellation Requests */}
        <Tabs
          variant="line"
          colorScheme="yellow"
          onChange={(index) => setActiveTab(index)}
          mb={6}
        >
          <TabList borderColor={borderColor}>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              All Orders ({totalCount})
            </Tab>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              Cancellation Requests
              {cancellationRequests.length > 0 && (
                <Badge ml={2} bg="red.500" color="white" borderRadius="full">
                  {cancellationRequests.length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: All Orders List */}
            <TabPanel p={0} pt={4}>
              {/* Filter Controls Bar */}
              <Box
                p={4}
                mb={6}
                borderRadius="xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <form onSubmit={handleSearchSubmit}>
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    gap={3}
                    align={{ base: 'stretch', md: 'center' }}
                  >
                    <Box flex={1} position="relative">
                      <Input
                        placeholder="Search by order #, customer name, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="sm"
                        bg={innerCardBg}
                        borderColor={borderColor}
                        color={textColor}
                        _placeholder={{ color: mutedColor }}
                      />
                    </Box>

                    <Select
                      placeholder="All Fulfillment Statuses"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      size="sm"
                      maxW={{ base: '100%', md: '180px' }}
                      bg={innerCardBg}
                      borderColor={borderColor}
                      color={textColor}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>

                    <Select
                      placeholder="All Payment Statuses"
                      value={paymentStatusFilter}
                      onChange={(e) => {
                        setPaymentStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      size="sm"
                      maxW={{ base: '100%', md: '160px' }}
                      bg={innerCardBg}
                      borderColor={borderColor}
                      color={textColor}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </Select>

                    <Select
                      placeholder="All Types"
                      value={orderTypeFilter}
                      onChange={(e) => {
                        setOrderTypeFilter(e.target.value);
                        setPage(1);
                      }}
                      size="sm"
                      maxW={{ base: '100%', md: '140px' }}
                      bg={innerCardBg}
                      borderColor={borderColor}
                      color={textColor}
                    >
                      <option value="dine-in">Dine-In</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="online">Online</option>
                    </Select>

                    <Button
                      type="submit"
                      size="sm"
                      bg={goldAccent}
                      color="black"
                      leftIcon={<FiSearch />}
                      fontWeight="600"
                    >
                      Filter
                    </Button>
                  </Flex>
                </form>
              </Box>

              {/* Orders Data Table */}
              <Box
                borderRadius="xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                overflowX="auto"
              >
                <Table size="md" variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th color={mutedColor} borderColor={borderColor}>Order #</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Customer / Table</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Type</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Items</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Total</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Payment</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Fulfillment</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Created At</Th>
                      <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py={12}>
                          <Spinner color={goldAccent} />
                          <Text mt={2} fontSize="sm" color={mutedColor}>Loading orders...</Text>
                        </Td>
                      </Tr>
                    ) : orders.length === 0 ? (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py={12} color={mutedColor}>
                          No orders matched your current filters.
                        </Td>
                      </Tr>
                    ) : (
                      orders.map((order) => (
                        <Tr key={order._id} _hover={{ bg: innerCardBg }}>
                          <Td fontWeight="700" color={goldAccent} borderColor={borderColor}>
                            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text fontSize="13px" fontWeight="600" color={textColor}>
                              {order.customerName || 'Walk-in Guest'}
                            </Text>
                            <Text fontSize="11px" color={mutedColor}>
                              {order.orderType === 'dine-in' ? `Table ${order.tableNumber || (order.tableId as any)?.tableNumber || '-'}` : (order.customerPhone || 'Counter')}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} textTransform="capitalize" fontSize="13px">
                            {order.orderType}
                          </Td>
                          <Td borderColor={borderColor} fontSize="13px">
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                          </Td>
                          <Td fontWeight="700" color={textColor} borderColor={borderColor}>
                            ₹{order.grandTotal.toFixed(2)}
                          </Td>
                          <Td borderColor={borderColor}>
                            {getPaymentBadge(order.paymentStatus)}
                          </Td>
                          <Td borderColor={borderColor}>
                            {getStatusBadge(order.fulfillmentStatus)}
                          </Td>
                          <Td borderColor={borderColor} fontSize="12px" color={mutedColor}>
                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Td>
                          <Td borderColor={borderColor} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <IconButton
                                aria-label="View Details"
                                icon={<FiEye />}
                                size="xs"
                                variant="outline"
                                borderColor={borderColor}
                                color={textColor}
                                _hover={{ borderColor: goldAccent, color: goldAccent }}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  onDetailOpen();
                                }}
                              />
                              <Button
                                size="xs"
                                variant="solid"
                                bg={goldAccent}
                                color="black"
                                fontWeight="600"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.fulfillmentStatus);
                                  onStatusModalOpen();
                                }}
                              >
                                Update
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>

                {/* Pagination Controls */}
                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderTop="1px solid"
                  borderColor={borderColor}
                  fontSize="sm"
                  color={mutedColor}
                >
                  <Text>
                    Page {page} of {totalPages} &bull; Showing {orders.length} tickets
                  </Text>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Previous Page"
                      icon={<FiChevronLeft />}
                      size="sm"
                      variant="outline"
                      borderColor={borderColor}
                      isDisabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                    <IconButton
                      aria-label="Next Page"
                      icon={<FiChevronRight />}
                      size="sm"
                      variant="outline"
                      borderColor={borderColor}
                      isDisabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </HStack>
                </Flex>
              </Box>
            </TabPanel>

            {/* Tab 2: Pending Cancellation Requests */}
            <TabPanel p={0} pt={4}>
              <Box
                borderRadius="xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                overflowX="auto"
              >
                <Table size="md" variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th color={mutedColor} borderColor={borderColor}>Order #</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Customer</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Grand Total</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Reason for Cancellation</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Requested At</Th>
                      <Th color={mutedColor} borderColor={borderColor} textAlign="right">Review Decision</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cancellationRequests.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={12} color={mutedColor}>
                          No pending customer cancellation requests.
                        </Td>
                      </Tr>
                    ) : (
                      cancellationRequests.map((order) => (
                        <Tr key={order._id} _hover={{ bg: innerCardBg }}>
                          <Td fontWeight="700" color={goldAccent} borderColor={borderColor}>
                            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text fontSize="13px" fontWeight="600" color={textColor}>
                              {order.customerName || 'Customer'}
                            </Text>
                            <Text fontSize="11px" color={mutedColor}>
                              {order.customerPhone}
                            </Text>
                          </Td>
                          <Td fontWeight="700" color={textColor} borderColor={borderColor}>
                            ₹{order.grandTotal.toFixed(2)}
                          </Td>
                          <Td borderColor={borderColor} maxW="300px">
                            <Text fontSize="13px" color="red.400" fontStyle="italic">
                              "{order.cancellationRequest?.reason || 'Customer requested order cancellation'}"
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} fontSize="12px" color={mutedColor}>
                            {order.cancellationRequest?.requestedAt
                              ? new Date(order.cancellationRequest.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </Td>
                          <Td borderColor={borderColor} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Button
                                size="xs"
                                colorScheme="green"
                                leftIcon={<FiCheckCircle />}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setCancelDecision('approve');
                                  onCancelReviewOpen();
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<FiXCircle />}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setCancelDecision('reject');
                                  onCancelReviewOpen();
                                }}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl" isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                <Flex justify="space-between" align="center" pr={6}>
                  <Box>
                    <Text fontSize="xs" color={goldAccent} fontWeight="700" letterSpacing="0.05em">
                      ORDER TICKET #{selectedOrder.orderNumber}
                    </Text>
                    <Heading fontSize="lg" color={textColor}>
                      {selectedOrder.orderType.toUpperCase()} DETAILS
                    </Heading>
                  </Box>
                  <HStack spacing={2}>
                    {getStatusBadge(selectedOrder.fulfillmentStatus)}
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </HStack>
                </Flex>
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                {/* Customer & Fulfillment Info */}
                <SimpleGrid columns={2} spacing={4} mb={5} p={3.5} borderRadius="lg" bg={innerCardBg}>
                  <Box>
                    <Text fontSize="11px" color={mutedColor} textTransform="uppercase">Customer Details</Text>
                    <Text fontSize="sm" fontWeight="600" color={textColor}>{selectedOrder.customerName || 'Walk-in'}</Text>
                    <Text fontSize="xs" color={mutedColor}>{selectedOrder.customerPhone || 'No contact provided'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="11px" color={mutedColor} textTransform="uppercase">Dining Assignment</Text>
                    <Text fontSize="sm" fontWeight="600" color={goldAccent}>
                      {selectedOrder.orderType === 'dine-in' ? `Table ${selectedOrder.tableNumber || 'Assigned'}` : 'Takeaway / Pickup'}
                    </Text>
                    <Text fontSize="xs" color={mutedColor}>Payment: {selectedOrder.paymentMethod.toUpperCase()}</Text>
                  </Box>
                </SimpleGrid>

                {/* Items Breakdown Table */}
                <Text fontSize="xs" fontWeight="700" color={textColor} mb={2} textTransform="uppercase">
                  Itemized Order Breakdown
                </Text>
                <VStack spacing={2} align="stretch" mb={4} divider={<Divider borderColor={borderColor} />}>
                  {selectedOrder.items.map((item, idx) => (
                    <Flex key={idx} justify="space-between" align="center" py={1.5}>
                      <Box>
                        <HStack spacing={2}>
                          <Text fontWeight="600" fontSize="sm" color={textColor}>
                            {item.quantity}x {item.name}
                          </Text>
                          {item.variantName && (
                            <Badge variant="outline" colorScheme="yellow" fontSize="10px">
                              {item.variantName}
                            </Badge>
                          )}
                        </HStack>
                        {item.addOns && item.addOns.length > 0 && (
                          <Text fontSize="11px" color={mutedColor}>
                            Add-ons: {item.addOns.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                          </Text>
                        )}
                        {item.notes && (
                          <Text fontSize="11px" color="orange.400" fontStyle="italic">
                            Note: {item.notes}
                          </Text>
                        )}
                      </Box>
                      <Text fontWeight="700" color={textColor} fontSize="sm">
                        ₹{(item.itemTotal || item.unitPrice * item.quantity).toFixed(2)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>

                {/* Subtotals & Taxes */}
                <Box p={3.5} borderRadius="lg" bg={innerCardBg}>
                  <Flex justify="space-between" fontSize="xs" color={mutedColor} mb={1}>
                    <Text>Subtotal</Text>
                    <Text>₹{selectedOrder.subtotal.toFixed(2)}</Text>
                  </Flex>
                  {selectedOrder.discount > 0 && (
                    <Flex justify="space-between" fontSize="xs" color="green.400" mb={1}>
                      <Text>Discount ({selectedOrder.discountCode || 'PROMO'})</Text>
                      <Text>-₹{selectedOrder.discount.toFixed(2)}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" fontSize="xs" color={mutedColor} mb={2}>
                    <Text>Taxes & GST</Text>
                    <Text>₹{selectedOrder.taxAmount.toFixed(2)}</Text>
                  </Flex>
                  <Divider borderColor={borderColor} my={2} />
                  <Flex justify="space-between" fontSize="md" fontWeight="700" color={goldAccent}>
                    <Text>Grand Total</Text>
                    <Text>₹{selectedOrder.grandTotal.toFixed(2)}</Text>
                  </Flex>
                </Box>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button
                  leftIcon={<FiPrinter />}
                  variant="outline"
                  borderColor={borderColor}
                  size="sm"
                  mr="auto"
                  onClick={() => window.print()}
                >
                  Print Receipt
                </Button>
                <Button variant="ghost" size="sm" onClick={onDetailClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Update Fulfillment Status Modal */}
        {selectedOrder && (
          <Modal isOpen={isStatusModalOpen} onClose={onStatusModalClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Update Fulfillment Status &bull; #{selectedOrder.orderNumber}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <FormControl mb={4}>
                  <FormLabel fontSize="xs" color={mutedColor}>Target Status</FormLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as FulfillmentStatus)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    color={textColor}
                  >
                    <option value="placed">Placed (Order Received)</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing in Kitchen</option>
                    <option value="ready_for_pickup">Ready for Pickup / Serving</option>
                    <option value="served">Served to Table</option>
                    <option value="completed">Completed (Closed)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Internal Kitchen Note (Optional)</FormLabel>
                  <Textarea
                    placeholder="e.g. Expedited ticket, extra napkins included..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    fontSize="sm"
                    rows={3}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onStatusModalClose}>
                  Cancel
                </Button>
                <Button
                  bg={goldAccent}
                  color="black"
                  size="sm"
                  fontWeight="600"
                  isLoading={isSubmitting}
                  onClick={handleUpdateStatus}
                >
                  Save Status
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Cancellation Review Modal */}
        {selectedOrder && (
          <Modal isOpen={isCancelReviewOpen} onClose={onCancelReviewClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                {cancelDecision === 'approve' ? 'Approve Cancellation' : 'Reject Cancellation'}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <Text fontSize="sm" mb={4}>
                  Customer Reason: <Text as="span" fontWeight="bold" color="red.400">"{selectedOrder.cancellationRequest?.reason}"</Text>
                </Text>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Manager Decision Note</FormLabel>
                  <Textarea
                    placeholder={cancelDecision === 'approve' ? 'Reason for approving cancellation...' : 'Explanation for rejection (e.g. food already in prep)...'}
                    value={cancelReviewNote}
                    onChange={(e) => setCancelReviewNote(e.target.value)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    fontSize="sm"
                    rows={3}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onCancelReviewClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme={cancelDecision === 'approve' ? 'green' : 'red'}
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleCancellationDecision}
                >
                  Confirm {cancelDecision === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </AdminLayout>
  );
};
