import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  FiActivity,
  FiRefreshCw,
  FiPlus,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  StockAdjustmentPayload,
} from '../../../services/inventory.service';
import {
  IIngredient,
  IStockMovement,
  StockMovementType,
} from '../../../types';

export const AdminStockManagementPage: React.FC = () => {
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [filterIngredientId, setFilterIngredientId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [limit, setLimit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Adjustment Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustType, setAdjustType] = useState<StockMovementType>('manual_adjustment');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchIngredients = async () => {
    try {
      const data = await inventoryService.getAllIngredients(true);
      setIngredients(data);
    } catch (err: any) {
      console.error('Failed to load ingredients', err);
    }
  };

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getStockMovements({
        ingredientId: filterIngredientId || undefined,
        limit,
      });
      setMovements(data);
    } catch (err: any) {
      toast({
        title: 'Error loading movements',
        description: err.message || 'Could not fetch stock movement log',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [filterIngredientId, limit]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId) {
      toast({ title: 'Please select an ingredient', status: 'warning' });
      return;
    }
    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty === 0) {
      toast({ title: 'Quantity change must be non-zero', status: 'warning' });
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
      await inventoryService.adjustStock(selectedIngredientId, payload);
      toast({ title: 'Stock adjusted successfully', status: 'success' });
      onClose();
      // Reset form
      setSelectedIngredientId('');
      setAdjustQuantity('');
      setAdjustReason('');
      fetchMovements();
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

  const getMovementBadgeColor = (type: StockMovementType) => {
    switch (type) {
      case 'purchase':
        return 'green';
      case 'order_consumption':
        return 'purple';
      case 'wastage':
        return 'red';
      case 'manual_adjustment':
        return 'blue';
      case 'return':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const filteredMovements = movements.filter((mov) => {
    if (filterType === 'all') return true;
    return mov.type === filterType;
  });

  return (
    <AdminLayout pageTitle="Stock Operations & Movement Log">
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
              Stock Operations & Audit Log
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Complete historical trail of all stock additions, deductions, waste, returns, and recipe consumptions.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchMovements}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              size="sm"
              onClick={onOpen}
            >
              New Stock Adjustment
            </Button>
          </HStack>
        </Flex>

        {/* Filters Bar */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow="sm"
        >
          <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align="center">
            <FormControl maxW={{ base: 'full', sm: '260px' }}>
              <Select
                size="sm"
                borderRadius="lg"
                value={filterIngredientId}
                onChange={(e) => setFilterIngredientId(e.target.value)}
              >
                <option value="">All Ingredients</option>
                {ingredients.map((ing) => (
                  <option key={ing._id} value={ing._id}>
                    {ing.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', sm: '200px' }}>
              <Select
                size="sm"
                borderRadius="lg"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Movement Types</option>
                <option value="purchase">Purchase</option>
                <option value="manual_adjustment">Manual Adjustment</option>
                <option value="order_consumption">Kitchen Order Consumption</option>
                <option value="wastage">Wastage / Spoilage</option>
                <option value="return">Supplier Return</option>
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', sm: '140px' }}>
              <Select
                size="sm"
                borderRadius="lg"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={25}>Limit 25</option>
                <option value={50}>Limit 50</option>
                <option value={100}>Limit 100</option>
              </Select>
            </FormControl>
          </Flex>
        </Box>

        {/* Movements Table */}
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
          ) : filteredMovements.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiActivity size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No stock movements logged
              </Text>
              <Text fontSize="sm" color={subtleText}>
                Stock adjustments and consumption events will be recorded here automatically.
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Date & Time</Th>
                    <Th>Ingredient</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Previous</Th>
                    <Th isNumeric>Change</Th>
                    <Th isNumeric>New Stock</Th>
                    <Th>Reason / Note</Th>
                    <Th>Performed By</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredMovements.map((mov) => {
                    const ingName =
                      typeof mov.ingredientId === 'object' && mov.ingredientId !== null
                        ? mov.ingredientId.name
                        : 'Ingredient';
                    const ingUnit =
                      typeof mov.ingredientId === 'object' && mov.ingredientId !== null
                        ? mov.ingredientId.unit
                        : '';
                    const performerName =
                      typeof mov.performedBy === 'object' && mov.performedBy !== null
                        ? mov.performedBy.name
                        : 'Staff';

                    const isAddition = mov.quantityChange > 0;

                    return (
                      <Tr key={mov._id} _hover={{ bg: rowHoverBg }}>
                        <Td fontSize="xs" whiteSpace="nowrap" color={subtleText}>
                          {new Date(mov.createdAt).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Td>
                        <Td fontWeight="600">
                          {ingName}{' '}
                          <Text as="span" fontSize="xs" color={subtleText}>
                            ({ingUnit})
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getMovementBadgeColor(mov.type)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {mov.type.replace('_', ' ')}
                          </Badge>
                        </Td>
                        <Td isNumeric color={subtleText}>
                          {mov.previousStock} {ingUnit}
                        </Td>
                        <Td
                          isNumeric
                          fontWeight="bold"
                          color={isAddition ? 'green.500' : 'red.500'}
                        >
                          <HStack spacing={1} justify="flex-end">
                            {isAddition ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                            <Text>
                              {isAddition ? `+${mov.quantityChange}` : mov.quantityChange} {ingUnit}
                            </Text>
                          </HStack>
                        </Td>
                        <Td isNumeric fontWeight="600">
                          {mov.newStock} {ingUnit}
                        </Td>
                        <Td fontSize="xs" maxW="220px" isTruncated color={subtleText}>
                          {mov.reason}
                        </Td>
                        <Td fontSize="xs" whiteSpace="nowrap">
                          <Badge variant="outline" colorScheme="gray">
                            {performerName}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* New Stock Adjustment Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleAdjustSubmit}>
            <ModalHeader>Record Stock Adjustment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Ingredient</FormLabel>
                  <Select
                    placeholder="Select ingredient..."
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                  >
                    {ingredients.map((ing) => (
                      <option key={ing._id} value={ing._id}>
                        {ing.name} (Current: {ing.currentStock} {ing.unit})
                      </option>
                    ))}
                  </Select>
                </FormControl>

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
                    <option value="order_consumption">Kitchen Order Usage</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">
                    Quantity Change (Positive for additions, Negative for deductions)
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10 or -3.5"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Reason</FormLabel>
                  <Input
                    placeholder="e.g. Stock audit variance, Damaged packaging, Received delivery"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                Record Adjustment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

