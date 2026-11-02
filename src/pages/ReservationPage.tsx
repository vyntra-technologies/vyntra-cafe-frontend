import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Input,
  Select,
  Textarea,
  Divider,
  Flex,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { reservationService, CreateReservationPayload } from '../services/reservation.service';
import { tableService } from '../services/table.service';
import { useAuth } from '../context/AuthContext';
import { ITable } from '../types';

const TIME_SLOTS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export const ReservationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [guestCount, setGuestCount] = useState<number>(2);

  // Default to today formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [reservationDate, setReservationDate] = useState<string>(todayStr);
  const [reservationTime, setReservationTime] = useState<string>('19:00');
  const [tableId, setTableId] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [tables, setTables] = useState<ITable[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  useEffect(() => {
    tableService
      .getAll()
      .then((data) => setTables(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: 'Missing Contact Details',
        description: 'Please provide full name, email, and phone number for reservation confirmation.',
        status: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateReservationPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        guestCount: Number(guestCount),
        reservationDate,
        reservationTime,
        tableId: tableId || undefined,
        specialRequests: specialRequests.trim() || undefined,
      };

      const result = await reservationService.create(payload);

      toast({
        title: 'Table Reserved Successfully! ✨',
        description: `Reservation confirmed for ${result.guestCount} guests on ${result.reservationDate} at ${result.reservationTime}.`,
        status: 'success',
        duration: 4000,
      });

      navigate('/reservation-history');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not create reservation. Please verify details.';
      toast({
        title: 'Reservation Failed',
        description: message,
        status: 'error',
        duration: 4500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxW="4xl">
      <VStack spacing={3} textAlign="center" mb={10}>
        <Badge
          bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
          color={accentColor}
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="700"
          letterSpacing="1px"
        >
          RESERVE YOUR TABLE
        </Badge>
        <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          Book an Unforgettable Dining Experience
        </Heading>
        <Text fontSize="sm" color={textColor} maxW="xl">
          Reserve your table in advance for intimate dates, business rendezvous, or joyous culinary celebrations.
        </Text>
      </VStack>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={cardBg}
        p={{ base: 6, md: 10 }}
        borderRadius="3xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
      >
        <VStack spacing={8} align="stretch">
          {/* Section 1: Date, Time & Guests */}
          <Box>
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              1. Date, Time & Party Size
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Reservation Date *
                </Text>
                <Input
                  type="date"
                  min={todayStr}
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Reservation Time *
                </Text>
                <Select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  borderRadius="xl"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Party Size (Guests) *
                </Text>
                <Select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  borderRadius="xl"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </Select>
              </Box>
            </SimpleGrid>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Section 2: Preferred Table */}
          <Box>
            <Text fontWeight="800" fontSize="md" mb={2} color={headingColor}>
              2. Preferred Table / Section (Optional)
            </Text>
            <Text fontSize="xs" color={textColor} mb={4}>
              Select a specific table or leave unassigned to allow our floor manager to pick the optimal table for your party.
            </Text>

            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
              <Box
                p={3}
                borderRadius="xl"
                borderWidth="2px"
                borderColor={tableId === '' ? accentColor : borderColor}
                bg={tableId === '' ? (useColorModeValue('rgba(164, 122, 60, 0.1)', 'rgba(212, 175, 114, 0.15)')) : cardBg}
                cursor="pointer"
                onClick={() => setTableId('')}
                textAlign="center"
              >
                <Text fontWeight="700" fontSize="sm" color={headingColor}>
                  Any Available
                </Text>
                <Text fontSize="10px" color={textColor}>
                  Auto-assigned
                </Text>
              </Box>

              {tables.map((t) => {
                const isSelected = tableId === t._id;
                return (
                  <Box
                    key={t._id}
                    p={3}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor={isSelected ? accentColor : borderColor}
                    bg={isSelected ? (useColorModeValue('rgba(164, 122, 60, 0.1)', 'rgba(212, 175, 114, 0.15)')) : cardBg}
                    cursor="pointer"
                    onClick={() => setTableId(t._id)}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="700" fontSize="sm" color={headingColor}>
                        {t.tableNumber}
                      </Text>
                      <Badge fontSize="9px">{t.capacity}p</Badge>
                    </Flex>
                    <Text fontSize="10px" color={textColor} noOfLines={1}>
                      {t.section}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Section 3: Contact & Special Requests */}
          <Box>
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              3. Guest Contact & Special Requests
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Full Name *
                </Text>
                <Input
                  placeholder="e.g. Sophia Lin"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Email Address *
                </Text>
                <Input
                  type="email"
                  placeholder="sophia@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Phone Number *
                </Text>
                <Input
                  placeholder="+1-555-0199"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                Special Notes or Occasion
              </Text>
              <Textarea
                placeholder="e.g. Birthday anniversary, high chair needed, quiet booth..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                borderRadius="xl"
                rows={2}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            size="lg"
            h="14"
            bgGradient={useColorModeValue(
              'linear(to-r, #A87916, #D4AF37)',
              'linear(to-r, #D4AF37, #F5D76E)'
            )}
            color={btnTextColor}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
              opacity: 0.95,
            }}
            _active={{ transform: 'translateY(0)' }}
            borderRadius="2xl"
            isLoading={isSubmitting}
            loadingText="Reserving Table..."
            fontWeight="800"
            fontSize="md"
          >
            Confirm Table Reservation
          </Button>

          <Text fontSize="xs" color={textColor} textAlign="center">
            You will receive a real-time reservation confirmation. You can review or cancel your booking at any time under My Reservations.
          </Text>
        </VStack>
      </Box>
    </PageContainer>
  );
};
