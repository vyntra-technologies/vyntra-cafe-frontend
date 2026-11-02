import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiPrinter, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { orderService } from '../services/order.service';
import { IOrder } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      orderService.getById(id).catch(() => null),
      orderService.getReceipt(id).catch(() => null),
    ])
      .then(([orderData, receiptData]) => {
        setOrder(orderData);
        setReceipt(receiptData);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <VStack spacing={4} py={16} justify="center">
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={textColor}>Preparing order confirmation...</Text>
        </VStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxW="3xl">
      <VStack spacing={6} align="stretch">
        {/* Success Card */}
        <Box
          bg={cardBg}
          p={{ base: 6, md: 8 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
          boxShadow="sm"
        >
          <Box color="green.400" fontSize="5xl" mb={3} display="inline-block">
            <FiCheckCircle />
          </Box>
          <Heading fontFamily="heading" size="lg" fontWeight="800" color={headingColor} mb={2}>
            Thank You for Your Order!
          </Heading>
          <Text fontSize="sm" color={textColor} maxW="md" mx="auto" mb={4}>
            Your order has been transmitted directly to our kitchen. We're handcrafting your items with care.
          </Text>

          <HStack justify="center" spacing={3} wrap="wrap">
            <Badge
              bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
              color={accentColor}
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="lg"
            >
              Order #{order?.orderNumber || id}
            </Badge>
            <StatusBadge status={order?.fulfillmentStatus || 'placed'} />
            <StatusBadge status={order?.paymentStatus || 'pending'} />
          </HStack>

          {/* Action Buttons */}
          <HStack justify="center" spacing={4} pt={6}>
            <Button
              as={RouterLink}
              to={`/track-order/${id}`}
              bg={accentColor}
              color={btnTextColor}
              _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
              borderRadius="xl"
              leftIcon={<FiClock />}
              px={6}
            >
              Track Order Live
            </Button>
            <Button
              variant="outline"
              borderColor={borderColor}
              color={headingColor}
              _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
              borderRadius="xl"
              leftIcon={<FiPrinter />}
              onClick={handlePrint}
            >
              Print Receipt
            </Button>
          </HStack>
        </Box>

        {/* Itemized Order Receipt Card */}
        <Box
          bg={cardBg}
          p={{ base: 6, md: 8 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontWeight="800" fontSize="md" color={headingColor}>
                Order Details
              </Text>
              <Text fontSize="xs" color={textColor}>
                Type: {order?.orderType === 'dine-in' ? `Dine-In (${order.tableNumber || 'Table Selected'})` : 'Takeaway (Counter Pickup)'}
              </Text>
            </Box>
            <Text fontSize="xs" color={textColor}>
              {new Date(order?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Flex>

          <Divider borderColor={borderColor} mb={4} />

          {/* Items List */}
          <VStack spacing={3} align="stretch" mb={4}>
            {order?.items.map((it, idx) => (
              <Flex key={idx} justify="space-between" align="flex-start" fontSize="sm">
                <Box>
                  <Text fontWeight="700" color={headingColor}>
                    {it.quantity}x {it.name}
                  </Text>
                  {it.variantName && (
                    <Text fontSize="xs" color={textColor}>
                      Size: {it.variantName}
                    </Text>
                  )}
                  {it.addOns && it.addOns.length > 0 && (
                    <Text fontSize="xs" color={textColor}>
                      Add-ons: {it.addOns.map((a) => a.name).join(', ')}
                    </Text>
                  )}
                </Box>
                <Text fontWeight="700" color={headingColor}>
                  ₹{it.itemTotal.toFixed(2)}
                </Text>
              </Flex>
            ))}
          </VStack>

          <Divider borderColor={borderColor} mb={4} />

          {/* Calculations */}
          <VStack spacing={2} align="stretch" fontSize="sm">
            <Flex justify="space-between">
              <Text color={textColor}>Subtotal</Text>
              <Text fontWeight="600">₹{order?.subtotal?.toFixed(2) || '0.00'}</Text>
            </Flex>

            {order?.discount ? (
              <Flex justify="space-between" color="green.500">
                <Text>Discount ({order.discountCode || 'Voucher'})</Text>
                <Text fontWeight="600">-₹{order.discount.toFixed(2)}</Text>
              </Flex>
            ) : null}

            <Flex justify="space-between">
              <Text color={textColor}>Taxes</Text>
              <Text fontWeight="600">₹{order?.taxAmount?.toFixed(2) || '0.00'}</Text>
            </Flex>

            <Divider borderColor={borderColor} my={1} />

            <Flex justify="space-between" align="baseline">
              <Text fontWeight="800" fontSize="md" color={headingColor}>
                Grand Total
              </Text>
              <Text fontWeight="800" fontSize="xl" color={accentColor}>
                ₹{order?.grandTotal?.toFixed(2) || '0.00'}
              </Text>
            </Flex>
          </VStack>

          <Box mt={6} textAlign="center">
            <Button as={RouterLink} to="/menu" variant="ghost" color={accentColor} size="sm">
              Back to Menu
            </Button>
          </Box>
        </Box>
      </VStack>
    </PageContainer>
  );
};
