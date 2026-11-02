import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Flex,
  Badge,
  useColorModeValue,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiClock, FiShoppingBag, FiArrowRight, FiFileText } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { orderService } from '../services/order.service';
import { customerService } from '../services/customer.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { IOrder } from '../types';

export const OrderHistoryPage: React.FC = () => {
  const { customerId } = useAuth();
  const { addItem } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const handleOpenDetails = (ord: IOrder) => {
    setSelectedOrder(ord);
    onOpen();
  };

  useEffect(() => {
    setIsLoading(true);

    const loadOrders = async () => {
      const fetchedOrders: IOrder[] = [];

      // 1. Try customer order history API if customerId exists
      if (customerId) {
        try {
          const res = await customerService.getOrderHistory(customerId);
          fetchedOrders.push(...res.orders);
        } catch {
          // Fallback to local
        }
      }

      // 2. Also fetch local order IDs from this device
      const localIds = orderService.getLocalOrderHistory();
      for (const id of localIds) {
        if (!fetchedOrders.some((o) => o._id === id)) {
          try {
            const ord = await orderService.getById(id);
            if (ord) fetchedOrders.push(ord);
          } catch {
            // Ignore missing order
          }
        }
      }

      setOrders(fetchedOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, [customerId]);

  return (
    <PageContainer>
      <VStack spacing={2} align="flex-start" mb={8}>
        <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
          Your Order History
        </Heading>
        <Text fontSize="sm" color={textColor}>
          Track your active orders or review past culinary purchases.
        </Text>
      </VStack>

      {isLoading ? (
        <LoadingState type="list" count={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Orders Yet"
          description="You haven't placed any dine-in or takeaway orders yet. Explore our handcrafted menu to place your first order."
          actionText="Browse Menu"
          actionLink="/menu"
        />
      ) : (
        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Box
              key={order._id}
              bg={cardBg}
              p={6}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor={borderColor}
              transition="all 0.2s ease"
              _hover={{ borderColor: accentColor }}
            >
              <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ md: 'center' }}
                gap={4}
                mb={4}
              >
                <Box>
                  <HStack spacing={3} mb={1}>
                    <Text fontWeight="800" fontSize="md" color={headingColor}>
                      {order.orderNumber}
                    </Text>
                    <Badge
                      bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
                      color={accentColor}
                      textTransform="uppercase"
                      fontSize="10px"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                    >
                      {order.orderType === 'dine-in' ? `Table ${order.tableNumber || 'Assigned'}` : 'Takeaway'}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={textColor}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Box>

                <HStack spacing={3}>
                  <StatusBadge status={order.fulfillmentStatus} />
                  <StatusBadge status={order.paymentStatus} />
                </HStack>
              </Flex>

              <Divider borderColor={borderColor} mb={4} />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="center">
                <VStack align="flex-start" spacing={1}>
                  {order.items.map((it, idx) => (
                    <Text key={idx} fontSize="xs" color={textColor}>
                      • {it.quantity}x {it.name} {it.variantName ? `(${it.variantName})` : ''}
                    </Text>
                  ))}
                </VStack>

                <Flex justify={{ base: 'space-between', md: 'flex-end' }} align="center" gap={4}>
                  <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={0}>
                    <Text fontSize="10px" color={textColor} fontWeight="bold">
                      TOTAL AMOUNT
                    </Text>
                    <Text fontSize="xl" fontWeight="800" color={accentColor}>
                      ₹{order.grandTotal.toFixed(2)}
                    </Text>
                  </VStack>

                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor={borderColor}
                        color={headingColor}
                        _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                        borderRadius="xl"
                        leftIcon={<FiFileText />}
                        onClick={() => handleOpenDetails(order)}
                      >
                        Details
                      </Button>
                      <Button
                        as={RouterLink}
                        to={`/track-order/${order._id}`}
                        size="sm"
                        bg={accentColor}
                        color={btnTextColor}
                        _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                        borderRadius="xl"
                        rightIcon={<FiArrowRight />}
                      >
                        Track Order
                      </Button>
                    </HStack>
                </Flex>
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor} borderBottomWidth="1px" borderColor={borderColor}>
            <HStack justify="space-between" pr={6}>
              <Text fontFamily="heading">Order #{selectedOrder?.orderNumber}</Text>
              <StatusBadge status={selectedOrder?.fulfillmentStatus || 'placed'} />
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {selectedOrder && (
              <VStack spacing={4} align="stretch" fontSize="sm">
                <Flex justify="space-between">
                  <Text color={textColor}>Service Mode</Text>
                  <Text fontWeight="700" color={headingColor} textTransform="uppercase">
                    {selectedOrder.orderType === 'dine-in' ? `Dine-In (${selectedOrder.tableNumber || 'Table Selected'})` : 'Takeaway (Counter Pickup)'}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={textColor}>Order Date & Time</Text>
                  <Text fontWeight="600" color={headingColor}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={textColor}>Payment Method & Status</Text>
                  <HStack spacing={2}>
                    <Text fontWeight="600" textTransform="capitalize" color={headingColor}>{selectedOrder.paymentMethod}</Text>
                    <StatusBadge status={selectedOrder.paymentStatus} />
                  </HStack>
                </Flex>

                <Divider borderColor={borderColor} />

                <Text fontWeight="700" color={headingColor}>Itemized Receipt</Text>
                <VStack spacing={2} align="stretch">
                  {selectedOrder.items.map((it, idx) => (
                    <Flex key={idx} justify="space-between" fontSize="xs">
                      <Box>
                        <Text fontWeight="700" color={headingColor}>
                          {it.quantity}x {it.name}
                        </Text>
                        {it.variantName && <Text color={textColor}>Portion: {it.variantName}</Text>}
                        {it.addOns && it.addOns.length > 0 && (
                          <Text color={textColor}>Add-ons: {it.addOns.map(a => a.name).join(', ')}</Text>
                        )}
                      </Box>
                      <Text fontWeight="700" color={headingColor}>₹{it.itemTotal.toFixed(2)}</Text>
                    </Flex>
                  ))}
                </VStack>

                <Divider borderColor={borderColor} />

                <VStack spacing={1.5} align="stretch" fontSize="xs">
                  <Flex justify="space-between">
                    <Text color={textColor}>Subtotal</Text>
                    <Text fontWeight="600">₹{selectedOrder.subtotal?.toFixed(2)}</Text>
                  </Flex>
                  {selectedOrder.discount ? (
                    <Flex justify="space-between" color="green.500">
                      <Text>Discount ({selectedOrder.discountCode || 'Promo'})</Text>
                      <Text fontWeight="600">-₹{selectedOrder.discount.toFixed(2)}</Text>
                    </Flex>
                  ) : null}
                  <Flex justify="space-between">
                    <Text color={textColor}>Taxes</Text>
                    <Text fontWeight="600">₹{selectedOrder.taxAmount?.toFixed(2)}</Text>
                  </Flex>
                  <Divider borderColor={borderColor} my={1} />
                  <Flex justify="space-between" fontSize="sm">
                    <Text fontWeight="800" color={headingColor}>Grand Total</Text>
                    <Text fontWeight="800" color={accentColor}>₹{selectedOrder.grandTotal.toFixed(2)}</Text>
                  </Flex>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            {selectedOrder && (
              <Button
                as={RouterLink}
                to={`/track-order/${selectedOrder._id}`}
                bg={accentColor}
                color={btnTextColor}
                _hover={{ opacity: 0.9 }}
                borderRadius="xl"
                size="sm"
                rightIcon={<FiArrowRight />}
              >
                Track Live Status
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
