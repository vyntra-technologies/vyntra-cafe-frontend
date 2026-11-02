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
  Spinner,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiDollarSign,
  FiShoppingBag,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { customerService } from '../../services/customer.service';
import { ICustomer, IOrder } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Customer Details & Loyalty Adjustment Modals
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isLoyaltyOpen, onOpen: onLoyaltyOpen, onClose: onLoyaltyClose } = useDisclosure();

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // Loyalty Points Adjustment Form State
  const [loyaltyPointsDelta, setLoyaltyPointsDelta] = useState<number>(50);
  const [loyaltyReason, setLoyaltyReason] = useState<string>('Manager goodwill bonus');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getAll({
        search: searchTerm || undefined,
        page,
        limit: 10,
      });
      setCustomers(data.customers);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      toast({
        title: 'Error loading customers',
        description: err?.response?.data?.message || 'Could not fetch customer directory',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenDetails = async (cust: ICustomer) => {
    setSelectedCustomer(cust);
    onDetailOpen();
    try {
      setLoadingOrders(true);
      const history = await customerService.getOrderHistory(cust._id, 1, 5);
      setCustomerOrders(history.orders);
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAdjustLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      setIsSubmitting(true);
      await customerService.adjustLoyaltyPoints(selectedCustomer._id, loyaltyPointsDelta, loyaltyReason);
      toast({
        title: 'Loyalty Balance Updated',
        description: `${loyaltyPointsDelta > 0 ? '+' : ''}${loyaltyPointsDelta} points credited to ${selectedCustomer.name}`,
        status: 'success',
        duration: 3000,
      });
      onLoyaltyClose();
      fetchCustomers();
    } catch (err: any) {
      toast({
        title: 'Adjustment Failed',
        description: err?.response?.data?.message || 'Could not adjust loyalty points',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Customer Directory">
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
              Guest & Customer Records
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Review guest accounts, order history, and loyalty reward tiers.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchCustomers}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync Records
            </Button>
          </HStack>
        </Flex>

        {/* Search Bar */}
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <form onSubmit={handleSearchSubmit}>
            <Flex gap={3}>
              <Input
                placeholder="Search by customer name, phone, or email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                bg={innerCardBg}
                borderColor={borderColor}
                color={textColor}
              />
              <Button
                type="submit"
                size="sm"
                bg={goldAccent}
                color="black"
                leftIcon={<FiSearch />}
                fontWeight="600"
              >
                Search
              </Button>
            </Flex>
          </form>
        </Box>

        {/* Customers Data Table */}
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
                <Th color={mutedColor} borderColor={borderColor}>Customer Name</Th>
                <Th color={mutedColor} borderColor={borderColor}>Contact Phone</Th>
                <Th color={mutedColor} borderColor={borderColor}>Loyalty Points</Th>
                <Th color={mutedColor} borderColor={borderColor}>Total Orders</Th>
                <Th color={mutedColor} borderColor={borderColor}>Total Spend</Th>
                <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12}>
                    <Spinner color={goldAccent} />
                    <Text mt={2} fontSize="sm" color={mutedColor}>Loading customer profiles...</Text>
                  </Td>
                </Tr>
              ) : customers.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color={mutedColor}>
                    No registered customers found.
                  </Td>
                </Tr>
              ) : (
                customers.map((cust) => (
                  <Tr key={cust._id} _hover={{ bg: innerCardBg }}>
                    <Td borderColor={borderColor}>
                      <Text fontWeight="600" color={textColor} fontSize="14px">
                        {cust.name}
                      </Text>
                      {cust.email && (
                        <Text fontSize="11px" color={mutedColor}>
                          {cust.email}
                        </Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" color={textColor}>
                      {cust.phone}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme="yellow" variant="subtle" fontSize="11px">
                        <HStack spacing={1}>
                          <FiAward />
                          <Text>{cust.loyaltyPoints || 0} pts</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" fontWeight="600" color={textColor}>
                      {cust.totalOrders || 0} orders
                    </Td>
                    <Td borderColor={borderColor} fontWeight="700" color={goldAccent}>
                      ₹{(cust.totalSpent || 0).toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor} textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <IconButton
                          aria-label="View Profile & Orders"
                          icon={<FiEye />}
                          size="xs"
                          variant="outline"
                          borderColor={borderColor}
                          color={textColor}
                          _hover={{ borderColor: goldAccent, color: goldAccent }}
                          onClick={() => handleOpenDetails(cust)}
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          color={goldAccent}
                          leftIcon={<FiAward />}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setLoyaltyPointsDelta(50);
                            onLoyaltyOpen();
                          }}
                        >
                          Loyalty
                        </Button>
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

        {/* Customer Details & History Modal */}
        {selectedCustomer && (
          <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Customer Profile &bull; {selectedCustomer.name}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <SimpleGrid columns={3} spacing={3} mb={5} p={3.5} borderRadius="lg" bg={innerCardBg} textAlign="center">
                  <Box>
                    <Text fontSize="10px" color={mutedColor} textTransform="uppercase">Total Spent</Text>
                    <Text fontSize="md" fontWeight="700" color={goldAccent}>
                      ₹{(selectedCustomer.totalSpent || 0).toFixed(2)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="10px" color={mutedColor} textTransform="uppercase">Orders</Text>
                    <Text fontSize="md" fontWeight="700" color={textColor}>
                      {selectedCustomer.totalOrders || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="10px" color={mutedColor} textTransform="uppercase">Loyalty Tier</Text>
                    <Text fontSize="md" fontWeight="700" color="yellow.400">
                      {selectedCustomer.loyaltyPoints || 0} pts
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box mb={4}>
                  <Text fontSize="xs" fontWeight="700" color={textColor} mb={1}>
                    Contact Information
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>Phone: {selectedCustomer.phone}</Text>
                  {selectedCustomer.email && (
                    <Text fontSize="xs" color={mutedColor}>Email: {selectedCustomer.email}</Text>
                  )}
                </Box>

                <Text fontSize="xs" fontWeight="700" color={textColor} mb={2} textTransform="uppercase">
                  Recent Orders
                </Text>

                {loadingOrders ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" color={goldAccent} />
                  </Flex>
                ) : customerOrders.length === 0 ? (
                  <Text fontSize="xs" color={mutedColor} fontStyle="italic" py={2}>
                    No recent order history logged for this customer.
                  </Text>
                ) : (
                  <VStack spacing={2} align="stretch" divider={<Divider borderColor={borderColor} />}>
                    {customerOrders.map((ord) => (
                      <Flex key={ord._id} justify="space-between" fontSize="xs">
                        <Box>
                          <Text fontWeight="600" color={textColor}>
                            #{ord.orderNumber} ({ord.orderType})
                          </Text>
                          <Text color={mutedColor}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>
                        <Box textAlign="right">
                          <Text fontWeight="700" color={goldAccent}>
                            ₹{ord.grandTotal.toFixed(2)}
                          </Text>
                          <Badge fontSize="9px">{ord.fulfillmentStatus}</Badge>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
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

        {/* Loyalty Points Adjustment Modal */}
        {selectedCustomer && (
          <Modal isOpen={isLoyaltyOpen} onClose={onLoyaltyClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent as="form" onSubmit={handleAdjustLoyalty} bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Adjust Loyalty Points &bull; {selectedCustomer.name}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <Text fontSize="xs" color={mutedColor} mb={4}>
                  Current Balance: <Text as="span" fontWeight="bold" color={goldAccent}>{selectedCustomer.loyaltyPoints || 0} pts</Text>
                </Text>

                <FormControl isRequired mb={4}>
                  <FormLabel fontSize="xs" color={mutedColor}>Points Delta (positive to grant, negative to deduct)</FormLabel>
                  <Input
                    type="number"
                    value={loyaltyPointsDelta}
                    onChange={(e) => setLoyaltyPointsDelta(parseInt(e.target.value) || 0)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Reason for Adjustment</FormLabel>
                  <Input
                    placeholder="e.g. VIP promotion, service recovery, anniversary reward"
                    value={loyaltyReason}
                    onChange={(e) => setLoyaltyReason(e.target.value)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onLoyaltyClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg={goldAccent}
                  color="black"
                  size="sm"
                  fontWeight="600"
                  isLoading={isSubmitting}
                >
                  Apply Points
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </AdminLayout>
  );
};

