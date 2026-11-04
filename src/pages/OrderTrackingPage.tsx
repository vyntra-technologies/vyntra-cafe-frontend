import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Divider,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  useToast,
  Progress,
  Tooltip,
  IconButton,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiAlertTriangle,
  FiRefreshCw,
  FiCoffee,
  FiCheck,
  FiArrowRight,
  FiPhone,
  FiPrinter,
  FiRotateCcw,
  FiUser,
  FiHash,
  FiShield,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi';
import {
  FaUtensils,
  FaConciergeBell,
  FaReceipt,
  FaWhatsapp,
  FaMotorcycle,
} from 'react-icons/fa';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { orderService, CancellationRequest } from '../services/order.service';
import { socketService } from '../services/socket.service';
import { settingsService } from '../services/settings.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  IOrder,
  FulfillmentStatus,
  PaymentStatus,
  ISettings,
  IMenuItem,
} from '../types';

interface TimelineStep {
  status: FulfillmentStatus;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const STATUS_STEPS: TimelineStep[] = [
  { status: 'placed', label: 'Order Received', desc: 'Sent to kitchen system', icon: FiClock },
  { status: 'confirmed', label: 'Confirmed', desc: 'Accepted by chef & barista', icon: FiCoffee },
  { status: 'preparing', label: 'In Kitchen', desc: 'Fresh culinary preparation', icon: FaUtensils },
  { status: 'ready_for_pickup', label: 'Ready', desc: 'Ready for table delivery / pickup', icon: FaConciergeBell },
  { status: 'served', label: 'Served', desc: 'Delivered to table', icon: FiCheckCircle },
  { status: 'completed', label: 'Completed', desc: 'Delivered & closed', icon: FiCheck },
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, customerId } = useAuth();
  const { addItem } = useCart();

  // Modals
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const {
    isOpen: isReceiptOpen,
    onOpen: onReceiptOpen,
    onClose: onReceiptClose,
  } = useDisclosure();
  const {
    isOpen: isContactOpen,
    onOpen: onContactOpen,
    onClose: onContactClose,
  } = useDisclosure();

