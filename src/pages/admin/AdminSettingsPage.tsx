import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Input,
  Select,
  Switch,
  SimpleGrid,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import {
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiSliders,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { settingsService } from '../../services/settings.service';
import { ISettings, IOpeningHour, ITaxRule } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [cafeName, setCafeName] = useState<string>('Vyntra Cafe');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [email, setEmail] = useState<string>('hospitality@vyntracafe.com');
  const [street, setStreet] = useState<string>('42 Luxury Boulevard');
  const [city, setCity] = useState<string>('Bengaluru');
  const [state, setState] = useState<string>('Karnataka');
  const [postalCode, setPostalCode] = useState<string>('560001');

  // Business Hours State
  const [openingHours, setOpeningHours] = useState<IOpeningHour[]>([]);

  // Taxes State
  const [taxRules, setTaxRules] = useState<ITaxRule[]>([]);

  // Operational Rules State
  const [acceptingOnlineOrders, setAcceptingOnlineOrders] = useState<boolean>(true);
  const [allowGuestOrders, setAllowGuestOrders] = useState<boolean>(true);
  const [defaultPrepTime, setDefaultPrepTime] = useState<number>(20);
  const [minPartySize, setMinPartySize] = useState<number>(1);
  const [maxPartySize, setMaxPartySize] = useState<number>(12);

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.get();
      if (data) {
        setSettings(data);
        setCafeName(data.cafeName || 'Vyntra Cafe');
        setLogoUrl(data.logoUrl || '');
        setPhone(data.contact?.phone || '+91 98765 43210');
        setEmail(data.contact?.email || 'hospitality@vyntracafe.com');
        setStreet(data.address?.street || '42 Luxury Boulevard');
        setCity(data.address?.city || 'Bengaluru');
        setState(data.address?.state || 'Karnataka');
        setPostalCode(data.address?.postalCode || '560001');
        setOpeningHours(data.openingHours || []);
        setTaxRules(data.taxRules || []);
        if (data.orderSettings) {
          setAcceptingOnlineOrders(data.orderSettings.acceptingOnlineOrders);
          setAllowGuestOrders(data.orderSettings.allowGuestOrders);
          setDefaultPrepTime(data.orderSettings.defaultPrepTimeMinutes || 20);
        }
        if (data.reservationRules) {
          setMinPartySize(data.reservationRules.minPartySize || 1);
          setMaxPartySize(data.reservationRules.maxPartySize || 12);
        }
      }
    } catch {
      // Fallback to defaults
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async () => {
    try {
      setIsSubmitting(true);
      const payload: Partial<ISettings> = {
        cafeName,
        logoUrl,
        contact: {
          phone,
          email,
          website: 'https://vyntracafe.com',
        },
        address: {
          street,
          city,
          state,
          postalCode,
          country: 'India',
        },
        openingHours,
        taxRules,
        orderSettings: {
          acceptingOnlineOrders,
          allowGuestOrders,
          defaultPrepTimeMinutes: defaultPrepTime,
        },
        reservationRules: {
          slotDurationMinutes: settings?.reservationRules?.slotDurationMinutes || 90,
          maxAdvanceDays: settings?.reservationRules?.maxAdvanceDays || 30,
          autoCancelGraceMinutes: settings?.reservationRules?.autoCancelGraceMinutes || 15,
          minPartySize,
          maxPartySize,
        },
      };

      const updated = await settingsService.update(payload);
      setSettings(updated);
      toast({
        title: 'Settings Saved',
        description: 'Restaurant configuration updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.response?.data?.message || 'Error updating settings',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHourChange = (index: number, field: keyof IOpeningHour, value: any) => {
    const updated = [...openingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOpeningHours(updated);
  };

  const handleTaxToggle = (index: number) => {
    const updated = [...taxRules];
    updated[index] = { ...updated[index], isEnabled: !updated[index].isEnabled };
    setTaxRules(updated);
  };

  return (
    <AdminLayout pageTitle="Restaurant Settings">
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
              Restaurant Configuration
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Brand identity, business hours, taxes, order fulfillment, and table reservation limits.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchSettings}
            >
              Reset
            </Button>
            <Button
              leftIcon={<FiSave />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              isLoading={isSubmitting}
              onClick={handleSaveAll}
            >
              Save Configuration
            </Button>
          </HStack>
        </Flex>

        {/* Settings Navigation Tabs */}
        <Tabs variant="line" colorScheme="yellow">
          <TabList borderColor={borderColor} mb={6}>
            <Tab fontWeight="600" fontSize="sm" color={textColor} _selected={{ color: goldAccent, borderColor: goldAccent }}>
              General & Location
            </Tab>
            <Tab fontWeight="600" fontSize="sm" color={textColor} _selected={{ color: goldAccent, borderColor: goldAccent }}>
              Business Hours
            </Tab>
            <Tab fontWeight="600" fontSize="sm" color={textColor} _selected={{ color: goldAccent, borderColor: goldAccent }}>
              Taxes & Compliance
            </Tab>
            <Tab fontWeight="600" fontSize="sm" color={textColor} _selected={{ color: goldAccent, borderColor: goldAccent }}>
              Fulfillment Rules
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Profile & Contact */}
            <TabPanel p={0}>
              <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
                  Brand Identity & Contact
                </Heading>
                <VStack spacing={4} align="stretch" maxW="700px">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Restaurant Brand Name</FormLabel>
                      <Input
                        value={cafeName}
                        onChange={(e) => setCafeName(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Brand Logo URL</FormLabel>
                      <Input
                        value={logoUrl}
                        placeholder="https://..."
                        onChange={(e) => setLogoUrl(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Primary Contact Phone</FormLabel>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Hospitality Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Divider borderColor={borderColor} my={2} />

                  <Heading fontSize="sm" color={textColor} fontWeight="700">
                    Physical Address
                  </Heading>

                  <FormControl>
                    <FormLabel fontSize="xs" color={mutedColor}>Street Address</FormLabel>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      bg={innerCardBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>City</FormLabel>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>State / Province</FormLabel>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Postal Code</FormLabel>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>
            </TabPanel>

            {/* Tab 2: Business Hours */}
            <TabPanel p={0}>
              <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
                  Weekly Operating Schedule
                </Heading>
                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th color={mutedColor} borderColor={borderColor}>Day</Th>
                        <Th color={mutedColor} borderColor={borderColor}>Opening Time</Th>
                        <Th color={mutedColor} borderColor={borderColor}>Closing Time</Th>
                        <Th color={mutedColor} borderColor={borderColor} textAlign="right">Closed Today</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {openingHours.map((h, idx) => (
                        <Tr key={h.day} _hover={{ bg: innerCardBg }}>
                          <Td fontWeight="600" color={textColor} borderColor={borderColor} py={3}>
                            {h.day}
                          </Td>
                          <Td borderColor={borderColor}>
                            <Input
                              type="time"
                              size="xs"
                              w="120px"
                              value={h.openTime}
                              isDisabled={h.isClosed}
                              onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                              bg={innerCardBg}
                              borderColor={borderColor}
                            />
                          </Td>
                          <Td borderColor={borderColor}>
                            <Input
                              type="time"
                              size="xs"
                              w="120px"
                              value={h.closeTime}
                              isDisabled={h.isClosed}
                              onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                              bg={innerCardBg}
                              borderColor={borderColor}
                            />
                          </Td>
                          <Td borderColor={borderColor} textAlign="right">
                            <Switch
                              colorScheme="yellow"
                              isChecked={h.isClosed}
                              onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            {/* Tab 3: Taxes & Rules */}
            <TabPanel p={0}>
              <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
                  Tax Rates & Statutory Breakup
                </Heading>
                <VStack spacing={4} align="stretch" maxW="600px">
                  {taxRules.map((tax, idx) => (
                    <Flex
                      key={idx}
                      p={3.5}
                      borderRadius="lg"
                      bg={innerCardBg}
                      justify="space-between"
                      align="center"
                    >
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm">
                          {tax.name}
                        </Text>
                        <Text fontSize="12px" color={goldAccent}>
                          {tax.percentage}% of billable subtotal
                        </Text>
                      </Box>
                      <Switch
                        colorScheme="yellow"
                        isChecked={tax.isEnabled}
                        onChange={() => handleTaxToggle(idx)}
                      />
                    </Flex>
                  ))}
                  {taxRules.length === 0 && (
                    <Text fontSize="xs" color={mutedColor}>No tax rules defined.</Text>
                  )}
                </VStack>
              </Box>
            </TabPanel>

            {/* Tab 4: Operational & Fulfillment Rules */}
            <TabPanel p={0}>
              <Box p={6} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                <Heading fontSize="md" color={textColor} mb={4} fontWeight="700">
                  Kitchen Prep & Seating Thresholds
                </Heading>
                <VStack spacing={5} align="stretch" maxW="600px">
                  <Flex justify="space-between" align="center" p={3.5} borderRadius="lg" bg={innerCardBg}>
                    <Box>
                      <Text fontWeight="600" color={textColor} fontSize="sm">
                        Accepting Online Ordering
                      </Text>
                      <Text fontSize="11px" color={mutedColor}>
                        Allow customers to submit dine-in and takeaway tickets
                      </Text>
                    </Box>
                    <Switch
                      colorScheme="yellow"
                      isChecked={acceptingOnlineOrders}
                      onChange={(e) => setAcceptingOnlineOrders(e.target.checked)}
                    />
                  </Flex>

                  <Flex justify="space-between" align="center" p={3.5} borderRadius="lg" bg={innerCardBg}>
                    <Box>
                      <Text fontWeight="600" color={textColor} fontSize="sm">
                        Guest Checkout
                      </Text>
                      <Text fontSize="11px" color={mutedColor}>
                        Allow ordering without mandatory user login
                      </Text>
                    </Box>
                    <Switch
                      colorScheme="yellow"
                      isChecked={allowGuestOrders}
                      onChange={(e) => setAllowGuestOrders(e.target.checked)}
                    />
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Default Prep Time (Mins)</FormLabel>
                      <Input
                        type="number"
                        value={defaultPrepTime}
                        onChange={(e) => setDefaultPrepTime(parseInt(e.target.value) || 15)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Min Party Size</FormLabel>
                      <Input
                        type="number"
                        value={minPartySize}
                        onChange={(e) => setMinPartySize(parseInt(e.target.value) || 1)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color={mutedColor}>Max Party Size</FormLabel>
                      <Input
                        type="number"
                        value={maxPartySize}
                        onChange={(e) => setMaxPartySize(parseInt(e.target.value) || 12)}
                        bg={innerCardBg}
                        borderColor={borderColor}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </AdminLayout>
  );
};

