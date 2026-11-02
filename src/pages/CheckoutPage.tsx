import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  RadioGroup,
  Radio,
  Input,
  Textarea,
  Divider,
  Flex,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiCoffee, FiShoppingBag, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { tableService } from '../services/table.service';
import { orderService, CreateOrderPayload } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { socketService } from '../services/socket.service';
import { ITable, OrderType, PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { joinTableRoom } = useSocket();
  const {
    items,
    subtotal,
    discount,
    taxAmount,
    grandTotal,
    appliedCoupon,
    clearCart,
  } = useCart();

  // Order Type: 'dine-in' (index 0) or 'takeaway' (index 1)
  const [orderTypeIndex, setOrderTypeIndex] = useState<number>(0);
  const orderType: OrderType = orderTypeIndex === 0 ? 'dine-in' : 'takeaway';

  // Table selection for Dine-In
  const [tables, setTables] = useState<ITable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);

  // Customer info & Payment
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  // Load tables & subscribe to live status changes
  useEffect(() => {
    setIsLoadingTables(true);
    joinTableRoom();

    tableService
      .getAll()
      .then((tableList) => {
        setTables(tableList);
        const firstAvailable = tableList.find((t) => t.status === 'available');
        if (firstAvailable) {
          setSelectedTableId(firstAvailable._id);
        }
      })
      .catch((err) => {
        console.error('Failed to load floor tables:', err);
        setTables([]);
      })
      .finally(() => setIsLoadingTables(false));

    // Listen to real-time table status updates via Socket.IO
    const unsubscribe = socketService.onTableStatusChange((data) => {
      setTables((prev) =>
        prev.map((t) => (t._id === data.tableId ? { ...t, status: data.status as any } : t))
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const selectedTable = tables.find((t) => t._id === selectedTableId);
  const paymentOptions = paymentService.getAvailablePaymentMethods(orderType);

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before proceeding to checkout.',
        status: 'error',
      });
      navigate('/menu');
      return;
    }

    if (orderType === 'dine-in' && !selectedTableId) {
      toast({
        title: 'Table Required',
        description: 'Please select an available dining table for your dine-in experience.',
        status: 'warning',
      });
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: 'Contact Details Required',
        description: 'Please provide customer name and phone number.',
        status: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: CreateOrderPayload = {
        orderType,
        tableId: orderType === 'dine-in' ? selectedTableId : undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        discountCode: appliedCoupon?.code,
        notes: notes.trim() || undefined,
        items: items.map((cartItem) => ({
          menuItemId: cartItem.menuItem._id,
          quantity: cartItem.quantity,
          variantName: cartItem.selectedVariant?.name,
          addOns: cartItem.selectedAddOns.map((a) => a.name),
          notes: cartItem.notes,
        })),
      };

      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const createdOrder = await orderService.create(orderPayload, idempotencyKey);

      clearCart();
      toast({
        title: 'Order Placed Successfully!',
        description: `Order ${createdOrder.orderNumber} is now being prepared.`,
        status: 'success',
        duration: 4000,
      });

      navigate(`/order-confirmation/${createdOrder._id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order. Please review your details and try again.';
      toast({
        title: 'Ordering Failed',
        description: msg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <VStack spacing={2} align="flex-start" mb={8}>
        <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
          Finalize Your Order
        </Heading>
        <Text fontSize="sm" color={textColor}>
          Select your dining preference, review live table availability, and choose payment.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="flex-start">
        {/* Left 2 Cols: Order Configuration */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <VStack spacing={6} align="stretch">
            {/* Dining Mode Selector (DINE_IN vs TAKEAWAY) */}
            <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
              <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
                1. Select Dining Mode
              </Text>
              <Tabs
                variant="soft-rounded"
                colorScheme="orange"
                index={orderTypeIndex}
                onChange={(idx) => setOrderTypeIndex(idx)}
              >
                <TabList bg={useColorModeValue('#FAF5EE', '#121417')} p={1.5} borderRadius="2xl">
                  <Tab
                    w="50%"
                    py={3}
                    borderRadius="xl"
                    fontWeight="700"
                    fontSize="sm"
                    _selected={{ bg: accentColor, color: 'white' }}
                  >
                    🍽️ Dine-In (Table Dining)
                  </Tab>
                  <Tab
                    w="50%"
                    py={3}
                    borderRadius="xl"
                    fontWeight="700"
                    fontSize="sm"
                    _selected={{ bg: accentColor, color: 'white' }}
                  >
                    🛍️ Takeaway (Counter Pickup)
                  </Tab>
                </TabList>

                <TabPanels pt={6}>
                  {/* DINE-IN PANEL */}
                  <TabPanel p={0}>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Text fontWeight="700" fontSize="sm" color={headingColor}>
                            Live Table Selection
                          </Text>
                          <Badge colorScheme="green" variant="subtle" fontSize="xs">
                            Live Status Feed
                          </Badge>
                        </Flex>
                        <Text fontSize="xs" color={textColor} mb={4}>
                          Choose your preferred table from available seating options:
                        </Text>

                        {isLoadingTables ? (
                          <HStack py={6} justify="center">
                            <Spinner color="orange.400" />
                            <Text fontSize="sm" color={textColor}>
                              Fetching available tables...
                            </Text>
                          </HStack>
                        ) : (
                          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                            {tables.map((t) => {
                              const isAvailable = t.status === 'available';
                              const isSelected = selectedTableId === t._id;

                              return (
                                <Box
                                  key={t._id}
                                  p={3.5}
                                  borderRadius="2xl"
                                  borderWidth="2px"
                                  borderColor={
                                    isSelected
                                      ? accentColor
                                      : isAvailable
                                      ? borderColor
                                      : 'red.900'
                                  }
                                  bg={
                                    isSelected
                                      ? useColorModeValue('orange.50', 'whiteAlpha.100')
                                      : isAvailable
                                      ? cardBg
                                      : useColorModeValue('gray.100', 'blackAlpha.400')
                                  }
                                  opacity={isAvailable ? 1 : 0.6}
                                  cursor={isAvailable ? 'pointer' : 'not-allowed'}
                                  onClick={() => isAvailable && setSelectedTableId(t._id)}
                                  transition="all 0.2s ease"
                                  position="relative"
                                >
                                  <Flex justify="space-between" align="center" mb={1}>
                                    <Text fontWeight="800" fontSize="md" color={headingColor}>
                                      {t.tableNumber}
                                    </Text>
                                    <Badge
                                      colorScheme={isAvailable ? 'green' : 'red'}
                                      fontSize="9px"
                                      px={1.5}
                                    >
                                      {isAvailable ? 'FREE' : 'BUSY'}
                                    </Badge>
                                  </Flex>
                                  <Text fontSize="xs" color={textColor}>
                                    {t.capacity} Guests
                                  </Text>
                                  <Text fontSize="10px" color={textColor} noOfLines={1}>
                                    {t.section}
                                  </Text>
                                </Box>
                              );
                            })}
                          </SimpleGrid>
                        )}

                        {selectedTable && (
                          <Box
                            mt={4}
                            p={3.5}
                            borderRadius="xl"
                            bg={useColorModeValue('green.50', 'rgba(72, 187, 120, 0.1)')}
                            borderWidth="1px"
                            borderColor="green.400"
                          >
                            <HStack justify="space-between" fontSize="xs">
                              <HStack color="green.500" spacing={2}>
                                <FiCheckCircle />
                                <Text fontWeight="700">
                                  Selected Table: {selectedTable.tableNumber} ({selectedTable.section})
                                </Text>
                              </HStack>
                              <Text color={textColor}>Capacity: {selectedTable.capacity} Seats</Text>
                            </HStack>
                          </Box>
                        )}
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* TAKEAWAY PANEL */}
                  <TabPanel p={0}>
                    <Box
                      p={5}
                      borderRadius="2xl"
                      bg={useColorModeValue('orange.50', 'rgba(255, 122, 26, 0.08)')}
                      borderWidth="1px"
                      borderColor={accentColor}
                    >
                      <HStack spacing={4} align="flex-start">
                        <Box color={accentColor} fontSize="2xl" mt={1}>
                          <FiClock />
                        </Box>
                        <Box>
                          <Text fontWeight="800" fontSize="sm" color={headingColor}>
                            Estimated Ready Time: 12 – 15 Minutes
                          </Text>
                          <Text fontSize="xs" color={textColor} mt={1} lineHeight="tall">
                            Your order will be fresh, packaged in thermal eco-friendly packaging, and held warm at the front counter. Show your order confirmation screen for pickup.
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Customer Contact Details */}
            <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
              <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
                2. Guest Details
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
                <Box>
                  <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                    Full Name *
                  </Text>
                  <Input
                    placeholder="e.g. Eleanor Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    borderRadius="xl"
                  />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                    Phone Number (For Order SMS / Table) *
                  </Text>
                  <Input
                    placeholder="e.g. +1-555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    borderRadius="xl"
                  />
                </Box>
              </SimpleGrid>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Order Preparation Notes (Optional)
                </Text>
                <Textarea
                  placeholder="e.g. Table preference, allergy warnings, extra napkins..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  borderRadius="xl"
                  rows={2}
                />
              </Box>
            </Box>

            {/* Payment Method Selection */}
            <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
              <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
                3. Choose Payment Method
              </Text>
              <RadioGroup
                value={paymentMethod}
                onChange={(val: any) => setPaymentMethod(val)}
              >
                <VStack spacing={3} align="stretch">
                  {paymentOptions.map((opt) => (
                    <Flex
                      key={opt.id}
                      p={4}
                      borderRadius="2xl"
                      borderWidth="1px"
                      borderColor={paymentMethod === opt.id ? accentColor : borderColor}
                      bg={
                        paymentMethod === opt.id
                          ? useColorModeValue('orange.50', 'whiteAlpha.100')
                          : 'transparent'
                      }
                      justify="space-between"
                      align="center"
                      cursor="pointer"
                      onClick={() => setPaymentMethod(opt.id)}
                    >
                      <Radio value={opt.id} colorScheme="orange">
                        <Box ml={2}>
                          <HStack spacing={2}>
                            <Text fontWeight="700" fontSize="sm" color={headingColor}>
                              {opt.name}
                            </Text>
                            {opt.badge && (
                              <Badge colorScheme="green" fontSize="10px">
                                {opt.badge}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color={textColor} mt={0.5}>
                            {opt.description}
                          </Text>
                        </Box>
                      </Radio>
                      <Box color={accentColor} fontSize="lg">
                        <FiCreditCard />
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </RadioGroup>
            </Box>
          </VStack>
        </Box>

        {/* Right 1 Col: Order Summary & Place Order */}
        <VStack spacing={6} align="stretch">
          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              Order Summary ({items.length} Items)
            </Text>

            <VStack spacing={3} align="stretch" maxH="240px" overflowY="auto" mb={4} pr={1}>
              {items.map((it) => (
                <Flex key={it.cartItemId} justify="space-between" fontSize="xs">
                  <Box>
                    <Text fontWeight="700" color={headingColor} noOfLines={1}>
                      {it.quantity}x {it.menuItem.name}
                    </Text>
                    {it.selectedVariant && (
                      <Text color={textColor}>Size: {it.selectedVariant.name}</Text>
                    )}
                  </Box>
                  <Text fontWeight="700" color={accentColor}>
                    ₹{it.totalPrice.toFixed(2)}
                  </Text>
                </Flex>
              ))}
            </VStack>

            <Divider borderColor={borderColor} mb={4} />

            <VStack spacing={2.5} align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color={textColor}>Subtotal</Text>
                <Text fontWeight="600">₹{subtotal.toFixed(2)}</Text>
              </Flex>

              {discount > 0 && (
                <Flex justify="space-between" color="green.500">
                  <Text>Voucher Discount</Text>
                  <Text fontWeight="600">-₹{discount.toFixed(2)}</Text>
                </Flex>
              )}

              <Flex justify="space-between">
                <Text color={textColor}>Taxes (7.5%)</Text>
                <Text fontWeight="600">₹{taxAmount.toFixed(2)}</Text>
              </Flex>

              <Divider borderColor={borderColor} my={1} />

              <Flex justify="space-between" align="baseline">
                <Text fontWeight="800" fontSize="md" color={headingColor}>
                  Total
                </Text>
                <Text fontWeight="800" fontSize="2xl" color={accentColor}>
                  ₹{grandTotal.toFixed(2)}
                </Text>
              </Flex>
            </VStack>

            <Button
              mt={6}
              w="100%"
              size="lg"
              h="14"
              bgGradient={useColorModeValue(
                'linear(to-r, #A87916, #D4AF37)',
                'linear(to-r, #D4AF37, #F5D76E)'
              )}
              color={useColorModeValue('#FFFFFF', '#0B0B0B')}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
                opacity: 0.95,
              }}
              _active={{ transform: 'translateY(0)' }}
              borderRadius="2xl"
              onClick={handleSubmitOrder}
              isLoading={isSubmitting}
              loadingText="Authorizing Order..."
              fontWeight="800"
            >
              Confirm & Place Order
            </Button>

            <Text fontSize="11px" color={textColor} textAlign="center" mt={3}>
              By confirming, your order will be instantly queued at the cafe kitchen.
            </Text>
          </Box>
        </VStack>
      </SimpleGrid>
    </PageContainer>
  );
};
