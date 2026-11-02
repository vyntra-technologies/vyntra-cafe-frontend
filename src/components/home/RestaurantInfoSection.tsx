import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FiClock, FiMapPin, FiPhone, FiMail, FiCalendar, FiWifi, FiCheck } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { settingsService } from '../../services/settings.service';
import { ISettings } from '../../types';

export const RestaurantInfoSection: React.FC = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);

  const cardBg = useColorModeValue('#FFFFFF', '#181A1D');
  const borderColor = useColorModeValue('#E8DED1', '#2B2E33');
  const textColor = useColorModeValue('#716B65', '#B5B7BC');
  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  useEffect(() => {
    settingsService
      .get()
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const address = settings?.address;
  const addressText = address
    ? `${address.street || '124 Gourmet Boulevard'}, ${address.city || 'Metropolis'}, ${address.state || 'NY'} ${address.postalCode || '10001'}`
    : '450 Lexington Avenue, New York, NY 10017';

  const phone = settings?.contact?.phone || '+1-555-0199';
  const email = settings?.contact?.email || 'contact@vyntracafe.com';

  const hours = settings?.openingHours || [
    { day: 'Monday', openTime: '07:30', closeTime: '22:00', isClosed: false },
    { day: 'Tuesday', openTime: '07:30', closeTime: '22:00', isClosed: false },
    { day: 'Wednesday', openTime: '07:30', closeTime: '22:00', isClosed: false },
    { day: 'Thursday', openTime: '07:30', closeTime: '22:00', isClosed: false },
    { day: 'Friday', openTime: '07:30', closeTime: '23:00', isClosed: false },
    { day: 'Saturday', openTime: '08:00', closeTime: '23:00', isClosed: false },
    { day: 'Sunday', openTime: '08:00', closeTime: '21:00', isClosed: false },
  ];

  return (
    <Box py={{ base: 12, md: 20 }}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
          {/* Left Column: Hours & Amenity cards */}
          <Box bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <VStack align="flex-start" spacing={5}>
              <HStack color={accentColor}>
                <FiClock />
                <Text fontSize="xs" fontWeight="700" letterSpacing="2px" textTransform="uppercase">
                  VISIT & SEATING
                </Text>
              </HStack>
              <Heading fontFamily="heading" size="md" fontWeight="800" color={headingColor}>
                Opening Hours & Table Availability
              </Heading>
              <Text fontSize="sm" color={textColor}>
                Our kitchen & espresso bar welcome you 7 days a week. Walk-ins are always welcomed, though advance table reservations are recommended during peak evening hours.
              </Text>

              <Divider borderColor={borderColor} />

              <VStack w="100%" spacing={2} align="stretch" fontSize="sm">
                {hours.map((h) => (
                  <HStack key={h.day} justify="space-between" py={1}>
                    <Text fontWeight="600" color={headingColor}>
                      {h.day}
                    </Text>
                    <HStack spacing={2}>
                      {h.isClosed ? (
                        <Badge colorScheme="red">Closed</Badge>
                      ) : (
                        <Text color={textColor}>
                          {h.openTime} – {h.closeTime}
                        </Text>
                      )}
                    </HStack>
                  </HStack>
                ))}
              </VStack>

              <Divider borderColor={borderColor} />

              {/* Amenities */}
              <SimpleGrid columns={2} spacing={3} w="100%" pt={2}>
                <HStack fontSize="xs" color={textColor}>
                  <Box color="green.400"><FiCheck /></Box>
                  <Text>High-Speed Fiber WiFi</Text>
                </HStack>
                <HStack fontSize="xs" color={textColor}>
                  <Box color="green.400"><FiCheck /></Box>
                  <Text>Outdoor Heated Patio</Text>
                </HStack>
                <HStack fontSize="xs" color={textColor}>
                  <Box color="green.400"><FiCheck /></Box>
                  <Text>Pet-Friendly Terrace</Text>
                </HStack>
                <HStack fontSize="xs" color={textColor}>
                  <Box color="green.400"><FiCheck /></Box>
                  <Text>Accessible Seating</Text>
                </HStack>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Right Column: Contact & Location */}
          <VStack align="flex-start" spacing={6}>
            <Box>
              <Text fontSize="xs" fontWeight="700" color={accentColor} letterSpacing="2px" textTransform="uppercase">
                LOCATION & RESERVATIONS
              </Text>
              <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor} mt={1}>
                Join Us In Metropolis
              </Heading>
              <Text fontSize="sm" color={textColor} mt={3} lineHeight="tall">
                Nestled in the cultural heart of the culinary district, Vyntra Cafe provides a haven of serene design and rich aroma. Experience private dining or join our lively barista bar.
              </Text>
            </Box>

            <VStack align="stretch" spacing={4} w="100%">
              <HStack
                p={4}
                bg={cardBg}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                spacing={4}
              >
                <Box p={3} borderRadius="xl" bg={useColorModeValue('orange.50', 'whiteAlpha.100')} color={accentColor} fontSize="xl">
                  <FiMapPin />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="sm" color={headingColor}>
                    Physical Address
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {addressText}
                  </Text>
                </Box>
              </HStack>

              <HStack
                p={4}
                bg={cardBg}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                spacing={4}
              >
                <Box p={3} borderRadius="xl" bg={useColorModeValue('orange.50', 'whiteAlpha.100')} color={accentColor} fontSize="xl">
                  <FiPhone />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="sm" color={headingColor}>
                    Direct Inquiries & Counter
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {phone}
                  </Text>
                </Box>
              </HStack>

              <HStack
                p={4}
                bg={cardBg}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                spacing={4}
              >
                <Box p={3} borderRadius="xl" bg={useColorModeValue('orange.50', 'whiteAlpha.100')} color={accentColor} fontSize="xl">
                  <FiMail />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="sm" color={headingColor}>
                    Customer Support & Events
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {email}
                  </Text>
                </Box>
              </HStack>
            </VStack>

            <HStack spacing={4} pt={2}>
              <Button
                as={RouterLink}
                to="/reservations"
                colorScheme="brand"
                size="lg"
                borderRadius="2xl"
                leftIcon={<FiCalendar />}
                px={8}
              >
                Reserve Your Table
              </Button>
              <Button
                as={RouterLink}
                to="/contact"
                variant="outline"
                size="lg"
                borderRadius="2xl"
              >
                Get Directions
              </Button>
            </HStack>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