  // Core Data States
  const [order, setOrder] = useState<IOrder | null>(null);
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Cancellation State
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancellationRequest, setCancellationRequest] = useState<CancellationRequest | null>(null);

  // UI Interactive States
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const pollingRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Theme Styling
  const cardBg = useColorModeValue('#FFFFFF', '#141519');
  const innerCardBg = useColorModeValue('#F9F9FA', '#1A1B22');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const subtleBorder = useColorModeValue('gray.200', 'whiteAlpha.100');
  const textColor = useColorModeValue('#666666', '#A1A1AA');
  const headingColor = useColorModeValue('#1A1A1A', '#F9F7F1');
  const accentColor = '#D4AF72';
  const accentHover = '#C69234';

  // Fetch Order Details
  const fetchOrder = async (isManual = false) => {
    if (!id) return;
    if (isManual) setIsRefreshing(true);

    try {
      const data = await orderService.getById(id);
      setOrder(data);
      setFetchError(null);
      setLastRefreshedAt(new Date());
      setSecondsAgo(0);

      // Check cancellation request status (backend priority, fallback to local storage)
      if (data.cancellationRequest) {
        setCancellationRequest({
          orderId: data._id,
          reason: data.cancellationRequest.reason,
          submittedAt: data.cancellationRequest.requestedAt,
          status: data.cancellationRequest.status === 'approved'
            ? 'approved'
            : data.cancellationRequest.status === 'rejected'
            ? 'rejected'
            : 'pending_review',
        });
      } else {
        const localReq = orderService.getCancellationRequest(data._id);
        setCancellationRequest(localReq);
      }
    } catch (err: any) {
      if (isManual) {
        toast({
          title: 'Refresh Failed',
          description: err?.response?.data?.message || 'Unable to update order status at this time.',
          status: 'error',
          duration: 3000,
        });
      } else {
        setFetchError(err?.response?.data?.message || 'Order could not be located or network error.');
      }
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  // Initial Load & Settings
  useEffect(() => {
    fetchOrder(false);

    settingsService
      .get()
      .then((data) => setSettings(data))
      .catch(() => {});
  }, [id]);

  // Seconds since refresh timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Socket.IO Real-time Connection & Controlled Polling
  useEffect(() => {
    if (!id) return;

    // Join order-specific socket room
    socketService.joinOrder(id);

    const handleRealtimeStatus = (data: any) => {
      if (data.orderId === id || data._id === id) {
        fetchOrder(false);

        const newStatus = data.fulfillmentStatus || data.status;
        if (newStatus) {
          const readable = String(newStatus).replace(/_/g, ' ').toUpperCase();
          toast({
            title: 'Live Order Update',
            description: `Order status is now: ${readable}`,
            status: 'info',
            duration: 4000,
            position: 'top-right',
            isClosable: true,
          });
        }
      }
    };

    const handleOrderReady = (data: any) => {
      if (data.orderId === id) {
        fetchOrder(false);
        toast({
          title: 'Order Ready! ☕',
          description: data.tableNumber
            ? `Your order is ready. Server is delivering to Table ${data.tableNumber}.`
            : 'Your order is ready for pickup at the main counter.',
          status: 'success',
          duration: 7000,
          position: 'top-right',
          isClosable: true,
        });
      }
    };

    const handleCancellationEvent = (data: any) => {
      if (data.orderId === id) {
        fetchOrder(false);
      }
    };

    const handleBillingEvent = (data: any) => {
      if (data.orderId === id) {
        fetchOrder(false);
        toast({
          title: 'Payment Status Updated',
          description: 'Payment settlement recorded successfully.',
          status: 'info',
          duration: 3500,
          position: 'top-right',
        });
      }
    };

    // Socket subscriptions
    const unsubStatus = socketService.onOrderStatusChange(handleRealtimeStatus);
    const unsubReady = socketService.onOrderReady(handleOrderReady);
    const unsubStatusGeneral = socketService.on('order:status-changed', handleRealtimeStatus);
    const unsubUpdated = socketService.on('order:updated', handleRealtimeStatus);
    const unsubCancel = socketService.on('cancellation_request', handleCancellationEvent);
    const unsubBilling = socketService.on('billing:payment-recorded', handleBillingEvent);

    // Controlled API Polling fallback (every 15s while active)
    const activeStatuses: FulfillmentStatus[] = ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'served'];
    if (order && activeStatuses.includes(order.fulfillmentStatus)) {
      pollingRef.current = setInterval(() => {
        fetchOrder(false);
      }, 15000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    return () => {
      unsubStatus();
      unsubReady();
      unsubStatusGeneral();
      unsubUpdated();
      unsubCancel();
      unsubBilling();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, order?.fulfillmentStatus]);

  // Authorization Check: Customer can only access their own orders (unless admin/staff)
  const isAuthorizedToView = useMemo(() => {
    if (!order) return true;

    const isStaff =
      user?.role &&
      ['ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER', 'STAFF'].includes(
        user.role.toUpperCase()
      );

    if (isStaff) return true;

    const orderCustomerId =
      typeof order.customerId === 'object' && order.customerId !== null
        ? (order.customerId as any)._id
        : order.customerId;

    // Matches logged-in user or stored customer ID
    if (user?._id && orderCustomerId && user._id === orderCustomerId) return true;
    if (customerId && orderCustomerId && customerId === orderCustomerId) return true;

    // Matches locally stored orders placed on this client
    const localOrders = orderService.getLocalOrderHistory();
    if (localOrders.includes(order._id)) return true;

    // If order has no customerId assigned (guest dine-in), allow tracking with link
    if (!orderCustomerId) return true;

    return false;
  }, [order, user, customerId]);

  // Handle Cancellation Request Submission (Must require manager approval)
  const handleCancellationRequest = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please describe the reason for your cancellation request.',
        status: 'warning',
        duration: 3500,
      });
      return;
    }

    if (!order) return;

    try {
      setIsSubmittingCancel(true);
      const req = await orderService.requestCancellation(order._id, cancelReason.trim());
      setCancellationRequest(req);
      onCancelClose();
      setCancelReason('');

      toast({
        title: 'Cancellation Request Submitted',
        description: 'Your request has been forwarded to the floor manager for review.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Refetch order to ensure backend synchronization
      fetchOrder(false);
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.response?.data?.message || 'Could not send cancellation request. Please contact staff directly.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Reorder functionality
  const handleReorder = () => {
    if (!order || !order.items.length) return;

    try {
      setIsReordering(true);
      let totalItems = 0;

      order.items.forEach((it) => {
        const fallbackMenuItem: IMenuItem = {
          _id: it.menuItemId || (it as any).id || `reorder-${Date.now()}`,
          name: it.name,
          slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: '',
          category: 'curated',
          images: [],
          basePrice: it.basePrice || it.unitPrice || 0,
          variants: it.variantName
            ? [{ name: it.variantName, priceAdjustment: it.variantPriceAdjustment || 0 }]
            : [],
          addOns: it.addOns ? it.addOns.map((a) => ({ name: a.name, price: a.price })) : [],
          ingredients: [],
          allergens: [],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          preparationTimeMinutes: 15,
          isAvailable: true,
          isFeatured: false,
          isBestseller: false,
          taxPercentage: 5,
        };

        const variant = it.variantName
          ? { name: it.variantName, priceAdjustment: it.variantPriceAdjustment || 0 }
          : undefined;

        const addOns = it.addOns
          ? it.addOns.map((a) => ({ name: a.name, price: a.price }))
          : [];

        addItem(fallbackMenuItem, it.quantity, variant, addOns, it.notes);
        totalItems += it.quantity;
      });

      toast({
        title: 'Items Added to Cart! 🛒',
        description: `${totalItems} item(s) from Order #${order.orderNumber} added to your bag.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      navigate('/cart');
    } catch {
      toast({
        title: 'Reorder Error',
        description: 'Unable to populate bag. Please reselect items from the menu.',
        status: 'error',
      });
    } finally {
      setIsReordering(false);
    }
  };

  // Copy order summary / text receipt to clipboard
  const handleCopySummary = () => {
    if (!order) return;
    const textReceipt = `
========================================
VYNTRA CAFE - ORDER RECEIPT
========================================
Order Number : #${order.orderNumber}
Date         : ${new Date(order.createdAt).toLocaleString('en-IN')}
Order Type   : ${order.orderType.toUpperCase()}${order.tableNumber ? ` (Table #${order.tableNumber})` : ''}
Payment      : ${order.paymentStatus.toUpperCase()} via ${order.paymentMethod.toUpperCase()}

ITEMS:
${order.items.map((i) => `• ${i.quantity}x ${i.name}${i.variantName ? ` (${i.variantName})` : ''} - ₹${i.itemTotal.toFixed(2)}`).join('\n')}

Subtotal     : ₹${order.subtotal?.toFixed(2) || '0.00'}
Discount     : ₹${order.discount?.toFixed(2) || '0.00'}
Taxes        : ₹${order.taxAmount?.toFixed(2) || '0.00'}
GRAND TOTAL  : ₹${order.grandTotal.toFixed(2)}
========================================
Thank you for dining with VYNTRA CAFE!
`.trim();

    navigator.clipboard.writeText(textReceipt);
    setIsCopied(true);
    toast({
      title: 'Copied to Clipboard',
      description: 'Order summary copied.',
      status: 'info',
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Trigger browser print for receipt modal
  const handlePrintReceipt = () => {
    window.print();
  };

  // Calculate current progress timeline index
  const getStepIndex = (status: FulfillmentStatus): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'served':
        return 4;
      case 'completed':
        return 5;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <PageContainer maxW="4xl">
        <VStack spacing={6} align="stretch" py={8}>
          <Flex justify="space-between" align="center">
            <Box>
              <Skeleton height="32px" width="260px" mb={2} borderRadius="lg" />
              <Skeleton height="18px" width="180px" borderRadius="md" />
            </Box>
            <Skeleton height="40px" width="130px" borderRadius="xl" />
          </Flex>

          <Box bg={cardBg} p={8} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Skeleton height="8px" width="100%" mb={8} borderRadius="full" />
            <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
              {[...Array(6)].map((_, i) => (
                <VStack key={i} spacing={3}>
                  <Skeleton height="44px" width="44px" borderRadius="full" />
                  <Skeleton height="14px" width="80px" borderRadius="md" />
                  <Skeleton height="10px" width="60px" borderRadius="sm" />
                </VStack>
              ))}
            </SimpleGrid>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
              <SkeletonText noOfLines={6} spacing={4} />
            </Box>
            <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
              <SkeletonText noOfLines={6} spacing={4} />
            </Box>
          </SimpleGrid>
        </VStack>
      </PageContainer>
    );
  }

  // Not Found / Error State
  if (fetchError || !order) {
    return (
      <PageContainer maxW="2xl">
        <Box
          bg={cardBg}
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
          my={12}
        >
          <Flex
            w="16"
            h="16"
            borderRadius="full"
            bg="red.900"
            color="red.200"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
            fontSize="2xl"
          >
            <FiAlertTriangle />
          </Flex>
          <Heading size="lg" mb={3} color={headingColor} fontFamily="heading">
            Order Not Located
          </Heading>
          <Text color={textColor} mb={6} fontSize="sm">
            {fetchError || 'We could not locate this order record. It may have expired, or the order identifier is invalid.'}
          </Text>
          <HStack spacing={4} justify="center">
            <Button
              variant="outline"
              borderColor={borderColor}
              borderRadius="xl"
              onClick={() => fetchOrder(true)}
              leftIcon={<FiRefreshCw />}
            >
              Retry Connection
            </Button>
            <Button
              as={RouterLink}
              to="/menu"
              bg={accentColor}
              color="#0B0C0E"
              _hover={{ bg: accentHover }}
              borderRadius="xl"
            >
              Explore Menu
            </Button>
          </HStack>
        </Box>
      </PageContainer>
    );
  }

  // Access Restriction State
  if (!isAuthorizedToView) {
    return (
      <PageContainer maxW="2xl">
        <Box
          bg={cardBg}
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor="red.500"
          textAlign="center"
          my={12}
        >
          <Flex
            w="16"
            h="16"
            borderRadius="full"
            bg="rgba(239, 68, 68, 0.15)"
            color="red.400"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
            fontSize="2xl"
          >
            <FiShield />
          </Flex>
          <Heading size="lg" mb={3} color={headingColor} fontFamily="heading">
            Access Restricted
          </Heading>
          <Text color={textColor} mb={6} fontSize="sm">
            This order belongs to a registered customer account. For patron privacy and security, please sign in with the matching credentials or access from the placing terminal.
          </Text>
          <HStack spacing={4} justify="center">
            <Button
              as={RouterLink}
              to="/login"
              bg={accentColor}
              color="#0B0C0E"
              _hover={{ bg: accentHover }}
              borderRadius="xl"
            >
              Sign In to View
            </Button>
            <Button
              as={RouterLink}
              to="/"
              variant="outline"
              borderColor={borderColor}
              borderRadius="xl"
            >
              Return Home
            </Button>
          </HStack>
        </Box>
      </PageContainer>
    );
  }

  const currentStatus = order.fulfillmentStatus;
  const isCancelled = currentStatus === 'cancelled';
  const activeStepIdx = getStepIndex(currentStatus);
  const progressPercent = isCancelled
    ? 0
    : Math.min(100, Math.round(((activeStepIdx + 1) / STATUS_STEPS.length) * 100));

  // Reliable Estimated Prep Time (Only displayed if valid backend value exists)
  const backendPrepTime =
    (order as any).estimatedPreparationTime ||
    (order as any).estimatedTimeMinutes ||
    (order as any).prepTimeMinutes;

  const hasReliablePrepTime =
    typeof backendPrepTime === 'number' && backendPrepTime > 0 && !['completed', 'cancelled', 'served'].includes(currentStatus);

  // Financial Calculations (Strictly real backend data)
  const subtotal = order.subtotal ?? 0;
  const taxAmount = order.taxAmount ?? 0;
  const discount = order.discount ?? 0;
  const grandTotal = order.grandTotal ?? 0;
  const paidAmount =
    (order as any).paidAmount !== undefined
      ? (order as any).paidAmount
      : order.paymentStatus === 'paid'
      ? grandTotal
      : 0;
  const dueAmount =
    (order as any).dueAmount !== undefined
      ? (order as any).dueAmount
      : order.paymentStatus === 'paid'
      ? 0
      : grandTotal;

  // Format Helper for Timestamps
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeOnly = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Find transition timestamp for a status step from order.timeline
  const getStepTimestamp = (status: FulfillmentStatus): string | null => {
    if (!order.timeline || !order.timeline.length) return null;
    const item = order.timeline.find((t) => t.status === status);
    return item?.timestamp ? formatTimeOnly(item.timestamp) : null;
  };

  // Determine Payment Status Badge Color
  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full" textTransform="uppercase">
            <HStack spacing={1}>
              <FiCheck />
              <Text>PAID</Text>
            </HStack>
          </Badge>
        );
      case 'pending':
        return (
          <Badge colorScheme="orange" px={2.5} py={0.5} borderRadius="full" textTransform="uppercase">
            <HStack spacing={1}>
              <FiClock />
              <Text>PAYMENT PENDING</Text>
            </HStack>
          </Badge>
        );
      case 'failed':
        return (
          <Badge colorScheme="red" px={2.5} py={0.5} borderRadius="full" textTransform="uppercase">
            <HStack spacing={1}>
              <FiXCircle />
              <Text>PAYMENT FAILED</Text>
            </HStack>
          </Badge>
        );
      case 'refunded':
        return (
          <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full" textTransform="uppercase">
            REFUNDED
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageContainer maxW="4xl">
      <VStack spacing={6} align="stretch" py={{ base: 4, md: 8 }}>
        {/* Top Header & Operational Control Bar */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={3}
          pb={2}
        >
          <Box>
            <HStack spacing={3} wrap="wrap">
              <Heading fontFamily="heading" size={{ base: 'md', md: 'lg' }} fontWeight="800" color={headingColor}>
                Live Order Tracking
              </Heading>
              <Badge
                colorScheme="green"
                variant="subtle"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight="700"
                letterSpacing="wider"
              >
                ● LIVE SOCKET FEED
              </Badge>

              {hasReliablePrepTime && (
                <HStack
                  spacing={1.5}
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg="rgba(212, 175, 114, 0.12)"
                  borderWidth="1px"
                  borderColor={accentColor}
                >
                  <Icon as={FiClock} color={accentColor} boxSize={3} />
                  <Text fontSize="11px" fontWeight="700" color={accentColor}>
                    Est. Prep: {backendPrepTime} mins
                  </Text>
                </HStack>
              )}
            </HStack>

            <HStack spacing={2} fontSize="xs" color={textColor} mt={1}>
              <Text>Order #:</Text>
              <Text fontWeight="800" color={accentColor} fontFamily="mono">
                {order.orderNumber}
              </Text>
              <Text color={subtleBorder}>•</Text>
              <Text>Placed {formatDateTime(order.createdAt)}</Text>
            </HStack>
          </Box>

          {/* Action Header Controls */}
          <HStack spacing={2}>
            <Tooltip label={`Last refreshed ${secondsAgo}s ago`} hasArrow placement="top">
              <Button
                size="sm"
                variant="outline"
                borderColor={borderColor}
                leftIcon={<FiRefreshCw className={isRefreshing ? 'spin' : ''} />}
                borderRadius="xl"
                onClick={() => fetchOrder(true)}
                isLoading={isRefreshing}
                _hover={{ borderColor: accentColor }}
              >
                Refresh
              </Button>
            </Tooltip>

            <Button
              size="sm"
              variant="outline"
              borderColor={borderColor}
              leftIcon={<FiPrinter />}
              borderRadius="xl"
              onClick={onReceiptOpen}
              _hover={{ borderColor: accentColor }}
            >
              Receipt
            </Button>
          </HStack>
        </Flex>

        {/* Cancellation Notice Banner (If submitted / reviewed) */}
        {cancellationRequest && (
          <Box
            p={4}
            borderRadius="2xl"
            bg={
              cancellationRequest.status === 'approved'
                ? 'rgba(16, 185, 129, 0.1)'
                : cancellationRequest.status === 'rejected'
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(245, 158, 11, 0.1)'
            }
            borderWidth="1px"
            borderColor={
              cancellationRequest.status === 'approved'
                ? 'green.400'
                : cancellationRequest.status === 'rejected'
                ? 'red.400'
                : 'orange.400'
            }
          >
            <HStack spacing={3} align="flex-start">
              <Box
                color={
                  cancellationRequest.status === 'approved'
                    ? 'green.400'
                    : cancellationRequest.status === 'rejected'
                    ? 'red.400'
                    : 'orange.400'
                }
                fontSize="xl"
                mt={0.5}
              >
                {cancellationRequest.status === 'approved' ? (
                  <FiCheckCircle />
                ) : cancellationRequest.status === 'rejected' ? (
                  <FiXCircle />
                ) : (
                  <FiAlertTriangle />
                )}
              </Box>
              <Box flex="1">
                <HStack justify="space-between" wrap="wrap">
                  <Text fontWeight="800" fontSize="sm" color={headingColor}>
                    {cancellationRequest.status === 'approved'
                      ? 'Cancellation Approved by Manager'
                      : cancellationRequest.status === 'rejected'
                      ? 'Cancellation Request Declined'
                      : 'Cancellation Request Under Review'}
                  </Text>
                  <Badge
                    colorScheme={
                      cancellationRequest.status === 'approved'
                        ? 'green'
                        : cancellationRequest.status === 'rejected'
                        ? 'red'
                        : 'orange'
                    }
                    fontSize="10px"
                  >
                    {cancellationRequest.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={textColor} mt={1}>
                  Reason submitted: "{cancellationRequest.reason}"
                  {cancellationRequest.submittedAt && ` (${formatDateTime(cancellationRequest.submittedAt)})`}
                </Text>
                {cancellationRequest.status === 'pending_review' && (
                  <Text fontSize="xs" color="orange.300" mt={1}>
                    Note: Orders continue kitchen preparation until floor manager approves. Please call floor staff if urgent.
                  </Text>
                )}
              </Box>
            </HStack>
          </Box>
        )}

        {/* Visual Progress Timeline Card */}
        <Box
          bg={cardBg}
          p={{ base: 5, md: 8 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="0 8px 32px rgba(0,0,0,0.25)"
        >
          {isCancelled ? (
            <VStack spacing={4} py={8} textAlign="center">
              <Flex
                w="16"
                h="16"
                borderRadius="full"
                bg="rgba(239, 68, 68, 0.15)"
                color="red.400"
                align="center"
                justify="center"
                fontSize="2xl"
              >
                <FiXCircle />
              </Flex>
              <Box>
                <Badge colorScheme="red" fontSize="sm" px={4} py={1} borderRadius="full" mb={2}>
                  ORDER OFFICIALLY CANCELLED
                </Badge>
                <Text fontSize="sm" color={textColor} maxW="md" mx="auto">
                  This order has been cancelled and will not be prepared. If payment was pre-authorized, bank reversals follow banking clearance timelines.
                </Text>
              </Box>
            </VStack>
          ) : (
            <Box>
              {/* Progress Track */}
              <Box position="relative" mb={{ base: 6, md: 8 }}>
                <Progress
                  value={progressPercent}
                  size="xs"
                  colorScheme="orange"
                  borderRadius="full"
                  bg={useColorModeValue('gray.200', 'whiteAlpha.100')}
                />
              </Box>

              {/* Status Milestone Grid */}
              <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;
                  const stepTimestamp = getStepTimestamp(step.status);
                  const StepIcon = step.icon;

                  return (
                    <VStack
                      key={step.status}
                      align="center"
                      textAlign="center"
                      spacing={2}
                      opacity={isDone ? 1 : 0.4}
                      transition="all 0.3s ease"
                    >
                      <Flex
                        w={{ base: '10', md: '12' }}
                        h={{ base: '10', md: '12' }}
                        borderRadius="full"
                        bg={isDone ? accentColor : 'transparent'}
                        borderWidth="2px"
                        borderColor={isDone ? accentColor : borderColor}
                        color={isDone ? '#0B0C0E' : textColor}
                        align="center"
                        justify="center"
                        fontSize={{ base: 'sm', md: 'md' }}
                        boxShadow={isCurrent ? `0 0 0 5px rgba(212, 175, 114, 0.35)` : undefined}
                      >
                        {isDone ? <FiCheck strokeWidth={3} /> : <StepIcon />}
                      </Flex>

                      <Box>
                        <Text
                          fontWeight={isCurrent ? '800' : '700'}
                          fontSize={{ base: 'xs', md: 'xs' }}
                          color={isCurrent ? accentColor : headingColor}
                        >
                          {step.label}
                        </Text>
                        <Text fontSize="10px" color={textColor} display={{ base: 'none', md: 'block' }}>
                          {step.desc}
                        </Text>
                        {stepTimestamp && (
                          <Badge
                            variant="subtle"
                            colorScheme="yellow"
                            fontSize="9px"
                            mt={1}
                            px={1.5}
                            borderRadius="sm"
                          >
                            {stepTimestamp}
                          </Badge>
                        )}
                      </Box>
                    </VStack>
                  );
                })}
              </SimpleGrid>

              {/* Collapsible Transition History Log */}
              {order.timeline && order.timeline.length > 0 && (
                <Box mt={6} pt={4} borderTopWidth="1px" borderColor={subtleBorder}>
                  <Flex
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiClock} color={accentColor} />
                      <Text fontSize="xs" fontWeight="700" color={headingColor}>
                        Detailed Status Log ({order.timeline.length} events)
                      </Text>
                    </HStack>
                    <Icon as={isTimelineExpanded ? FiChevronUp : FiChevronDown} color={textColor} />
                  </Flex>

                  <Collapse in={isTimelineExpanded} animateOpacity>
                    <VStack spacing={2} align="stretch" mt={3} fontSize="xs">
                      {order.timeline.map((event, index) => (
                        <Flex
                          key={index}
                          justify="space-between"
                          align="center"
                          p={2}
                          borderRadius="lg"
                          bg={innerCardBg}
                        >
                          <HStack spacing={3}>
                            <Badge colorScheme="yellow" fontSize="10px">
                              {event.status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                            {event.note && (
                              <Text color={headingColor} fontStyle="italic">
                                "{event.note}"
                              </Text>
                            )}
                          </HStack>
                          <Text color={textColor} fontSize="10px">
                            {formatDateTime(event.timestamp)}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  </Collapse>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* 2-Column Split: Service Info & Ordered Items */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Left Column: Order & Service Information */}
          <Box
            bg={cardBg}
            p={{ base: 5, md: 6 }}
            borderRadius="3xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              Service & Table Details
            </Text>

            <VStack spacing={3.5} align="stretch" fontSize="sm">
              {/* Order Type */}
              <Flex justify="space-between" align="center">
                <Text color={textColor}>Order Type</Text>
                <Badge
                  colorScheme={
                    order.orderType === 'dine-in'
                      ? 'orange'
                      : order.orderType === 'takeaway'
                      ? 'teal'
                      : 'blue'
                  }
                  textTransform="uppercase"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                >
                  <HStack spacing={1}>
                    {order.orderType === 'dine-in' ? (
                      <FaUtensils />
                    ) : order.orderType === 'takeaway' ? (
                      <FiShoppingBag />
                    ) : (
                      <FaMotorcycle />
                    )}
                    <Text>{order.orderType}</Text>
                  </HStack>
                </Badge>
              </Flex>

              {/* Table Information */}
              {order.orderType === 'dine-in' && (
                <Flex justify="space-between" align="center">
                  <Text color={textColor}>Table Assignment</Text>
                  <Text fontWeight="800" color={headingColor}>
                    {order.tableNumber
                      ? `Table #${order.tableNumber}`
                      : (order.tableId as any)?.tableNumber
                      ? `Table #${(order.tableId as any).tableNumber}`
                      : 'Assigned by Host'}
                  </Text>
                </Flex>
              )}

              {/* Customer Information */}
              <Flex justify="space-between" align="center">
                <Text color={textColor}>Customer</Text>
                <Text fontWeight="700" color={headingColor}>
                  {order.customerName ||
                    (order.customerId as any)?.name ||
                    user?.name ||
                    'Patron Guest'}
                </Text>
              </Flex>

              {(order.customerPhone || (order.customerId as any)?.phone || user?.phone) && (
                <Flex justify="space-between" align="center">
                  <Text color={textColor}>Contact Phone</Text>
                  <Text fontWeight="600" color={headingColor}>
                    {order.customerPhone ||
                      (order.customerId as any)?.phone ||
                      user?.phone}
                  </Text>
                </Flex>
              )}

              <Divider borderColor={subtleBorder} />

              {/* Payment Details */}
              <Flex justify="space-between" align="center">
                <Text color={textColor}>Payment Status</Text>
                {getPaymentBadge(order.paymentStatus)}
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color={textColor}>Payment Method</Text>
                <Badge variant="outline" colorScheme="yellow" textTransform="uppercase">
                  {order.paymentMethod}
                </Badge>
              </Flex>

              {/* Special Instructions / Notes */}
              {order.notes && (
                <Box pt={2} p={3} borderRadius="xl" bg={innerCardBg}>
                  <Text fontSize="xs" color={textColor} fontWeight="700" mb={1}>
                    Order Instructions / Dietary Notes:
                  </Text>
                  <Text fontSize="xs" color={headingColor} fontStyle="italic">
                    "{order.notes}"
                  </Text>
                </Box>
              )}
            </VStack>

            {/* Quick Actions in Left Column */}
            <Divider borderColor={subtleBorder} my={5} />
            <SimpleGrid columns={2} spacing={3}>
              <Button
                size="sm"
                variant="outline"
                borderColor={borderColor}
                borderRadius="xl"
                leftIcon={<FiPhone />}
                onClick={onContactOpen}
                _hover={{ borderColor: accentColor }}
              >
                Contact Cafe
              </Button>

              <Button
                size="sm"
                bg={accentColor}
                color="#0B0C0E"
                _hover={{ bg: accentHover }}
                borderRadius="xl"
                leftIcon={<FiRotateCcw />}
                onClick={handleReorder}
                isLoading={isReordering}
              >
                Reorder Items
              </Button>
            </SimpleGrid>
          </Box>

          {/* Right Column: Ordered Items & Bill Breakdown */}
          <Box
            bg={cardBg}
            p={{ base: 5, md: 6 }}
            borderRadius="3xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="800" fontSize="md" color={headingColor}>
                Items Ordered ({order.items.length})
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color={accentColor}
                leftIcon={isCopied ? <FiCheck /> : <FiCopy />}
                onClick={handleCopySummary}
              >
                {isCopied ? 'Copied' : 'Copy Summary'}
              </Button>
            </Flex>

            {/* Items List */}
            <VStack spacing={3} align="stretch" mb={4} maxH="220px" overflowY="auto" pr={1}>
              {order.items.map((it, idx) => (
                <Box
                  key={idx}
                  p={2.5}
                  borderRadius="xl"
                  bg={innerCardBg}
                  borderWidth="1px"
                  borderColor={subtleBorder}
                >
                  <Flex justify="space-between" align="flex-start">
                    <Box flex="1" pr={2}>
                      <HStack spacing={2}>
                        <Badge colorScheme="yellow" fontSize="xs">
                          {it.quantity}x
                        </Badge>
                        <Text fontWeight="700" fontSize="xs" color={headingColor}>
                          {it.name}
                        </Text>
                      </HStack>

                      {it.variantName && (
                        <Text fontSize="10px" color={textColor} mt={0.5}>
                          Portion: {it.variantName}
                        </Text>
                      )}

                      {it.addOns && it.addOns.length > 0 && (
                        <Text fontSize="10px" color={textColor}>
                          Add-ons: {it.addOns.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                        </Text>
                      )}

                      {it.notes && (
                        <Text fontSize="10px" color="orange.400" fontStyle="italic">
                          Note: {it.notes}
                        </Text>
                      )}
                    </Box>

                    <Text fontWeight="800" fontSize="xs" color={headingColor} whiteSpace="nowrap">
                      ₹{it.itemTotal.toFixed(2)}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>

            <Divider borderColor={subtleBorder} mb={3} />

            {/* Complete Billing Breakdown */}
            <VStack spacing={1.5} align="stretch" fontSize="xs" mb={4}>
              <Flex justify="space-between">
                <Text color={textColor}>Subtotal</Text>
                <Text fontWeight="600" color={headingColor}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </Flex>

              {discount > 0 && (
                <Flex justify="space-between" color="green.400">
                  <Text>Discount {order.discountCode ? `(${order.discountCode})` : ''}</Text>
                  <Text fontWeight="700">-₹{discount.toFixed(2)}</Text>
                </Flex>
              )}

              {/* Tax Breakup */}
              {order.taxBreakup && order.taxBreakup.length > 0 ? (
                order.taxBreakup.map((tb, idx) => (
                  <Flex key={idx} justify="space-between" color={textColor}>
                    <Text>
                      {tb.name} ({tb.rate}%)
                    </Text>
                    <Text fontWeight="600">₹{tb.amount.toFixed(2)}</Text>
                  </Flex>
                ))
              ) : (
                <Flex justify="space-between" color={textColor}>
                  <Text>Taxes & Levies</Text>
                  <Text fontWeight="600">₹{taxAmount.toFixed(2)}</Text>
                </Flex>
              )}

              <Divider borderColor={borderColor} my={1} />

              <Flex justify="space-between" fontSize="sm">
                <Text fontWeight="800" color={headingColor}>
                  Grand Total
                </Text>
                <Text fontWeight="800" color={accentColor} fontSize="md">
                  ₹{grandTotal.toFixed(2)}
                </Text>
              </Flex>

              <Flex justify="space-between" fontSize="xs" pt={1}>
                <Text color={textColor}>Paid Amount</Text>
                <Text fontWeight="700" color="green.400">
                  ₹{paidAmount.toFixed(2)}
                </Text>
              </Flex>

              {dueAmount > 0 && (
                <Flex justify="space-between" fontSize="xs">
                  <Text color="orange.400" fontWeight="700">
                    Due Balance
                  </Text>
                  <Text fontWeight="800" color="orange.400">
                    ₹{dueAmount.toFixed(2)}
                  </Text>
                </Flex>
              )}
            </VStack>

            {/* Cancellation Request Action Button */}
            {!isCancelled && ['placed', 'confirmed', 'preparing'].includes(currentStatus) && (
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                w="100%"
                borderRadius="xl"
                onClick={onCancelOpen}
                isDisabled={!!cancellationRequest && cancellationRequest.status === 'pending_review'}
              >
                {cancellationRequest && cancellationRequest.status === 'pending_review'
                  ? 'Cancellation Request Pending Review'
                  : 'Request Order Cancellation'}
              </Button>
            )}
          </Box>
        </SimpleGrid>
      </VStack>

      {/* Cancellation Request Modal (Requires Manager Approval) */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor} borderBottomWidth="1px" borderColor={subtleBorder}>
            Request Order Cancellation
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <Alert status="warning" borderRadius="xl" mb={4} bg="rgba(245, 158, 11, 0.12)" color="orange.300">
              <AlertIcon color="orange.400" />
              <Box fontSize="xs">
                <AlertTitle fontWeight="700">Manager Approval Required</AlertTitle>
                <AlertDescription>
                  Kitchen preparation begins immediately upon order receipt. Customer cancellations require floor manager review and approval.
                </AlertDescription>
              </Box>
            </Alert>

            <Text fontSize="xs" color={textColor} mb={2} fontWeight="600">
              Reason for Cancellation Request:
            </Text>
            <Textarea
              placeholder="e.g. Accidental duplicate order, emergency departure, changed dietary preference..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              borderRadius="xl"
              rows={3}
              fontSize="sm"
              bg={innerCardBg}
              borderColor={borderColor}
              _focus={{ borderColor: accentColor }}
            />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={subtleBorder}>
            <Button variant="ghost" mr={3} onClick={onCancelClose} borderRadius="xl">
              Keep My Order
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancellationRequest}
              borderRadius="xl"
              isLoading={isSubmittingCancel}
            >
              Submit Cancellation Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Contact Cafe & Floor Support Modal */}
      <Modal isOpen={isContactOpen} onClose={onContactClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor} borderBottomWidth="1px" borderColor={subtleBorder}>
            Contact VYNTRA CAFE Support
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="xs" color={textColor}>
                Have an inquiry about Order #{order.orderNumber}? Reach out to our floor manager or concierge directly.
              </Text>

              <HStack
                as="a"
                href={`tel:${settings?.contact?.phone || '+919876543210'}`}
                p={3.5}
                borderRadius="xl"
                bg={innerCardBg}
                borderWidth="1px"
                borderColor={subtleBorder}
                _hover={{ borderColor: accentColor }}
                justify="space-between"
              >
                <HStack spacing={3}>
                  <Flex w="10" h="10" borderRadius="full" bg={accentColor} color="#0B0C0E" align="center" justify="center">
                    <FiPhone />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" fontSize="sm" color={headingColor}>
                      Call Floor Desk
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      {settings?.contact?.phone || '+91 98765 43210'}
                    </Text>
                  </Box>
                </HStack>
                <FiExternalLink />
              </HStack>

              <HStack
                as="a"
                href={`https://wa.me/${(settings?.contact?.phone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello Vyntra Cafe, I am inquiring about my live order #${order.orderNumber}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                p={3.5}
                borderRadius="xl"
                bg={innerCardBg}
                borderWidth="1px"
                borderColor={subtleBorder}
                _hover={{ borderColor: accentColor }}
                justify="space-between"
              >
                <HStack spacing={3}>
                  <Flex w="10" h="10" borderRadius="full" bg="green.500" color="white" align="center" justify="center">
                    <FaWhatsapp />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" fontSize="sm" color={headingColor}>
                      Chat on WhatsApp
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      Instant concierge messaging
                    </Text>
                  </Box>
                </HStack>
                <FiExternalLink />
              </HStack>

              {order.orderType === 'dine-in' && (
                <Button
                  leftIcon={<FaConciergeBell />}
                  variant="outline"
                  borderColor={accentColor}
                  color={accentColor}
                  borderRadius="xl"
                  onClick={() => {
                    toast({
                      title: 'Table Assistance Requested',
                      description: `Our floor server has been notified for Table ${order.tableNumber || 'your table'}.`,
                      status: 'success',
                      duration: 4000,
                    });
                    onContactClose();
                  }}
                >
                  Call Server to Table
                </Button>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={subtleBorder}>
            <Button variant="ghost" onClick={onContactClose} borderRadius="xl" size="sm">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Printable Receipt & Official Tax Invoice Modal */}
      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor} borderBottomWidth="1px" borderColor={subtleBorder} className="no-print">
            <Flex justify="space-between" align="center">
              <Text fontSize="md">Official Order Invoice</Text>
              <Button size="xs" colorScheme="yellow" leftIcon={<FiPrinter />} onClick={handlePrintReceipt}>
                Print / Save PDF
              </Button>
            </Flex>
          </ModalHeader>
          <ModalCloseButton className="no-print" />

          <ModalBody py={6}>
            {/* Printable Area with CSS print rules */}
            <Box id="printable-order-receipt" p={2}>
              <VStack spacing={4} align="stretch">
                {/* Header Branding */}
                <Box textAlign="center" pb={3} borderBottomWidth="2px" borderColor={borderColor}>
                  <Heading size="md" fontFamily="heading" letterSpacing="widest" color={accentColor}>
                    VYNTRA CAFE
                  </Heading>
                  <Text fontSize="10px" color={textColor} textTransform="uppercase" letterSpacing="wider">
                    Artisanal Coffee & Gourmet Bistro
                  </Text>
                  <Text fontSize="10px" color={textColor}>
                    {settings?.address?.street || '108 Gourmet Boulevard, Indiranagar'}, {settings?.address?.city || 'Bengaluru'}
                  </Text>
                  <Text fontSize="10px" color={textColor}>
                    GSTIN: 29AABCU9603R1ZV • Phone: {settings?.contact?.phone || '+91 98765 43210'}
                  </Text>
                </Box>

                {/* Metadata Row */}
                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                  <Box>
                    <Text color={textColor}>Order Number:</Text>
                    <Text fontWeight="800" color={headingColor}>
                      #{order.orderNumber}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text color={textColor}>Date & Time:</Text>
                    <Text fontWeight="700" color={headingColor}>
                      {formatDateTime(order.createdAt)}
                    </Text>
                  </Box>
                  <Box>
                    <Text color={textColor}>Service Mode:</Text>
                    <Text fontWeight="700" textTransform="uppercase" color={headingColor}>
                      {order.orderType}{order.tableNumber ? ` (Table ${order.tableNumber})` : ''}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text color={textColor}>Payment Status:</Text>
                    <Text fontWeight="800" textTransform="uppercase" color={order.paymentStatus === 'paid' ? 'green.400' : 'orange.400'}>
                      {order.paymentStatus} via {order.paymentMethod}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Itemized Table */}
                <Table size="sm" variant="simple" my={2}>
                  <Thead>
                    <Tr borderBottomWidth="1px" borderColor={borderColor}>
                      <Th color={textColor} fontSize="10px" px={1}>Item</Th>
                      <Th color={textColor} fontSize="10px" textAlign="center" px={1}>Qty</Th>
                      <Th color={textColor} fontSize="10px" textAlign="right" px={1}>Rate</Th>
                      <Th color={textColor} fontSize="10px" textAlign="right" px={1}>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {order.items.map((it, idx) => (
                      <Tr key={idx} borderBottomWidth="1px" borderColor={subtleBorder}>
                        <Td fontSize="xs" color={headingColor} px={1} py={2}>
                          <Text fontWeight="600">{it.name}</Text>
                          {it.variantName && <Text fontSize="10px" color={textColor}>Portion: {it.variantName}</Text>}
                          {it.addOns && it.addOns.length > 0 && (
                            <Text fontSize="10px" color={textColor}>
                              + {it.addOns.map((a) => a.name).join(', ')}
                            </Text>
                          )}
                        </Td>
                        <Td fontSize="xs" textAlign="center" color={headingColor} px={1}>
                          {it.quantity}
                        </Td>
                        <Td fontSize="xs" textAlign="right" color={headingColor} px={1}>
                          ₹{(it.unitPrice || it.basePrice).toFixed(2)}
                        </Td>
                        <Td fontSize="xs" textAlign="right" fontWeight="700" color={headingColor} px={1}>
                          ₹{it.itemTotal.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Totals Summary */}
                <VStack spacing={1} align="stretch" fontSize="xs">
                  <Flex justify="space-between">
                    <Text color={textColor}>Subtotal</Text>
                    <Text fontWeight="600" color={headingColor}>₹{subtotal.toFixed(2)}</Text>
                  </Flex>

                  {discount > 0 && (
                    <Flex justify="space-between" color="green.400">
                      <Text>Discount ({order.discountCode || 'Promo'})</Text>
                      <Text fontWeight="700">-₹{discount.toFixed(2)}</Text>
                    </Flex>
                  )}

                  {order.taxBreakup && order.taxBreakup.length > 0 ? (
                    order.taxBreakup.map((tb, idx) => (
                      <Flex key={idx} justify="space-between" color={textColor}>
                        <Text>{tb.name} ({tb.rate}%)</Text>
                        <Text fontWeight="600">₹{tb.amount.toFixed(2)}</Text>
                      </Flex>
                    ))
                  ) : (
                    <Flex justify="space-between" color={textColor}>
                      <Text>Taxes & Levies</Text>
                      <Text fontWeight="600">₹{taxAmount.toFixed(2)}</Text>
                    </Flex>
                  )}

                  <Divider borderColor={borderColor} my={1} />

                  <Flex justify="space-between" fontSize="sm">
                    <Text fontWeight="800" color={headingColor}>Invoice Total</Text>
                    <Text fontWeight="800" color={accentColor}>₹{grandTotal.toFixed(2)}</Text>
                  </Flex>

                  <Flex justify="space-between" fontSize="xs">
                    <Text color={textColor}>Amount Paid</Text>
                    <Text fontWeight="700" color="green.400">₹{paidAmount.toFixed(2)}</Text>
                  </Flex>

                  {dueAmount > 0 && (
                    <Flex justify="space-between" fontSize="xs">
                      <Text color="orange.400" fontWeight="700">Amount Due</Text>
                      <Text fontWeight="800" color="orange.400">₹{dueAmount.toFixed(2)}</Text>
                    </Flex>
                  )}
                </VStack>

                <Box textAlign="center" pt={4} borderTopWidth="1px" borderColor={subtleBorder}>
                  <Text fontSize="11px" fontWeight="700" color={headingColor}>
                    Thank you for dining with VYNTRA CAFE!
                  </Text>
                  <Text fontSize="9px" color={textColor}>
                    This is a computer-generated tax invoice.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={subtleBorder} className="no-print">
            <Button variant="ghost" mr={3} onClick={onReceiptClose} borderRadius="xl" size="sm">
              Close
            </Button>
            <Button
              bg={accentColor}
              color="#0B0C0E"
              _hover={{ bg: accentHover }}
              borderRadius="xl"
              size="sm"
              leftIcon={<FiPrinter />}
              onClick={handlePrintReceipt}
            >
              Print Invoice
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Print Stylesheet Injection */}
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
            padding: 24px !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </PageContainer>
  );
};
