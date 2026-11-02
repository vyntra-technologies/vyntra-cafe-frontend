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
  FormControl,
  FormLabel,
  Switch,
  useDisclosure,
  useColorModeValue,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tooltip,
  CheckboxGroup,
  Checkbox,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiDollarSign,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  CreateSupplierPayload,
} from '../../../services/inventory.service';
import { ISupplier, IIngredient } from '../../../types';

export const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Modal (Add / Edit)
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);
  const [formData, setFormData] = useState<CreateSupplierPayload>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    ingredientsSupplied: [],
    paymentTerms: 'Net 30',
    isActive: true,
  });

  // Outstanding Balance Modal
  const {
    isOpen: isBalanceOpen,
    onOpen: onBalanceOpen,
    onClose: onBalanceClose,
  } = useDisclosure();
  const [selectedSupplierForBalance, setSelectedSupplierForBalance] = useState<ISupplier | null>(null);
  const [balanceData, setBalanceData] = useState<{ totalPurchases: number; totalPaid: number; outstandingBalance: number } | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  // Delete Alert
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingSupplier, setDeletingSupplier] = useState<ISupplier | null>(null);
  const cancelDeleteRef = React.useRef<any>(null);

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalStatNeutralBg = useColorModeValue('gray.50', 'gray.700');
  const modalStatSuccessBg = useColorModeValue('green.50', 'green.900');
  const modalStatDangerBg = useColorModeValue('red.50', 'red.900');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [suppliersData, ingredientsData] = await Promise.all([
        inventoryService.getAllSuppliers(true),
        inventoryService.getAllIngredients(true).catch(() => []),
      ]);
      setSuppliers(suppliersData);
      setIngredients(ingredientsData);
    } catch (err: any) {
      toast({
        title: 'Error loading suppliers',
        description: err.message || 'Could not fetch suppliers list',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      ingredientsSupplied: [],
      paymentTerms: 'Net 30',
      isActive: true,
    });
    onFormOpen();
  };

  const handleOpenEdit = (sup: ISupplier) => {
    setEditingSupplier(sup);
    const existingIngredientIds = (sup.ingredientsSupplied || []).map((item) =>
      typeof item === 'object' && item !== null ? item._id : item
    );

    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      email: sup.email,
      phone: sup.phone,
      address: sup.address || '',
      ingredientsSupplied: existingIngredientIds,
      paymentTerms: sup.paymentTerms || 'Net 30',
      isActive: sup.isActive,
    });
    onFormOpen();
  };

  const handleOpenBalance = async (sup: ISupplier) => {
    setSelectedSupplierForBalance(sup);
    setBalanceData(null);
    setLoadingBalance(true);
    onBalanceOpen();
    try {
      const data = await inventoryService.getSupplierOutstanding(sup._id);
      setBalanceData(data);
    } catch (err: any) {
      toast({
        title: 'Could not fetch outstanding balance',
        status: 'error',
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleOpenDelete = (sup: ISupplier) => {
    setDeletingSupplier(sup);
    onDeleteOpen();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Supplier name is required', status: 'warning' });
      return;
    }
    if (!formData.email.trim() || !formData.phone.trim()) {
      toast({ title: 'Email and phone are required', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSupplier) {
        await inventoryService.updateSupplier(editingSupplier._id, formData);
        toast({ title: 'Supplier updated successfully', status: 'success' });
      } else {
        await inventoryService.createSupplier(formData);
        toast({ title: 'Supplier created successfully', status: 'success' });
      }
      onFormClose();
      fetchData();
    } catch (err: any) {
      toast({
        title: editingSupplier ? 'Update failed' : 'Creation failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      setIsSubmitting(true);
      await inventoryService.deleteSupplier(deletingSupplier._id);
      toast({ title: 'Supplier deleted successfully', status: 'success' });
      onDeleteClose();
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    const q = searchQuery.toLowerCase();
    return (
      sup.name.toLowerCase().includes(q) ||
      (sup.contactPerson && sup.contactPerson.toLowerCase().includes(q)) ||
      sup.email.toLowerCase().includes(q) ||
      sup.phone.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout pageTitle="Supplier Management">
      <Box p={{ base: 4, md: 6 }}>
        <InventorySubNav />

        {/* Page Header */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading size="lg" fontWeight="700">
              Supplier Directory & Procurement
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Manage cafe vendor profiles, contact details, payment terms, and supplied ingredient catalogs.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchData}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              size="sm"
              onClick={handleOpenAdd}
            >
              Add Supplier
            </Button>
          </HStack>
        </Flex>

        {/* Search Bar */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow="sm"
        >
          <Flex position="relative" maxW={{ base: 'full', md: '400px' }}>
            <Input
              placeholder="Search by supplier name, contact, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl={10}
              size="sm"
              borderRadius="lg"
            />
            <Box position="absolute" left={3} top={2.5} color={subtleText}>
              <FiSearch />
            </Box>
          </Flex>
        </Box>

        {/* Suppliers Table */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          overflow="hidden"
        >
          {isLoading ? (
            <Flex justify="center" align="center" py={12}>
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : filteredSuppliers.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiTruck size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No suppliers registered
              </Text>
              <Text fontSize="sm" color={subtleText}>
                Add your coffee beans, dairy, and food ingredients vendors here.
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Supplier Name</Th>
                    <Th>Contact Person</Th>
                    <Th>Contact Details</Th>
                    <Th>Payment Terms</Th>
                    <Th>Ingredients Supplied</Th>
                    <Th>Status</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSuppliers.map((sup) => {
                    const suppliedList = sup.ingredientsSupplied || [];

                    return (
                      <Tr key={sup._id} _hover={{ bg: rowHoverBg }}>
                        <Td fontWeight="600">
                          <Text>{sup.name}</Text>
                          {sup.address && (
                            <Text fontSize="2xs" color={subtleText} maxW="180px" isTruncated>
                              {sup.address}
                            </Text>
                          )}
                        </Td>
                        <Td fontSize="sm">
                          {sup.contactPerson || <Text as="span" color={subtleText}>—</Text>}
                        </Td>
                        <Td fontSize="xs">
                          <VStack align="flex-start" spacing={0.5}>
                            <HStack spacing={1}>
                              <FiMail size={12} />
                              <Text>{sup.email}</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <FiPhone size={12} />
                              <Text>{sup.phone}</Text>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge variant="outline" colorScheme="blue" fontSize="xs">
                            {sup.paymentTerms || 'Net 30'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1} wrap="wrap">
                            {suppliedList.length === 0 ? (
                              <Text fontSize="xs" color={subtleText}>None assigned</Text>
                            ) : (
                              suppliedList.slice(0, 3).map((item, idx) => {
                                const name = typeof item === 'object' && item !== null ? item.name : 'Ingredient';
                                return (
                                  <Badge key={idx} colorScheme="purple" variant="subtle" fontSize="2xs">
                                    {name}
                                  </Badge>
                                );
                              })
                            )}
                            {suppliedList.length > 3 && (
                              <Badge colorScheme="gray" fontSize="2xs">
                                +{suppliedList.length - 3} more
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={sup.isActive ? 'green' : 'gray'} variant="subtle" fontSize="xs">
                            {sup.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="View Outstanding Balance" hasArrow>
                              <IconButton
                                aria-label="Balance"
                                icon={<FiDollarSign />}
                                size="xs"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleOpenBalance(sup)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Supplier" hasArrow>
                              <IconButton
                                aria-label="Edit"
                                icon={<FiEdit2 />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleOpenEdit(sup)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Supplier" hasArrow>
                              <IconButton
                                aria-label="Delete"
                                icon={<FiTrash2 />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleOpenDelete(sup)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Add / Edit Supplier Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleSubmitForm}>
            <ModalHeader>
              {editingSupplier ? 'Edit Supplier' : 'Register New Supplier'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Supplier / Vendor Name</FormLabel>
                  <Input
                    placeholder="e.g. Blue Mountain Roasters, Mother Dairy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <Flex w="full" gap={4}>
                  <FormControl flex="1">
                    <FormLabel fontSize="sm">Contact Person</FormLabel>
                    <Input
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Payment Terms</FormLabel>
                    <Select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    >
                      <option value="Immediate / COD">Immediate / COD</option>
                      <option value="Net 7">Net 7 Days</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </Select>
                  </FormControl>
                </Flex>

                <Flex w="full" gap={4}>
                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Email Address</FormLabel>
                    <Input
                      type="email"
                      placeholder="vendor@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Phone Number</FormLabel>
                    <Input
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormControl>
                </Flex>

                <FormControl>
                  <FormLabel fontSize="sm">Warehouse / Business Address</FormLabel>
                  <Input
                    placeholder="Street, City, Pin Code"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Supplied Ingredients</FormLabel>
                  <Box
                    maxH="140px"
                    overflowY="auto"
                    p={2}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <CheckboxGroup
                      value={formData.ingredientsSupplied}
                      onChange={(vals) => setFormData({ ...formData, ingredientsSupplied: vals as string[] })}
                    >
                      <SimpleGrid columns={2} spacing={2}>
                        {ingredients.map((ing) => (
                          <Checkbox key={ing._id} value={ing._id} size="sm">
                            {ing.name} ({ing.unit})
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                  </Box>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="supplierActive" mb="0" fontSize="sm">
                    Active Supplier
                  </FormLabel>
                  <Switch
                    id="supplierActive"
                    isChecked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    colorScheme="brand"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onFormClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                {editingSupplier ? 'Save Changes' : 'Create Supplier'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Outstanding Balance Modal */}
        <Modal isOpen={isBalanceOpen} onClose={onBalanceClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Financial Summary: {selectedSupplierForBalance?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {loadingBalance ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={3} spacing={3}>
                    <Box p={3} bg={modalStatNeutralBg} borderRadius="lg">
                      <Stat>
                        <StatLabel fontSize="2xs" color={subtleText}>Total Purchases</StatLabel>
                        <StatNumber fontSize="sm" fontWeight="bold">
                          ₹{balanceData?.totalPurchases?.toLocaleString('en-IN') || 0}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box p={3} bg={modalStatSuccessBg} borderRadius="lg">
                      <Stat>
                        <StatLabel fontSize="2xs" color="green.600">Total Paid</StatLabel>
                        <StatNumber fontSize="sm" fontWeight="bold" color="green.600">
                          ₹{balanceData?.totalPaid?.toLocaleString('en-IN') || 0}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box p={3} bg={modalStatDangerBg} borderRadius="lg">
                      <Stat>
                        <StatLabel fontSize="2xs" color="red.600">Outstanding</StatLabel>
                        <StatNumber fontSize="sm" fontWeight="bold" color="red.600">
                          ₹{balanceData?.outstandingBalance?.toLocaleString('en-IN') || 0}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </SimpleGrid>

                  <Text fontSize="xs" color={subtleText}>
                    Payment Terms: <strong>{selectedSupplierForBalance?.paymentTerms || 'Net 30'}</strong>
                  </Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="brand" size="sm" onClick={onBalanceClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Supplier Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelDeleteRef}
          onClose={onDeleteClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Supplier
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete <strong>{deletingSupplier?.name}</strong>?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isSubmitting}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AdminLayout>
  );
};

