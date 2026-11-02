import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  HStack,
  VStack,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiBox,
  FiAlertTriangle,
  FiTrendingUp,
  FiActivity,
  FiPlus,
  FiRefreshCw,
  FiArrowUpRight,
  FiArrowDownRight,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import { inventoryService, StockAdjustmentPayload } from '../../../services/inventory.service';
import {
  IIngredient,
  IStockMovement,
  IInventoryReport,
  StockMovementType,
} from '../../../types';

export const AdminInventoryDashboardPage: React.FC = () => {
  const [report, setReport] = useState<IInventoryReport | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<IIngredient[]>([]);
  const [recentMovements, setRecentMovements] = useState<IStockMovement[]>([]);
  const [allIngredients, setAllIngredients] = useState<IIngredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Adjustment Modal
  const { isOpen: isAdjustOpen, onOpen: onAdjustOpen, onClose: onAdjustClose } = useDisclosure();
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustType, setAdjustType] = useState<StockMovementType>('manual_adjustment');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [reportData, lowStock, movements, ingredients] = await Promise.all([
        inventoryService.getInventoryReport().catch(() => ({
          totalIngredientsTracked: 0,
          lowStockIngredientsCount: 0,
          totalInventoryValuation: 0,
          ingredients: [],
        })),
        inventoryService.getLowStockAlerts().catch(() => []),
        inventoryService.getStockMovements({ limit: 8 }).catch(() => []),
        inventoryService.getAllIngredients().catch(() => []),
      ]);

      setReport(reportData);
      setLowStockAlerts(lowStock);
      setRecentMovements(movements);
      setAllIngredients(ingredients);
    } catch (err: any) {
      toast({
        title: 'Error loading inventory dashboard',
        description: err.message || 'Could not fetch inventory metrics',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAdjust = async (e: React.FormEvent) => {
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
      toast({
        title: 'Stock adjusted successfully',
        status: 'success',
        duration: 3000,
      });
      onAdjustClose();
      // Reset form
      setSelectedIngredientId('');
      setAdjustQuantity('');
      setAdjustReason('');
      // Refresh metrics
      fetchDashboardData();
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

  return (
    <AdminLayout pageTitle="Inventory Dashboard">
      <Box p={{ base: 4, md: 6 }}>
        {/* Navigation Tabs */}
        <InventorySubNav lowStockCount={lowStockAlerts.length} />

        {/* Header with Title and Actions */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading size="lg" fontWeight="700">
              Inventory & Operations Dashboard
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Real-time monitoring of ingredients, stock levels, procurement and valuation.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiActivity />}
              colorScheme="brand"
              size="sm"
              onClick={onAdjustOpen}
            >
              Quick Stock Adjustment
            </Button>
            <Button
              as={RouterLink}
              to="/admin/inventory/purchases"
              leftIcon={<FiPlus />}
              colorScheme="teal"
              size="sm"
            >
              New Purchase Order
            </Button>
          </HStack>
        </Flex>

        {/* Low Stock Urgent Alert Banner */}
        {lowStockAlerts.length > 0 && (
          <Alert
            status="warning"
            borderRadius="xl"
            mb={6}
            variant="left-accent"
            boxShadow="sm"
          >
            <AlertIcon as={FiAlertTriangle} />
            <Box flex="1">
              <AlertTitle fontWeight="bold">
                Low Stock Warning: {lowStockAlerts.length} ingredient(s) are below reorder threshold!
              </AlertTitle>
              <AlertDescription fontSize="sm" mt={0.5}>
                {lowStockAlerts.slice(0, 3).map((ing) => (
                  <Badge key={ing._id} mr={2} colorScheme="red" variant="subtle">
                    {ing.name}: {ing.currentStock} {ing.unit} (Min: {ing.reorderLevel})
                  </Badge>
                ))}
                {lowStockAlerts.length > 3 && `and ${lowStockAlerts.length - 3} more...`}
              </AlertDescription>
            </Box>
            <Button
              as={RouterLink}
              to="/admin/inventory/alerts"
              size="sm"
              colorScheme="orange"
              variant="solid"
            >
              View All Alerts
            </Button>
          </Alert>
        )}

        {/* Key Metrics Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Total Tracked Ingredients
                </StatLabel>
                <Icon as={FiBox} boxSize={5} color="brand.500" />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2}>
                {isLoading ? <Spinner size="sm" /> : report?.totalIngredientsTracked || allIngredients.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Active across cafe recipes
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Low / Critical Stock
                </StatLabel>
                <Icon as={FiAlertTriangle} boxSize={5} color={lowStockAlerts.length > 0 ? 'red.500' : 'green.500'} />
              </Flex>
              <StatNumber
                fontSize="2xl"
                fontWeight="bold"
                mt={2}
                color={lowStockAlerts.length > 0 ? 'red.500' : 'green.500'}
              >
                {isLoading ? <Spinner size="sm" /> : lowStockAlerts.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                {lowStockAlerts.length > 0 ? 'Requires immediate restock' : 'All stocks healthy'}
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Total Stock Valuation
                </StatLabel>
                <Icon as={FiTrendingUp} boxSize={5} color="green.500" />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="green.600">
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  `₹${(report?.totalInventoryValuation || 0).toLocaleString('en-IN')}`
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Current inventory asset value
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Quick Operations
                </StatLabel>
                <Icon as={FiTruck} boxSize={5} color="purple.500" />
              </Flex>
              <HStack mt={3} spacing={2}>
                <Button
                  as={RouterLink}
                  to="/admin/inventory/suppliers"
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                >
                  Suppliers
                </Button>
                <Button
                  as={RouterLink}
                  to="/admin/inventory/waste"
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                >
                  Log Waste
                </Button>
                <Button
                  as={RouterLink}
                  to="/admin/inventory/reports"
                  size="xs"
                  colorScheme="blue"
                  variant="outline"
                >
                  Valuation
                </Button>
              </HStack>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Content Section: 2 Columns (Recent Movements & Top Valued Stock) */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Stock Movements */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            p={5}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={FiActivity} color="brand.500" />
                <Heading size="md" fontWeight="600">
                  Recent Stock Movements
                </Heading>
              </HStack>
              <Button
                as={RouterLink}
                to="/admin/inventory/stock"
                size="xs"
                variant="ghost"
                colorScheme="brand"
              >
                View Full Audit Log →
              </Button>
            </Flex>

            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : recentMovements.length === 0 ? (
              <Text color={subtleText} fontSize="sm" textAlign="center" py={8}>
                No stock movements logged yet.
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Ingredient</Th>
                      <Th>Type</Th>
                      <Th isNumeric>Change</Th>
                      <Th>Reason</Th>
                      <Th>Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentMovements.map((mov) => {
                      const ingName =
                        typeof mov.ingredientId === 'object' && mov.ingredientId !== null
                          ? mov.ingredientId.name
                          : 'Ingredient';
                      const ingUnit =
                        typeof mov.ingredientId === 'object' && mov.ingredientId !== null
                          ? mov.ingredientId.unit
                          : '';

                      return (
                        <Tr key={mov._id}>
                          <Td fontWeight="500">{ingName}</Td>
                          <Td>
                            <Badge colorScheme={getMovementBadgeColor(mov.type)} variant="subtle" fontSize="xs">
                              {mov.type.replace('_', ' ')}
                            </Badge>
                          </Td>
                          <Td isNumeric fontWeight="bold" color={mov.quantityChange >= 0 ? 'green.500' : 'red.500'}>
                            {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange} {ingUnit}
                          </Td>
                          <Td fontSize="xs" maxW="150px" isTruncated color={subtleText}>
                            {mov.reason}
                          </Td>
                          <Td fontSize="xs" color={subtleText} whiteSpace="nowrap">
                            {new Date(mov.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>

          {/* Top Valued Ingredients */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            p={5}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={FiTrendingUp} color="green.500" />
                <Heading size="md" fontWeight="600">
                  Stock Valuation Highlights
                </Heading>
              </HStack>
              <Button
                as={RouterLink}
                to="/admin/inventory/reports"
                size="xs"
                variant="ghost"
                colorScheme="green"
              >
                Full Valuation Report →
              </Button>
            </Flex>

            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : !report?.ingredients || report.ingredients.length === 0 ? (
              <Text color={subtleText} fontSize="sm" textAlign="center" py={8}>
                No ingredient valuation data available.
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Ingredient</Th>
                      <Th isNumeric>Current Stock</Th>
                      <Th isNumeric>Cost / Unit</Th>
                      <Th isNumeric>Total Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {report.ingredients
                      .slice()
                      .sort((a, b) => b.totalValuation - a.totalValuation)
                      .slice(0, 8)
                      .map((item) => (
                        <Tr key={item.id}>
                          <Td fontWeight="500">
                            {item.name}
                            {item.isLowStock && (
                              <Badge ml={2} colorScheme="red" fontSize="2xs">
                                Low
                              </Badge>
                            )}
                          </Td>
                          <Td isNumeric>
                            {item.currentStock} {item.unit}
                          </Td>
                          <Td isNumeric>₹{item.costPerUnit}</Td>
                          <Td isNumeric fontWeight="bold" color="green.600">
                            ₹{item.totalValuation.toLocaleString('en-IN')}
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </SimpleGrid>

        {/* Quick Stock Adjustment Modal */}
        <Modal isOpen={isAdjustOpen} onClose={onAdjustClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleQuickAdjust}>
            <ModalHeader>Quick Stock Adjustment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Select Ingredient</FormLabel>
                  <Select
                    placeholder="Choose ingredient..."
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                  >
                    {allIngredients.map((ing) => (
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
                    <option value="purchase">Purchase / Delivery Received</option>
                    <option value="wastage">Wastage / Spoilage</option>
                    <option value="return">Return to Supplier</option>
                    <option value="order_consumption">Order Kitchen Consumption</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">
                    Quantity Change (use negative for deduction, e.g. -5)
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10 or -2.5"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Reason for Adjustment</FormLabel>
                  <Input
                    placeholder="e.g. Physical inventory count correction"
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
      </Box>
    </AdminLayout>
  );
};

