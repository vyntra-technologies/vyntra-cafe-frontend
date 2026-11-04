import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Divider,
  Flex,
  Button,
  Icon,
} from '@chakra-ui/react';
import {
  FiClock,
  FiShoppingBag,
  FiCheckCircle,
  FiPrinter,
} from 'react-icons/fi';
import { FaUtensils, FaConciergeBell } from 'react-icons/fa';
import { IOrder } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { STAFF_COLORS } from './StaffTheme';

export interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder | null;
  onAction?: (action: string, order: IOrder) => void;
  actionLoading?: boolean;
  role?: 'waiter' | 'chef' | 'cashier';
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  isOpen,
  onClose,
  order,
  onAction,
  actionLoading = false,
  role = 'waiter',
}) => {
  if (!order) return null;

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.7)" />
      <DrawerContent
        bg={STAFF_COLORS.sidebar}
        borderLeftWidth="1px"
        borderColor={STAFF_COLORS.border}
        color={STAFF_COLORS.text}
      >
        <DrawerCloseButton color={STAFF_COLORS.secondaryText} />
        <DrawerHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} py={4}>
          <HStack justify="space-between" pr={6}>
            <Box>
              <Text fontSize="10px" color={STAFF_COLORS.secondaryText} textTransform="uppercase" letterSpacing="widest">
                Order Details
              </Text>
              <Text fontSize="lg" fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
                #{order.orderNumber}
              </Text>
            </Box>
            <StatusBadge status={order.fulfillmentStatus} />
          </HStack>
        </DrawerHeader>

        <DrawerBody py={5}>
          <VStack spacing={5} align="stretch">
            {/* Meta Details Grid */}
            <Box p={4} borderRadius="xl" bg={STAFF_COLORS.card} borderWidth="1px" borderColor={STAFF_COLORS.border}>
              <VStack spacing={2.5} align="stretch" fontSize="xs">
                <Flex justify="space-between">
                  <Text color={STAFF_COLORS.secondaryText}>Order Type</Text>
                  <Badge colorScheme={order.orderType === 'dine-in' ? 'orange' : 'teal'} textTransform="uppercase">
                    {order.orderType}
                  </Badge>
                </Flex>

                {order.orderType === 'dine-in' && (
                  <Flex justify="space-between">
                    <Text color={STAFF_COLORS.secondaryText}>Table Number</Text>
                    <Text fontWeight="800" color={STAFF_COLORS.text}>
                      {order.tableNumber
                        ? `Table #${order.tableNumber}`
                        : (order.tableId as any)?.tableNumber
                        ? `Table #${(order.tableId as any).tableNumber}`
                        : 'Assigned by Host'}
                    </Text>
                  </Flex>
                )}

                <Flex justify="space-between">
                  <Text color={STAFF_COLORS.secondaryText}>Placed Time</Text>
                  <HStack spacing={1}>
                    <Icon as={FiClock} color={STAFF_COLORS.mutedText} />
                    <Text color={STAFF_COLORS.text}>{formatDateTime(order.createdAt)}</Text>
                  </HStack>
                </Flex>

                <Flex justify="space-between">
                  <Text color={STAFF_COLORS.secondaryText}>Customer</Text>
                  <Text fontWeight="600" color={STAFF_COLORS.text}>
                    {order.customerName || (order.customerId as any)?.name || 'Walk-in Guest'}
                  </Text>
                </Flex>

                {(order.customerPhone || (order.customerId as any)?.phone) && (
                  <Flex justify="space-between">
                    <Text color={STAFF_COLORS.secondaryText}>Phone</Text>
                    <Text color={STAFF_COLORS.text}>
                      {order.customerPhone || (order.customerId as any)?.phone}
                    </Text>
                  </Flex>
                )}

                {/* For Waiter & Cashier only: show payment info (Chef terminal must hide prices) */}
                {role !== 'chef' && (
                  <>
                    <Divider borderColor={STAFF_COLORS.border} my={1} />
                    <Flex justify="space-between">
                      <Text color={STAFF_COLORS.secondaryText}>Payment Status</Text>
                      <StatusBadge status={order.paymentStatus} />
                    </Flex>
                    <Flex justify="space-between">
                      <Text color={STAFF_COLORS.secondaryText}>Payment Method</Text>
                      <Text fontWeight="700" textTransform="uppercase" color={STAFF_COLORS.primaryGold}>
                        {order.paymentMethod}
                      </Text>
                    </Flex>
                  </>
                )}
              </VStack>
            </Box>

            {/* Special Instructions / Notes if any */}
            {order.notes && (
              <Box p={3} borderRadius="xl" bg="rgba(245, 158, 11, 0.1)" borderWidth="1px" borderColor={STAFF_COLORS.warning}>
                <Text fontSize="10px" color={STAFF_COLORS.warning} fontWeight="800" textTransform="uppercase">
                  Kitchen Instructions:
                </Text>
                <Text fontSize="xs" color={STAFF_COLORS.text} fontStyle="italic" mt={1}>
                  "{order.notes}"
                </Text>
              </Box>
            )}

            {/* Ordered Items */}
            <Box>
              <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.secondaryText} textTransform="uppercase" letterSpacing="wider" mb={3}>
                Items Ordered ({order.items?.length || 0})
              </Text>

              <VStack spacing={2} align="stretch">
                {order.items?.map((it, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    borderRadius="xl"
                    bg={STAFF_COLORS.card}
                    borderWidth="1px"
                    borderColor={STAFF_COLORS.border}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <HStack spacing={2.5} align="flex-start" flex="1">
                        <Badge
                          bg={STAFF_COLORS.goldSubtle}
                          color={STAFF_COLORS.primaryGold}
                          borderWidth="1px"
                          borderColor={STAFF_COLORS.borderGold}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                        >
                          {it.quantity}x
                        </Badge>
                        <Box>
                          <Text fontWeight="700" fontSize="xs" color={STAFF_COLORS.text}>
                            {it.name}
                          </Text>
                          {it.variantName && (
                            <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>
                              Portion: {it.variantName}
                            </Text>
                          )}
                          {it.addOns && it.addOns.length > 0 && (
                            <Text fontSize="10px" color={STAFF_COLORS.secondaryText}>
                              Add-ons: {it.addOns.map((a) => a.name).join(', ')}
                            </Text>
                          )}
                          {it.notes && (
                            <Text fontSize="10px" color={STAFF_COLORS.warning} fontStyle="italic">
                              Note: {it.notes}
                            </Text>
                          )}
                        </Box>
                      </HStack>

                      {/* Hide prices on Chef display */}
                      {role !== 'chef' && (
                        <Text fontWeight="800" fontSize="xs" color={STAFF_COLORS.text}>
                          ₹{it.itemTotal?.toFixed(2) || '0.00'}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Billing Breakdown (Hidden on Chef display) */}
            {role !== 'chef' && (
              <Box p={4} borderRadius="xl" bg={STAFF_COLORS.card} borderWidth="1px" borderColor={STAFF_COLORS.border}>
                <VStack spacing={1.5} align="stretch" fontSize="xs">
                  <Flex justify="space-between">
                    <Text color={STAFF_COLORS.secondaryText}>Subtotal</Text>
                    <Text color={STAFF_COLORS.text}>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
                  </Flex>
                  {order.discount ? (
                    <Flex justify="space-between" color={STAFF_COLORS.success}>
                      <Text>Discount ({order.discountCode || 'Promo'})</Text>
                      <Text>-₹{order.discount.toFixed(2)}</Text>
                    </Flex>
                  ) : null}
                  <Flex justify="space-between">
                    <Text color={STAFF_COLORS.secondaryText}>Taxes</Text>
                    <Text color={STAFF_COLORS.text}>₹{order.taxAmount?.toFixed(2) || '0.00'}</Text>
                  </Flex>
                  <Divider borderColor={STAFF_COLORS.border} my={1} />
                  <Flex justify="space-between" fontSize="sm">
                    <Text fontWeight="800" color={STAFF_COLORS.text}>
                      Grand Total
                    </Text>
                    <Text fontWeight="800" color={STAFF_COLORS.primaryGold} fontSize="md">
                      ₹{order.grandTotal?.toFixed(2) || '0.00'}
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            )}

            {/* Role-specific Actions */}
            {onAction && (
              <Box pt={2}>
                {role === 'waiter' && order.fulfillmentStatus === 'ready_for_pickup' && (
                  <Button
                    w="100%"
                    bg={STAFF_COLORS.success}
                    color="#0B0B0D"
                    _hover={{ opacity: 0.9 }}
                    borderRadius="xl"
                    leftIcon={<FiCheckCircle />}
                    onClick={() => onAction('mark_served', order)}
                    isLoading={actionLoading}
                  >
                    Mark as Served to Table
                  </Button>
                )}

                {role === 'waiter' && ['placed', 'confirmed', 'preparing'].includes(order.fulfillmentStatus) && (
                  <Button
                    w="100%"
                    variant="outline"
                    borderColor={STAFF_COLORS.border}
                    borderRadius="xl"
                    onClick={() => onAction('request_bill', order)}
                    isLoading={actionLoading}
                  >
                    Request Bill for Table
                  </Button>
                )}

                {role === 'chef' && order.fulfillmentStatus === 'placed' && (
                  <Button
                    w="100%"
                    bg={STAFF_COLORS.primaryGold}
                    color="#0B0B0D"
                    _hover={{ bg: STAFF_COLORS.lightGold }}
                    borderRadius="xl"
                    onClick={() => onAction('accept', order)}
                    isLoading={actionLoading}
                  >
                    Accept Order into Kitchen
                  </Button>
                )}

                {role === 'chef' && order.fulfillmentStatus === 'confirmed' && (
                  <Button
                    w="100%"
                    bg={STAFF_COLORS.warning}
                    color="#0B0B0D"
                    _hover={{ opacity: 0.9 }}
                    borderRadius="xl"
                    leftIcon={<FaUtensils />}
                    onClick={() => onAction('start_preparing', order)}
                    isLoading={actionLoading}
                  >
                    Start Cooking / Preparation
                  </Button>
                )}

                {role === 'chef' && order.fulfillmentStatus === 'preparing' && (
                  <Button
                    w="100%"
                    bg={STAFF_COLORS.success}
                    color="#0B0B0D"
                    _hover={{ opacity: 0.9 }}
                    borderRadius="xl"
                    leftIcon={<FaConciergeBell />}
                    onClick={() => onAction('mark_ready', order)}
                    isLoading={actionLoading}
                  >
                    Mark as Ready for Service
                  </Button>
                )}

                {role === 'cashier' && order.paymentStatus !== 'paid' && (
                  <Button
                    w="100%"
                    bg={STAFF_COLORS.primaryGold}
                    color="#0B0B0D"
                    _hover={{ bg: STAFF_COLORS.lightGold }}
                    borderRadius="xl"
                    onClick={() => onAction('process_payment', order)}
                    isLoading={actionLoading}
                  >
                    Settle / Process Bill
                  </Button>
                )}
              </Box>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

