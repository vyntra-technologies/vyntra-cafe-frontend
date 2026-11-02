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
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiActivity,
  FiAlertTriangle,
  FiBox,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  CreateIngredientPayload,
  StockAdjustmentPayload,
} from '../../../services/inventory.service';
import { IIngredient, StockMovementType } from '../../../types';

export const AdminIngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('active');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Modal (Add / Edit)
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [editingIngredient, setEditingIngredient] = useState<IIngredient | null>(null);
  const [formData, setFormData] = useState<CreateIngredientPayload>({
    name: '',
    unit: 'kg',
    currentStock: 0,
    reorderLevel: 5,
    costPerUnit: 0,
    isActive: true,
  });

  // Stock Adjustment Modal
  const { isOpen: isAdjustOpen, onOpen: onAdjustOpen, onClose: onAdjustClose } = useDisclosure();
  const [adjustingIngredient, setAdjustingIngredient] = useState<IIngredient | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustType, setAdjustType] = useState<StockMovementType>('manual_adjustment');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Delete Alert Dialog
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingIngredient, setDeletingIngredient] = useState<IIngredient | null>(null);
  const cancelDeleteRef = React.useRef<any>(null);

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalInfoBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getAllIngredients(true);
      setIngredients(data);
    } catch (err: any) {
      toast({
        title: 'Error loading ingredients',
        description: err.message || 'Could not fetch ingredients',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setFormData({
      name: '',
      unit: 'kg',
      currentStock: 0,
      reorderLevel: 5,
      costPerUnit: 0,
      isActive: true,
    });
    onFormOpen();
  };

  const handleOpenEdit = (ingredient: IIngredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock,
      reorderLevel: ingredient.reorderLevel,
      costPerUnit: ingredient.costPerUnit,
      isActive: ingredient.isActive,
    });
    onFormOpen();
  };

  const handleOpenAdjust = (ingredient: IIngredient) => {
    setAdjustingIngredient(ingredient);
    setAdjustQuantity('');
    setAdjustType('manual_adjustment');
    setAdjustReason('');
    onAdjustOpen();
  };

  const handleOpenDelete = (ingredient: IIngredient) => {
    setDeletingIngredient(ingredient);
    onDeleteOpen();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Ingredient name is required', status: 'warning' });
      return;
    }
    if (!formData.unit.trim()) {
      toast({ title: 'Unit is required', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingIngredient) {
        await inventoryService.updateIngredient(editingIngredient._id, formData);
        toast({ title: 'Ingredient updated successfully', status: 'success' });
      } else {
        await inventoryService.createIngredient(formData);
        toast({ title: 'Ingredient created successfully', status: 'success' });
      }
      onFormClose();
      fetchIngredients();
    } catch (err: any) {
      toast({
        title: editingIngredient ? 'Update failed' : 'Creation failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingIngredient) return;

    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty === 0) {
      toast({ title: 'Quantity change cannot be 0', status: 'warning' });
      return;
    }
    if (!adjustReason.trim()) {
      toast({ title: 'Reason is required', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: StockAdjustmentPayload = {
        quantityChange: qty,
        type: adjustType,
        reason: adjustReason.trim(),
      };
      await inventoryService.adjustStock(adjustingIngredient._id, payload);
      toast({ title: 'Stock adjusted successfully', status: 'success' });
      onAdjustClose();
      fetchIngredients();
    } catch (err: any) {
      toast({
        title: 'Adjustment failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingIngredient) return;
    try {
      setIsSubmitting(true);
      await inventoryService.deleteIngredient(deletingIngredient._id);
      toast({ title: 'Ingredient deleted', status: 'success' });
      onDeleteClose();
      fetchIngredients();
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

  // Filtering
  const uniqueUnits = Array.from(new Set(ingredients.map((i) => i.unit))).filter(Boolean);

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterActive === 'all'
        ? true
        : filterActive === 'active'
        ? ing.isActive
        : !ing.isActive;

    const matchesUnit = filterUnit === 'all' ? true : ing.unit === filterUnit;

    return matchesSearch && matchesStatus && matchesUnit;
  });

  const lowStockCount = ingredients.filter(
    (i) => i.isActive && i.currentStock <= i.reorderLevel
  ).length;

  return (
    <AdminLayout pageTitle="Ingredient Management">
      <Box p={{ base: 4, md: 6 }}>
        <InventorySubNav lowStockCount={lowStockCount} />

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
              Ingredient Management
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Maintain cafe inventory raw materials, measure units, reorder levels and unit costs.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchIngredients}
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
              Add Ingredient
            </Button>
          </HStack>
        </Flex>

        {/* Filter & Search Bar */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow="sm"
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
            <Flex flex="1" w="full" position="relative">
              <Input
                placeholder="Search ingredients by name or unit..."
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

            <HStack w={{ base: 'full', md: 'auto' }} spacing={3}>
              <Select
                size="sm"
                borderRadius="lg"
                w={{ base: 'full', md: '140px' }}
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="active">Active Only</option>
                <option value="all">All Statuses</option>
                <option value="inactive">Inactive Only</option>
              </Select>

              <Select
                size="sm"
                borderRadius="lg"
                w={{ base: 'full', md: '140px' }}
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
              >
                <option value="all">All Units</option>
                {uniqueUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </Box>

        {/* Ingredients Table */}
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
          ) : filteredIngredients.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiBox size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No ingredients found
              </Text>
              <Text fontSize="sm" color={subtleText}>
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first ingredient'}
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Ingredient Name</Th>
                    <Th>Unit</Th>
                    <Th isNumeric>Current Stock</Th>
                    <Th isNumeric>Reorder Level</Th>
                    <Th isNumeric>Cost / Unit</Th>
                    <Th isNumeric>Total Valuation</Th>
                    <Th>Status</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredIngredients.map((ing) => {
                    const isOutOfStock = ing.currentStock <= 0;
                    const isLowStock = ing.currentStock <= ing.reorderLevel;
                    const valuation = ing.currentStock * ing.costPerUnit;

                    return (
                      <Tr key={ing._id} _hover={{ bg: rowHoverBg }}>
                        <Td fontWeight="600">
                          <HStack spacing={2}>
                            <Text>{ing.name}</Text>
                            {isOutOfStock ? (
                              <Badge colorScheme="red" variant="solid" fontSize="2xs">
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge colorScheme="orange" variant="subtle" fontSize="2xs">
                                Low Stock
                              </Badge>
                            ) : null}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="gray" variant="outline" fontSize="xs">
                            {ing.unit}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="bold" color={isOutOfStock ? 'red.500' : isLowStock ? 'orange.500' : 'inherit'}>
                          {ing.currentStock} {ing.unit}
                        </Td>
                        <Td isNumeric color={subtleText}>
                          {ing.reorderLevel} {ing.unit}
                        </Td>
                        <Td isNumeric>₹{ing.costPerUnit.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="600" color="green.600">
                          ₹{valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Td>
                        <Td>
                          <Badge colorScheme={ing.isActive ? 'green' : 'gray'} variant="subtle" fontSize="xs">
                            {ing.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Adjust Stock Quantity" hasArrow>
                              <IconButton
                                aria-label="Adjust Stock"
                                icon={<FiActivity />}
                                size="xs"
                                colorScheme="brand"
                                variant="ghost"
                                onClick={() => handleOpenAdjust(ing)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Details" hasArrow>
                              <IconButton
                                aria-label="Edit Ingredient"
                                icon={<FiEdit2 />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleOpenEdit(ing)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Ingredient" hasArrow>
                              <IconButton
                                aria-label="Delete Ingredient"
                                icon={<FiTrash2 />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleOpenDelete(ing)}
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

        {/* Add / Edit Ingredient Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleSubmitForm}>
            <ModalHeader>
              {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Ingredient Name</FormLabel>
                  <Input
                    placeholder="e.g. Arabica Coffee Beans, Whole Milk, Sugar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <Flex w="full" gap={4}>
                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Unit of Measure</FormLabel>
                    <Select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="g">g (Grams)</option>
                      <option value="l">l (Liters)</option>
                      <option value="ml">ml (Milliliters)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="packet">packet</option>
                      <option value="box">box</option>
                      <option value="bottle">bottle</option>
                      <option value="can">can</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Cost Per Unit (₹)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPerUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          costPerUnit: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>
                </Flex>

                <Flex w="full" gap={4}>
                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Current Stock</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Reorder Alert Level</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.reorderLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorderLevel: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>
                </Flex>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="isActive" mb="0" fontSize="sm">
                    Active Ingredient
                  </FormLabel>
                  <Switch
                    id="isActive"
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
                {editingIngredient ? 'Save Changes' : 'Create Ingredient'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Stock Adjustment Modal */}
        <Modal isOpen={isAdjustOpen} onClose={onAdjustClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleSubmitAdjust}>
            <ModalHeader>
              Adjust Stock: {adjustingIngredient?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box
                  w="full"
                  p={3}
                  bg={modalInfoBg}
                  borderRadius="lg"
                  fontSize="sm"
                >
                  <Text>
                    Current Stock:{' '}
                    <strong>
                      {adjustingIngredient?.currentStock} {adjustingIngredient?.unit}
                    </strong>
                  </Text>
                  <Text color={subtleText} fontSize="xs" mt={1}>
                    Reorder Threshold: {adjustingIngredient?.reorderLevel} {adjustingIngredient?.unit}
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Adjustment Type</FormLabel>
                  <Select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as StockMovementType)}
                  >
                    <option value="manual_adjustment">Manual Adjustment</option>
                    <option value="purchase">Purchase Received</option>
                    <option value="wastage">Wastage / Spoilage</option>
                    <option value="return">Supplier Return</option>
                    <option value="order_consumption">Kitchen Usage</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">
                    Quantity Change ({adjustingIngredient?.unit})
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Use + to add, - to deduct (e.g. 5 or -2.5)"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Reason for Change</FormLabel>
                  <Input
                    placeholder="e.g. Received new shipment, Broken container, Daily stock count"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAdjustClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                Save Adjustment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Alert */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelDeleteRef}
          onClose={onDeleteClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Ingredient
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete <strong>{deletingIngredient?.name}</strong>?
                This action cannot be undone and will remove it from future inventory tracking.
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

