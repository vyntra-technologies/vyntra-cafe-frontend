import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
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
  FormControl,
  FormLabel,
  Textarea,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reservationService } from '../../services/reservation.service';
import { tableService } from '../../services/table.service';
import { IReservation, ITable, ReservationStatus } from '../../types';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [tables, setTables] = useState<ITable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const [selectedRes, setSelectedRes] = useState<IReservation | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const [resData, tablesData] = await Promise.all([
        reservationService.getAll({
          date: dateFilter || undefined,
          status: statusFilter || undefined,
          page,
          limit: 10,
        }),
        tableService.getAll(),
      ]);

      setReservations(resData.reservations);
      setTables(tablesData);
      if (resData.pagination) {
        setTotalPages(resData.pagination.totalPages || 1);
      }
    } catch (err: any) {
      toast({
        title: 'Error loading reservations',
        description: err?.response?.data?.message || 'Could not fetch reservations',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, dateFilter, statusFilter]);

  const handleConfirmReservation = async (res: IReservation) => {
    try {
      await reservationService.confirm(res._id);
      toast({ title: `Reservation for ${res.customerName} confirmed`, status: 'success', duration: 2500 });
      fetchReservations();
    } catch {
      toast({ title: 'Confirmation failed', status: 'error', duration: 2500 });
    }
  };

  const handleMarkArrival = async (res: IReservation) => {
    try {
      await reservationService.markArrived(res._id);
      toast({ title: `${res.customerName} marked as Arrived and Seated`, status: 'info', duration: 2500 });
      fetchReservations();
    } catch {
      toast({ title: 'Failed to mark arrival', status: 'error', duration: 2500 });
    }
  };

  const handleRejectReservation = async () => {
    if (!selectedRes) return;
    try {
      setIsSubmitting(true);
      await reservationService.reject(selectedRes._id, rejectReason || 'Table slot unavailable at requested time');
      toast({ title: 'Reservation rejected/cancelled', status: 'info', duration: 2500 });
      onRejectClose();
      fetchReservations();
    } catch (err: any) {
      toast({
        title: 'Rejection Error',
        description: err?.response?.data?.message || 'Could not update reservation',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge colorScheme="green" variant="solid">CONFIRMED</Badge>;
      case 'arrived':
        return <Badge colorScheme="purple" variant="solid">ARRIVED</Badge>;
      case 'completed':
        return <Badge colorScheme="teal" variant="subtle">COMPLETED</Badge>;
      case 'pending':
        return <Badge colorScheme="yellow" variant="solid">PENDING</Badge>;
      case 'cancelled':
      case 'no_show':
        return <Badge colorScheme="red" variant="subtle">{status.toUpperCase()}</Badge>;
      default:
        return <Badge colorScheme="gray">{status}</Badge>;
    }
  };

  return (
    <AdminLayout pageTitle="Guest Reservations">
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
              Table Reservations
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Manage customer dining bookings, party sizes, and arrival seating.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchReservations}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Refresh Bookings
            </Button>
          </HStack>
        </Flex>

        {/* Filter Controls Bar */}
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align={{ base: 'stretch', md: 'center' }}
          >
            <Box flex={1}>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                size="sm"
                bg={innerCardBg}
                borderColor={borderColor}
                color={textColor}
              />
            </Box>

            <Select
              placeholder="All Reservation Statuses"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              maxW={{ base: '100%', md: '200px' }}
              bg={innerCardBg}
              borderColor={borderColor}
              color={textColor}
            >
              <option value="pending">Pending Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="arrived">Arrived & Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </Select>

            {(dateFilter || statusFilter) && (
              <Button
                size="sm"
                variant="ghost"
                color={goldAccent}
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </Flex>
        </Box>

        {/* Reservations Table */}
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
                <Th color={mutedColor} borderColor={borderColor}>Guest Details</Th>
                <Th color={mutedColor} borderColor={borderColor}>Date & Time</Th>
                <Th color={mutedColor} borderColor={borderColor}>Party Size</Th>
                <Th color={mutedColor} borderColor={borderColor}>Table</Th>
                <Th color={mutedColor} borderColor={borderColor}>Status</Th>
                <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12}>
                    <Spinner color={goldAccent} />
                    <Text mt={2} fontSize="sm" color={mutedColor}>Loading reservations...</Text>
                  </Td>
                </Tr>
              ) : reservations.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color={mutedColor}>
                    No table reservations scheduled for selected criteria.
                  </Td>
                </Tr>
              ) : (
                reservations.map((res) => (
                  <Tr key={res._id} _hover={{ bg: innerCardBg }}>
                    <Td borderColor={borderColor}>
                      <Text fontWeight="600" color={textColor} fontSize="14px">
                        {res.customerName}
                      </Text>
                      <Text fontSize="11px" color={mutedColor}>
                        {res.customerPhone} &bull; {res.customerEmail}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing={1} fontSize="13px" color={textColor} fontWeight="600">
                        <FiCalendar />
                        <Text>{new Date(res.reservationDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                      </HStack>
                      <HStack spacing={1} fontSize="11px" color={goldAccent}>
                        <FiClock />
                        <Text>{res.reservationTime || 'Specified'}</Text>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" fontWeight="600" color={textColor}>
                      <HStack spacing={1}>
                        <FiUsers />
                        <Text>{res.guestCount} Guests</Text>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" color={goldAccent} fontWeight="600">
                      {res.tableId ? (typeof res.tableId === 'object' ? `Table ${res.tableId.tableNumber}` : `Table ${res.tableId}`) : 'Auto Assign'}
                    </Td>
                    <Td borderColor={borderColor}>
                      {getStatusBadge(res.status)}
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
                            setSelectedRes(res);
                            onDetailOpen();
                          }}
                        />

                        {res.status === 'pending' && (
                          <Button
                            size="xs"
                            colorScheme="green"
                            leftIcon={<FiCheckCircle />}
                            onClick={() => handleConfirmReservation(res)}
                          >
                            Confirm
                          </Button>
                        )}

                        {res.status === 'confirmed' && (
                          <Button
                            size="xs"
                            bg={goldAccent}
                            color="black"
                            leftIcon={<FiUserCheck />}
                            onClick={() => handleMarkArrival(res)}
                          >
                            Seated
                          </Button>
                        )}

                        {['pending', 'confirmed'].includes(res.status) && (
                          <IconButton
                            aria-label="Reject / Cancel"
                            icon={<FiXCircle />}
                            size="xs"
                            variant="ghost"
                            color="red.400"
                            onClick={() => {
                              setSelectedRes(res);
                              setRejectReason('');
                              onRejectOpen();
                            }}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {/* Pagination */}
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
              Page {page} of {totalPages}
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

        {/* View Details Modal */}
        {selectedRes && (
          <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Reservation Details &bull; {selectedRes.customerName}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <SimpleGrid columns={2} spacing={4} mb={4} p={3.5} borderRadius="lg" bg={innerCardBg}>
                  <Box>
                    <Text fontSize="11px" color={mutedColor} textTransform="uppercase">Party Details</Text>
                    <Text fontSize="sm" fontWeight="600" color={textColor}>{selectedRes.guestCount} Guests</Text>
                    <Text fontSize="xs" color={goldAccent}>
                      {selectedRes.reservationTime} on {new Date(selectedRes.reservationDate).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="11px" color={mutedColor} textTransform="uppercase">Status</Text>
                    <Box mt={1}>{getStatusBadge(selectedRes.status)}</Box>
                  </Box>
                </SimpleGrid>

                <Box mb={4}>
                  <Text fontSize="xs" fontWeight="700" color={mutedColor} textTransform="uppercase" mb={1}>
                    Contact Info
                  </Text>
                  <Text fontSize="sm" color={textColor}>{selectedRes.customerEmail}</Text>
                  <Text fontSize="sm" color={textColor}>{selectedRes.customerPhone}</Text>
                </Box>

                {selectedRes.specialRequests && (
                  <Box p={3} borderRadius="md" bg={innerCardBg} borderLeft="3px solid" borderColor={goldAccent}>
                    <Text fontSize="xs" fontWeight="700" color={goldAccent} mb={1}>
                      Guest Special Requests:
                    </Text>
                    <Text fontSize="xs" color={textColor} fontStyle="italic">
                      "{selectedRes.specialRequests}"
                    </Text>
                  </Box>
                )}
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" onClick={onDetailClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Reject / Cancel Reason Modal */}
        {selectedRes && (
          <Modal isOpen={isRejectOpen} onClose={onRejectClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Decline Reservation &bull; {selectedRes.customerName}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Reason for Rejection or Cancellation</FormLabel>
                  <Textarea
                    placeholder="e.g. Fully booked for this time window, private event scheduled..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    rows={3}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onRejectClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleRejectReservation}
                >
                  Confirm Decline
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </AdminLayout>
  );
};

