import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Select,
  useDisclosure,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import {
  FiTrash2,
  FiRefreshCw,
  FiPlus,
  FiAlertCircle,
  FiTrendingDown,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  StockAdjustmentPayload,
} from '../../../services/inventory.service';
import { IIngredient, IStockMovement } from '../../../types';

export const AdminWasteManagementPage: React.FC = () => {
  const [wasteMovements, setWasteMovements] = useState<IStockMovement[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Log Waste Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [wasteQty, setWasteQty] = useState<string>('');
  const [wasteCause, setWasteCause] = useState<string>('Expired shelf life');
  const [customNote, setCustomNote] = useState<string>('');

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allMovements, allIngredients] = await Promise.all([
        inventoryService.getStockMovements({ limit: 100 }),
        inventoryService.getAllIngredients(true),
      ]);

      const wastageOnly = allMovements.filter((m) => m.type === 'wastage');
      setWasteMovements(wastageOnly);
      setIngredients(allIngredients);
    } catch (err: any) {
      toast({
        title: 'Error loading waste records',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedIngObj = ingredients.find((i) => i._id === selectedIngredientId);
  const calculatedCostLoss =
    selectedIngObj && parseFloat(wasteQty) > 0
      ? parseFloat(wasteQty) * selectedIngObj.costPerUnit
      : 0;

  const handleLogWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId) {
      toast({ title: 'Please select an ingredient', status: 'warning' });
      return;
    }
    const qty = parseFloat(wasteQty);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: 'Please enter a valid quantity wasted', status: 'warning' });
      return;
    }

    if (selectedIngObj && qty > selectedIngObj.currentStock) {
      toast({
        title: 'Insufficient stock',
        description: `Current available stock is only ${selectedIngObj.currentStock} ${selectedIngObj.unit}`,
        status: 'warning',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const reasonText = `${wasteCause}${customNote.trim() ? `: ${customNote.trim()}` : ''}`;
      const payload: StockAdjustmentPayload = {
        quantityChange: -Math.abs(qty), // deduction
        type: 'wastage',
        reason: reasonText,
      };

      await inventoryService.adjustStock(selectedIngredientId, payload);
      toast({ title: 'Waste event logged successfully', status: 'success' });
      onClose();
      // Reset
      setSelectedIngredientId('');
      setWasteQty('');
      setCustomNote('');
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Failed to log waste',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total estimated waste cost across all logged incidents
  const totalFinancialLoss = wasteMovements.reduce((sum, mov) => {
    const ingId = typeof mov.ingredientId === 'object' ? mov.ingredientId._id : mov.ingredientId;
    const ing = ingredients.find((i) => i._id === ingId);
    const cost = ing ? ing.costPerUnit : 0;
    return sum + Math.abs(mov.quantityChange) * cost;
  }, 0);

  return (
    <AdminLayout pageTitle="Waste & Spoilage Tracking">
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
              Waste & Spoilage Management
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Track food waste, expired raw materials, preparation accidents, and calculate financial cost loss.
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
              colorScheme="red"
              size="sm"
              onClick={onOpen}
            >
              Log Spoilage / Waste
            </Button>
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5} mb={8}>
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
                  Total Waste Incidents
                </StatLabel>
                <Icon as={FiTrash2} color="red.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="red.600">
                {isLoading ? <Spinner size="sm" /> : wasteMovements.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Logged in audit trail
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
                  Estimated Financial Loss
                </StatLabel>
                <Icon as={FiTrendingDown} color="red.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="red.600">
                {isLoading ? <Spinner size="sm" /> : `₹${totalFinancialLoss.toFixed(2)}`}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Based on ingredient unit costs
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
                  Kitchen Efficiency
                </StatLabel>
                <Icon as={FiAlertCircle} color="orange.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="orange.500">
                {wasteMovements.length === 0 ? '100%' : 'Audit Active'}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Loss mitigation in progress
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Waste Log Table */}
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
          ) : wasteMovements.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiTrash2 size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No waste incidents recorded
              </Text>
              <Text fontSize="sm" color={subtleText}>
                Great job! Food preparation waste and damaged items will appear here when logged.
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Incident Date</Th>
                    <Th>Ingredient Discarded</Th>
                    <Th isNumeric>Quantity Lost</Th>
                    <Th isNumeric>Estimated Loss (₹)</Th>
                    <Th>Reported Cause / Reason</Th>
                    <Th>Logged By</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {wasteMovements.map((mov) => {
                    const ingId = typeof mov.ingredientId === 'object' ? mov.ingredientId._id : mov.ingredientId;
                    const ing = ingredients.find((i) => i._id === ingId);
                    const name = typeof mov.ingredientId === 'object' ? mov.ingredientId.name : ing?.name || 'Ingredient';
                    const unit = typeof mov.ingredientId === 'object' ? mov.ingredientId.unit : ing?.unit || '';
                    const lossAmount = ing ? Math.abs(mov.quantityChange) * ing.costPerUnit : 0;
                    const performerName =
                      typeof mov.performedBy === 'object' && mov.performedBy !== null
                        ? mov.performedBy.name
                        : 'Staff';

                    return (
                      <Tr key={mov._id} _hover={{ bg: rowHoverBg }}>
                        <Td fontSize="xs" whiteSpace="nowrap" color={subtleText}>
                          {new Date(mov.createdAt).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Td>
                        <Td fontWeight="600">{name}</Td>
                        <Td isNumeric fontWeight="bold" color="red.500">
                          {Math.abs(mov.quantityChange)} {unit}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="red.600">
                          ₹{lossAmount.toFixed(2)}
                        </Td>
                        <Td fontSize="xs" color={subtleText} maxW="250px" isTruncated>
                          {mov.reason}
                        </Td>
                        <Td fontSize="xs">
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

        {/* Log Waste Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleLogWasteSubmit}>
            <ModalHeader>Record Spoilage / Wastage</ModalHeader>
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
                    {ingredients.map((ing) => (
                      <option key={ing._id} value={ing._id}>
                        {ing.name} (Stock: {ing.currentStock} {ing.unit} | ₹{ing.costPerUnit}/{ing.unit})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">
                    Quantity Discarded ({selectedIngObj?.unit || 'units'})
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 2.5"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Primary Cause</FormLabel>
                  <Select
                    value={wasteCause}
                    onChange={(e) => setWasteCause(e.target.value)}
                  >
                    <option value="Expired shelf life">Expired shelf life</option>
                    <option value="Storage temperature breakdown">Storage temperature breakdown</option>
                    <option value="Preparation error / burnt">Preparation error / burnt</option>
                    <option value="Accidental drop / spill">Accidental drop / spill</option>
                    <option value="Damaged packaging in storage">Damaged packaging in storage</option>
                    <option value="Customer complaint / return">Customer complaint / return</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Additional Notes</FormLabel>
                  <Input
                    placeholder="e.g. Refrigerator #2 failed overnight"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  />
                </FormControl>

                {calculatedCostLoss > 0 && (
                  <Box w="full" p={3} bg="red.50" borderRadius="md" borderLeftWidth="4px" borderColor="red.400">
                    <Text fontSize="xs" color="red.700" fontWeight="bold">
                      Calculated Direct Loss: ₹{calculatedCostLoss.toFixed(2)}
                    </Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" type="submit" isLoading={isSubmitting}>
                Confirm Waste Entry
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

