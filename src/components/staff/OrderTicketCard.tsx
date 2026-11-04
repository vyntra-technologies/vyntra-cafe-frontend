import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Divider,
  Icon,
} from '@chakra-ui/react';
import {
  FiClock,
  FiShoppingBag,
  FiCheckCircle,
  FiEye,
} from 'react-icons/fi';
import { FaUtensils, FaConciergeBell } from 'react-icons/fa';
import { IOrder } from '../../types';
import { STAFF_COLORS } from './StaffTheme';

export interface OrderTicketCardProps {
  order: IOrder;
  onAction?: (action: string, order: IOrder) => void;
  onViewDetails?: (order: IOrder) => void;
  isLoading?: boolean;
  role?: 'waiter' | 'chef' | 'cashier';
}

export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({
  order,
  onAction,
  onViewDetails,
  isLoading = false,
  role = 'chef',
}) => {
  // Elapsed time calculation
  const getElapsedMinutes = () => {
    try {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((now - created) / 60000));
    } catch {
      return 0;
    }
  };

  const elapsed = getElapsedMinutes();
  const isUrgent = elapsed >= 15 && order.fulfillmentStatus !== 'completed' && order.fulfillmentStatus !== 'served';

  return (
    <Box
      bg={STAFF_COLORS.card}
      borderWidth="1px"
      borderColor={isUrgent ? STAFF_COLORS.danger : STAFF_COLORS.border}
      borderRadius="2xl"
      p={4}
      transition="all 0.2s ease"
      boxShadow={isUrgent ? '0 0 16px rgba(239, 68, 68, 0.2)' : '0 4px 16px rgba(0,0,0,0.2)'}
      _hover={{
        borderColor: STAFF_COLORS.primaryGold,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* Ticket Header */}
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <HStack spacing={2}>
            <Text fontSize="md" fontWeight="800" color={STAFF_COLORS.primaryGold} fontFamily="mono">
              #{order.orderNumber}
            </Text>
            <Badge
              fontSize="10px"
              px={2}
              py={0.5}
              borderRadius="full"
              colorScheme={order.orderType === 'dine-in' ? 'orange' : 'teal'}
              textTransform="uppercase"
            >
              {order.orderType === 'dine-in' ? (
                order.tableNumber
                  ? `T-${order.tableNumber}`
                  : (order.tableId as any)?.tableNumber
                  ? `T-${(order.tableId as any).tableNumber}`
                  : 'Dine-In'
              ) : (
                'Takeaway'
              )}
            </Badge>
          </HStack>

          <Text fontSize="11px" color={STAFF_COLORS.secondaryText} mt={0.5}>
            {order.customerName || (order.customerId as any)?.name || 'Guest'}
          </Text>
        </Box>

        {/* Elapsed Timer */}
        <HStack
          spacing={1}
          px={2}
          py={1}
          borderRadius="lg"
          bg={isUrgent ? STAFF_COLORS.dangerSubtle : STAFF_COLORS.innerCard}
          borderWidth="1px"
          borderColor={isUrgent ? STAFF_COLORS.danger : STAFF_COLORS.border}
          color={isUrgent ? STAFF_COLORS.danger : STAFF_COLORS.secondaryText}
          fontSize="11px"
          fontFamily="mono"
        >
          <Icon as={FiClock} />
          <Text fontWeight="700">{elapsed}m</Text>
        </HStack>
      </Flex>

      {/* Special Kitchen Notes (If any) */}
      {order.notes && (
        <Box
          mb={3}
          p={2}
          borderRadius="lg"
          bg="rgba(245, 158, 11, 0.12)"
          borderWidth="1px"
          borderColor={STAFF_COLORS.warning}
        >
          <Text fontSize="10px" fontWeight="800" color={STAFF_COLORS.warning} textTransform="uppercase">
            Note:
          </Text>
          <Text fontSize="11px" color={STAFF_COLORS.text} fontStyle="italic" noOfLines={2}>
            "{order.notes}"
          </Text>
        </Box>
      )}

      {/* Items Summary */}
      <VStack spacing={1.5} align="stretch" mb={4} maxH="140px" overflowY="auto" pr={1}>
        {order.items?.map((it, idx) => (
          <Flex key={idx} justify="space-between" align="center" fontSize="xs">
            <HStack spacing={2} flex="1">
              <Badge
                bg={STAFF_COLORS.goldSubtle}
                color={STAFF_COLORS.primaryGold}
                borderWidth="1px"
                borderColor={STAFF_COLORS.borderGold}
                fontSize="10px"
                px={1.5}
                py={0.2}
              >
                {it.quantity}x
              </Badge>
              <Text fontWeight="600" color={STAFF_COLORS.text} noOfLines={1}>
                {it.name}
              </Text>
            </HStack>
            {it.variantName && (
              <Text fontSize="10px" color={STAFF_COLORS.mutedText}>
                {it.variantName}
              </Text>
            )}
          </Flex>
        ))}
      </VStack>

      <Divider borderColor={STAFF_COLORS.border} mb={3} />

      {/* Action Footer */}
      <Flex justify="space-between" align="center" gap={2}>
        {onViewDetails && (
          <Button
            size="xs"
            variant="ghost"
            color={STAFF_COLORS.secondaryText}
            _hover={{ color: STAFF_COLORS.text, bg: STAFF_COLORS.innerCard }}
            leftIcon={<FiEye />}
            onClick={() => onViewDetails(order)}
          >
            Details
          </Button>
        )}

        {/* Dynamic Contextual Action based on Role & Status */}
        {onAction && (
          <Box flex="1" textAlign="right">
            {role === 'chef' && order.fulfillmentStatus === 'placed' && (
              <Button
                size="xs"
                bg={STAFF_COLORS.primaryGold}
                color="#0B0B0D"
                _hover={{ bg: STAFF_COLORS.lightGold }}
                borderRadius="lg"
                onClick={() => onAction('accept', order)}
                isLoading={isLoading}
              >
                Accept Order
              </Button>
            )}

            {role === 'chef' && order.fulfillmentStatus === 'confirmed' && (
              <Button
                size="xs"
                bg={STAFF_COLORS.warning}
                color="#0B0B0D"
                _hover={{ opacity: 0.9 }}
                borderRadius="lg"
                leftIcon={<FaUtensils />}
                onClick={() => onAction('start_preparing', order)}
                isLoading={isLoading}
              >
                Start Cooking
              </Button>
            )}

            {role === 'chef' && order.fulfillmentStatus === 'preparing' && (
              <Button
                size="xs"
                bg={STAFF_COLORS.success}
                color="#0B0B0D"
                _hover={{ opacity: 0.9 }}
                borderRadius="lg"
                leftIcon={<FaConciergeBell />}
                onClick={() => onAction('mark_ready', order)}
                isLoading={isLoading}
              >
                Mark Ready
              </Button>
            )}

            {role === 'waiter' && order.fulfillmentStatus === 'ready_for_pickup' && (
              <Button
                size="xs"
                bg={STAFF_COLORS.success}
                color="#0B0B0D"
                _hover={{ opacity: 0.9 }}
                borderRadius="lg"
                leftIcon={<FiCheckCircle />}
                onClick={() => onAction('mark_served', order)}
                isLoading={isLoading}
              >
                Serve to Table
              </Button>
            )}

            {role === 'cashier' && order.paymentStatus !== 'paid' && (
              <Button
                size="xs"
                bg={STAFF_COLORS.primaryGold}
                color="#0B0B0D"
                _hover={{ bg: STAFF_COLORS.lightGold }}
                borderRadius="lg"
                onClick={() => onAction('process_payment', order)}
                isLoading={isLoading}
              >
                Settle ₹{order.grandTotal?.toFixed(0)}
              </Button>
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

