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
  Icon,
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
} from '@chakra-ui/react';
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiActivity,
  FiShoppingBag,
  FiCheckCircle,
  FiBox,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  StockAdjustmentPayload,
} from '../../../services/inventory.service';
import { IIngredient } from '../../../types';

export const AdminStockAlertsPage: React.FC = () => {
  const [lowStockAlerts, setLowStockAlerts] = useState<IIngredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Restock Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAlert, setSelectedAlert] = useState<IIngredient | null>(null);
  const [restockQty, setRestockQty] = useState<string>('');
  const [restockReason, setRestockReason] = useState<string>('Quick replenishment from stock alert');

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const modalInfoBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getLowStockAlerts();
      setLowStockAlerts(data);
    } catch (err: any) {
      toast({
        title: 'Error loading stock alerts',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleOpenRestock = (item: IIngredient) => {
    setSelectedAlert(item);
    const deficit = Math.max(1, item.reorderLevel * 2 - item.currentStock);
    setRestockQty(deficit.toString());
    setRestockReason('Stock alert replenishment');
    onOpen();
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    const qty = parseFloat(restockQty);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: 'Enter a valid replenishment quantity', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: StockAdjustmentPayload = {
        quantityChange: qty,
        type: 'purchase',
        reason: restockReason.trim(),
      };
      await inventoryService.adjustStock(selectedAlert._id, payload);
      toast({ title: 'Stock replenished successfully', status: 'success' });
      onClose();
      fetchAlerts();
    } catch (err: any) {
      toast({
        title: 'Replenishment failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const criticalOutOfStock = lowStockAlerts.filter((i) => i.currentStock <= 0);
  const lowStockWarnings = lowStockAlerts.filter((i) => i.currentStock > 0);

  return (
    <AdminLayout pageTitle="Stock Alerts & Safety Thresholds">
      <Box p={{ base: 4, md: 6 }}>
        <InventorySubNav lowStockCount={lowStockAlerts.length} />

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
              Stock Alerts & Reorder Thresholds
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Active raw materials that have fallen below safety inventory reorder points.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchAlerts}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              as={RouterLink}
              to="/admin/inventory/purchases"
              leftIcon={<FiShoppingBag />}
              colorScheme="brand"
              size="sm"
            >
              Go to Purchase Orders
            </Button>
          </HStack>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" py={12}>
            <Spinner size="lg" color="brand.500" />
          </Flex>
        ) : lowStockAlerts.length === 0 ? (
          <Box
            bg={cardBg}
            p={10}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <Icon as={FiCheckCircle} boxSize={12} color="green.500" mb={4} />
            <Heading size="md" fontWeight="bold">
              All Ingredient Stocks Are Healthy!
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={2}>
              No ingredients are currently at or below their reorder thresholds.
            </Text>
          </Box>
        ) : (
          <VStack spacing={6} align="stretch">
            {/* Critical Out-of-Stock Section */}
            {criticalOutOfStock.length > 0 && (
              <Box
                bg={cardBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="red.300"
                boxShadow="sm"
                overflow="hidden"
              >
                <Box bg="red.50" px={4} py={3} borderBottomWidth="1px" borderColor="red.200">
                  <HStack>
                    <Icon as={FiAlertTriangle} color="red.600" />
                    <Heading size="sm" color="red.700">
                      CRITICAL: Completely Out of Stock ({criticalOutOfStock.length} items)
                    </Heading>
                  </HStack>
                  <Text fontSize="xs" color="red.600" mt={0.5}>
                    Menu items depending on these raw materials cannot be prepared in the kitchen.
                  </Text>
                </Box>

                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Ingredient Name</Th>
                        <Th isNumeric>Current Stock</Th>
                        <Th isNumeric>Safety Threshold</Th>
                        <Th isNumeric>Deficit</Th>
                        <Th isNumeric>Cost / Unit</Th>
                        <Th textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {criticalOutOfStock.map((ing) => (
                        <Tr key={ing._id}>
                          <Td fontWeight="bold" color="red.600">{ing.name}</Td>
                          <Td isNumeric fontWeight="bold" color="red.500">
                            0 {ing.unit}
                          </Td>
                          <Td isNumeric color={subtleText}>{ing.reorderLevel} {ing.unit}</Td>
                          <Td isNumeric fontWeight="600" color="red.600">
                            -{ing.reorderLevel} {ing.unit}
                          </Td>
                          <Td isNumeric>₹{ing.costPerUnit.toFixed(2)}</Td>
                          <Td textAlign="center">
                            <Button
                              size="xs"
                              colorScheme="red"
                              leftIcon={<FiActivity />}
                              onClick={() => handleOpenRestock(ing)}
                            >
                              Quick Restock
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            )}

            {/* Low Stock Warning Section */}
            {lowStockWarnings.length > 0 && (
              <Box
                bg={cardBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="orange.300"
                boxShadow="sm"
                overflow="hidden"
              >
                <Box bg="orange.50" px={4} py={3} borderBottomWidth="1px" borderColor="orange.200">
                  <HStack>
                    <Icon as={FiAlertTriangle} color="orange.600" />
                    <Heading size="sm" color="orange.700">
                      Low Stock Warnings ({lowStockWarnings.length} items)
                    </Heading>
                  </HStack>
                  <Text fontSize="xs" color="orange.600" mt={0.5}>
                    These items are approaching depletion. Reorder soon to prevent operational disruption.
                  </Text>
                </Box>

                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Ingredient Name</Th>
                        <Th isNumeric>Current Stock</Th>
                        <Th isNumeric>Safety Threshold</Th>
                        <Th isNumeric>Cost / Unit</Th>
                        <Th isNumeric>Estimated Restock Cost</Th>
                        <Th textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {lowStockWarnings.map((ing) => {
                        const deficit = Math.max(0, ing.reorderLevel - ing.currentStock);
                        const estCost = deficit * ing.costPerUnit;

                        return (
                          <Tr key={ing._id}>
                            <Td fontWeight="600">{ing.name}</Td>
                            <Td isNumeric fontWeight="bold" color="orange.500">
                              {ing.currentStock} {ing.unit}
                            </Td>
                            <Td isNumeric color={subtleText}>{ing.reorderLevel} {ing.unit}</Td>
                            <Td isNumeric>₹{ing.costPerUnit.toFixed(2)}</Td>
                            <Td isNumeric fontWeight="600" color="green.600">
                              ₹{estCost.toFixed(2)}
                            </Td>
                            <Td textAlign="center">
                              <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                leftIcon={<FiActivity />}
                                onClick={() => handleOpenRestock(ing)}
                              >
                                Quick Restock
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            )}
          </VStack>
        )}

        {/* Quick Restock Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleRestockSubmit}>
            <ModalHeader>
              Restock: {selectedAlert?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box w="full" p={3} bg={modalInfoBg} borderRadius="md">
                  <Text fontSize="sm">
                    Current Level: <strong>{selectedAlert?.currentStock} {selectedAlert?.unit}</strong>
                  </Text>
                  <Text fontSize="sm" color={subtleText}>
                    Safety Reorder Level: {selectedAlert?.reorderLevel} {selectedAlert?.unit}
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">
                    Quantity to Add ({selectedAlert?.unit})
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Reason / Note</FormLabel>
                  <Input
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                Save Replenishment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

