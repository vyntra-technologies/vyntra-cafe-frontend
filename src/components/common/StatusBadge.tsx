import React from 'react';
import { Badge, BadgeProps } from '@chakra-ui/react';
import { FulfillmentStatus, PaymentStatus, TableStatus, ReservationStatus } from '../../types';

interface StatusBadgeProps extends BadgeProps {
  status: FulfillmentStatus | PaymentStatus | TableStatus | ReservationStatus | string;
  type?: 'fulfillment' | 'payment' | 'table' | 'reservation';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, ...props }) => {
  let colorScheme = 'gray';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    // Fulfillment
    case 'placed':
      colorScheme = 'blue';
      label = 'Order Placed';
      break;
    case 'confirmed':
      colorScheme = 'teal';
      label = 'Confirmed';
      break;
    case 'preparing':
      colorScheme = 'purple';
      label = 'Preparing';
      break;
    case 'ready_for_pickup':
      colorScheme = 'orange';
      label = 'Ready for Pickup';
      break;
    case 'served':
      colorScheme = 'cyan';
      label = 'Served';
      break;
    case 'completed':
      colorScheme = 'green';
      label = 'Completed';
      break;
    case 'cancelled':
      colorScheme = 'red';
      label = 'Cancelled';
      break;

    // Payment
    case 'paid':
      colorScheme = 'green';
      label = 'Paid';
      break;
    case 'pending':
      colorScheme = 'yellow';
      label = 'Payment Pending';
      break;
    case 'failed':
      colorScheme = 'red';
      label = 'Failed';
      break;
    case 'refunded':
      colorScheme = 'gray';
      label = 'Refunded';
      break;

    // Table
    case 'available':
      colorScheme = 'green';
      label = 'Available';
      break;
    case 'occupied':
      colorScheme = 'red';
      label = 'Occupied';
      break;
    case 'reserved':
      colorScheme = 'purple';
      label = 'Reserved';
      break;
    case 'cleaning':
      colorScheme = 'yellow';
      label = 'Cleaning';
      break;

    // Reservation
    case 'arrived':
      colorScheme = 'blue';
      label = 'Seated / Arrived';
      break;
    case 'no_show':
      colorScheme = 'red';
      label = 'No Show';
      break;
    default:
      colorScheme = 'gray';
  }

  return (
    <Badge
      colorScheme={colorScheme}
      borderRadius="full"
      px={3}
      py={0.5}
      fontSize="xs"
      fontWeight="700"
      textTransform="capitalize"
      letterSpacing="0.3px"
      {...props}
    >
      {label}
    </Badge>
  );
};

