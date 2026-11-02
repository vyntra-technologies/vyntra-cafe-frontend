import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiAlertTriangle,
  FiRefreshCw,
  FiCoffee,
  FiCheck,
} from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { orderService, CancellationRequest } from '../services/order.service';
import { socketService } from '../services/socket.service';
import { IOrder, FulfillmentStatus } from '../types';

const STATUS_STEPS: { status: FulfillmentStatus; label: string; desc: string }[] = [
  { status: 'placed', label: 'Order Received', desc: 'Sent to cafe kitchen system' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Accepted by barista & chef' },
  { status: 'preparing', label: 'In Preparation', desc: 'Freshly brewing and cooking' },
  { status: 'ready_for_pickup', label: 'Ready', desc: 'Ready for table service or counter pickup' },
  { status: 'completed', label: 'Completed', desc: 'Delivered & enjoyed' },
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellationRequest, setCancellationRequest] = useState<CancellationRequest | null>(null);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  const fetchOrder = () => {
    if (!id) return;
    orderService
      .getById(id)
      .then((data) => {
        setOrder(data);
        setCancellationRequest(orderService.getCancellationRequest(data._id));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrder();

    if (!id) return;
    socketService.joinOrder(id);

    // Live status subscription
    const unsubStatus = socketService.onOrderStatusChange((data) => {
      if (data.orderId === id) {
        setOrder((prev) => (prev ? { ...prev, fulfillmentStatus: data.fulfillmentStatus as any } : prev));
        toast({
          title: 'Order Status Updated',
          description: `Your order is now: ${data.fulfillmentStatus.replace(/_/g, ' ')}`,
          status: 'info',
          duration: 3500,
          position: 'top-right',
        });
      }
    });

    const unsubReady = socketService.onOrderReady((data) => {
      if (data.orderId === id) {
        toast({
          title: 'Your Order is Ready! ☕',
          description: data.tableNumber
            ? `Server is delivering to Table ${data.tableNumber}`
            : 'Please collect your order at the front counter',
          status: 'success',
          duration: 6000,
          position: 'top-right',
        });
      }
    });

    return () => {
      unsubStatus();
      unsubReady();
    };
  }, [id]);

  const handleCancellationRequest = () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please explain why you wish to cancel this order.',
        status: 'warning',
      });
      return;
    }

    if (!order) return;
    const req = orderService.submitCancellationRequest(order._id, cancelReason.trim());
    setCancellationRequest(req);
    onClose();

    toast({
      title: 'Cancellation Request Submitted',
      description: 'Our cafe manager has been alerted and will review your request.',
      status: 'info',
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <VStack spacing={4} py={20} justify="center">
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={textColor}>Connecting to live kitchen feed...</Text>
        </VStack>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <Box textAlign="center" py={16}>
          <Heading size="md" mb={2}>
            Order Not Found
          </Heading>
          <Text color={textColor} mb={4}>
            We could not locate this order. It may have expired or was invalid.
          </Text>
          <Button as={RouterLink} to="/menu" colorScheme="brand" borderRadius="xl">
            Browse Menu
          </Button>
        </Box>
      </PageContainer>
    );
  }

  const currentStatus = order.fulfillmentStatus;
  const isCancelled = currentStatus === 'cancelled';

  // Calculate step progress percentage
  const getStepIndex = (status: FulfillmentStatus) => {
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
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const progressPercent = ((activeIndex + 1) / STATUS_STEPS.length) * 100;

  return (
    <PageContainer maxW="4xl">
      <VStack spacing={6} align="stretch">
        {/* Header Bar */}
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={3}>
          <Box>
            <HStack spacing={3}>
              <Heading fontFamily="heading" size="lg" fontWeight="800" color={headingColor}>
                Live Order Tracking
              </Heading>
              <Badge colorScheme="green" variant="subtle" px={2.5} py={0.5} borderRadius="full">
                LIVE SOCKET FEED
              </Badge>
            </HStack>
            <Text fontSize="sm" color={textColor} mt={1}>
              Order Number: <Text as="span" fontWeight="700" color={headingColor}>{order.orderNumber}</Text>
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            borderRadius="xl"
            onClick={fetchOrder}
          >
            Refresh Status
          </Button>
        </Flex>

        {/* Cancellation Notice Banner if submitted */}
        {cancellationRequest && (
          <Box
            p={4}
            borderRadius="2xl"
            bg={useColorModeValue('yellow.50', 'rgba(237, 137, 54, 0.1)')}
            borderWidth="1px"
            borderColor="orange.400"
          >
            <HStack spacing={3} align="flex-start">
              <Box color="orange.400" fontSize="xl" mt={0.5}>
                <FiAlertTriangle />
              </Box>
              <Box>
                <Text fontWeight="700" fontSize="sm" color={headingColor}>
                  Cancellation Request Pending Review
                </Text>
                <Text fontSize="xs" color={textColor} mt={0.5}>
                  Reason submitted: "{cancellationRequest.reason}". Our barista / floor manager will verify preparation status and update your order accordingly.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Visual Progress Timeline Card */}
        <Box bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
          {isCancelled ? (
            <VStack spacing={3} py={6} textAlign="center">
              <Badge colorScheme="red" fontSize="md" px={4} py={1} borderRadius="full">
                ORDER CANCELLED
              </Badge>
              <Text fontSize="sm" color={textColor} maxW="md">
                This order has been officially cancelled. If payment was authorized, refunds are processed according to bank timelines.
              </Text>
            </VStack>
          ) : (
            <Box>
              <Progress
                value={progressPercent}
                size="xs"
                colorScheme="orange"
                borderRadius="full"
                mb={8}
                bg={useColorModeValue('gray.200', 'whiteAlpha.100')}
              />

              <SimpleGrid columns={{ base: 1, sm: 5 }} spacing={4}>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <VStack
                      key={step.status}
                      align={{ base: 'flex-start', sm: 'center' }}
                      textAlign={{ base: 'left', sm: 'center' }}
                      spacing={2}
                      opacity={isDone ? 1 : 0.4}
                    >
                      <Flex
                        w="10"
                        h="10"
                        borderRadius="full"
                        bg={isDone ? accentColor : borderColor}
                        color="white"
                        align="center"
                        justify="center"
                        fontWeight="bold"
                        fontSize="sm"
                        boxShadow={isCurrent ? `0 0 0 4px ${accentColor}40` : undefined}
                      >
                        {isDone ? <FiCheck /> : idx + 1}
                      </Flex>
                      <Text fontWeight="700" fontSize="xs" color={headingColor}>
                        {step.label}
                      </Text>
                      <Text fontSize="10px" color={textColor} display={{ base: 'none', md: 'block' }}>
                        {step.desc}
                      </Text>
                    </VStack>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}
        </Box>

        {/* Order Details & Table Summary */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Order Details */}
          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              Service & Table Info
            </Text>

            <VStack spacing={3} align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color={textColor}>Order Type</Text>
                <Badge colorScheme="orange" textTransform="uppercase">
                  {order.orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}
                </Badge>
              </Flex>

              {order.orderType === 'dine-in' && (
                <Flex justify="space-between">
                  <Text color={textColor}>Table Number</Text>
                  <Text fontWeight="700" color={headingColor}>
                    {order.tableNumber || 'Assigned Table'}
                  </Text>
                </Flex>
              )}

              <Flex justify="space-between">
                <Text color={textColor}>Payment Status</Text>
                <StatusBadge status={order.paymentStatus} />
              </Flex>

              <Flex justify="space-between">
                <Text color={textColor}>Payment Method</Text>
                <Text fontWeight="600" textTransform="capitalize">
                  {order.paymentMethod}
                </Text>
              </Flex>

              {order.notes && (
                <Box pt={2}>
                  <Text fontSize="xs" color={textColor} fontWeight="600">
                    Order Notes:
                  </Text>
                  <Text fontSize="xs" color={headingColor} fontStyle="italic">
                    "{order.notes}"
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Items Summary & Cancellation Action */}
          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              Items Ordered ({order.items.length})
            </Text>

            <VStack spacing={2} align="stretch" mb={4} maxH="160px" overflowY="auto">
              {order.items.map((it, idx) => (
                <Flex key={idx} justify="space-between" fontSize="xs">
                  <Text color={headingColor} fontWeight="600">
                    {it.quantity}x {it.name}
                  </Text>
                  <Text fontWeight="700">₹{it.itemTotal.toFixed(2)}</Text>
                </Flex>
              ))}
            </VStack>

            <Divider borderColor={borderColor} mb={4} />

            <Flex justify="space-between" align="baseline" mb={4}>
              <Text fontWeight="800" fontSize="sm" color={headingColor}>
                Total Paid / Due
              </Text>
              <Text fontWeight="800" fontSize="xl" color={accentColor}>
                ₹{order.grandTotal.toFixed(2)}
              </Text>
            </Flex>

            {/* Submit Cancellation Request Button */}
            {!isCancelled && ['placed', 'confirmed', 'preparing'].includes(currentStatus) && (
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                w="100%"
                borderRadius="xl"
                onClick={onOpen}
                isDisabled={!!cancellationRequest}
              >
                {cancellationRequest ? 'Cancellation Request Submitted' : 'Request Order Cancellation'}
              </Button>
            )}
          </Box>
        </SimpleGrid>
      </VStack>

      {/* Cancellation Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor}>Request Order Cancellation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={textColor} mb={4}>
              Orders cannot be cancelled automatically once kitchen preparation starts. Please state your reason for cancellation below. Our manager will review and confirm.
            </Text>
            <Textarea
              placeholder="e.g. Ordered incorrect size, changed mind, emergency..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              borderRadius="xl"
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Keep Order
            </Button>
            <Button colorScheme="red" onClick={handleCancellationRequest} borderRadius="xl">
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
