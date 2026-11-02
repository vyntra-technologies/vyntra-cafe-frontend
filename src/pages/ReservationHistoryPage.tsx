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
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiXCircle, FiPlus } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { reservationService } from '../services/reservation.service';
import { IReservation } from '../types';

export const ReservationHistoryPage: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const loadReservations = async () => {
    setIsLoading(true);
    const localIds = reservationService.getLocalReservationHistory();
    const fetched: IReservation[] = [];

    for (const id of localIds) {
      try {
        const res = await reservationService.getById(id);
        if (res) fetched.push(res);
      } catch {
        // Fallback for demo if id was mock
      }
    }

    setReservations(fetched);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const openCancelModal = (resId: string) => {
    setSelectedResId(resId);
    setCancelReason('');
    onOpen();
  };

  const handleCancelReservation = async () => {
    if (!selectedResId || !cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please specify the cancellation reason.',
        status: 'warning',
      });
      return;
    }

    setIsCancelling(true);
    try {
      await reservationService.cancel(selectedResId, cancelReason.trim());
      toast({
        title: 'Reservation Cancelled',
        description: 'Your booking has been cancelled.',
        status: 'info',
        duration: 3500,
      });
      onClose();
      await loadReservations();
    } catch (err: any) {
      toast({
        title: 'Cancellation Failed',
        description: err.response?.data?.message || 'Could not cancel reservation.',
        status: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer>
      <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb={8} gap={4}>
        <Box>
          <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
            My Table Reservations
          </Heading>
          <Text fontSize="sm" color={textColor} mt={1}>
            Track upcoming bookings and review past dining reservations.
          </Text>
        </Box>
        <Button
          as={RouterLink}
          to="/reservations"
          bg={accentColor}
          color={btnTextColor}
          _hover={{ opacity: 0.9 }}
          borderRadius="xl"
          leftIcon={<FiPlus />}
        >
          Book Another Table
        </Button>
      </Flex>

      {isLoading ? (
        <LoadingState type="list" count={3} />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No Reservations Found"
          description="You don't have any table reservations registered yet. Book a table for an upcoming evening."
          actionText="Reserve a Table"
          actionLink="/reservations"
        />
      ) : (
        <VStack spacing={4} align="stretch">
          {reservations.map((res) => {
            const canCancel = res.status === 'pending' || res.status === 'confirmed';

            return (
              <Box
                key={res._id}
                bg={cardBg}
                p={6}
                borderRadius="3xl"
                borderWidth="1px"
                borderColor={borderColor}
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
                      <Text fontWeight="800" fontSize="lg" color={headingColor}>
                        {new Date(res.reservationDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                      <Badge
                        bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
                        color={accentColor}
                        fontSize="xs"
                        borderRadius="md"
                        px={2}
                      >
                        {res.reservationTime}
                      </Badge>
                      <StatusBadge status={res.status} />
                    </HStack>
                    <Text fontSize="xs" color={textColor}>
                      Guest: {res.customerName} ({res.customerPhone})
                    </Text>
                  </Box>

                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      borderRadius="xl"
                      leftIcon={<FiXCircle />}
                      onClick={() => openCancelModal(res._id)}
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </Flex>

                <Divider borderColor={borderColor} mb={4} />

                <HStack spacing={6} color={textColor} fontSize="sm">
                  <HStack spacing={2}>
                    <FiUsers color={accentColor} />
                    <Text>{res.guestCount} {res.guestCount === 1 ? 'Guest' : 'Guests'}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <FiClock color={accentColor} />
                    <Text>{res.durationMinutes || 90} Minutes Duration</Text>
                  </HStack>
                  {res.tableId && (
                    <Text>
                      Table: {typeof res.tableId === 'object' ? (res.tableId as any).tableNumber : 'Reserved Table'}
                    </Text>
                  )}
                </HStack>

                {res.specialRequests && (
                  <Text fontSize="xs" color={textColor} mt={3} fontStyle="italic">
                    Notes: "{res.specialRequests}"
                  </Text>
                )}

                {res.cancellationReason && (
                  <Box mt={3} p={2.5} borderRadius="lg" bg="red.900" color="red.200" fontSize="xs">
                    Cancelled: {res.cancellationReason}
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Cancel Reservation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor}>Cancel Table Reservation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={textColor} mb={4}>
              Are you sure you want to cancel this booking? Please provide a reason for our hosts.
            </Text>
            <Textarea
              placeholder="e.g. Schedule conflict, rescheduled, party canceled..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              borderRadius="xl"
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Keep Booking
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelReservation}
              isLoading={isCancelling}
              borderRadius="xl"
            >
              Confirm Cancellation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
