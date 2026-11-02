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
  useDisclosure,
  useColorModeValue,
  useToast,
  Spinner,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FiShoppingBag,
  FiPlus,
  FiRefreshCw,
  FiCheckCircle,
  FiDollarSign,
  FiXCircle,
  FiEye,
  FiTrash2,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import {
  inventoryService,
  CreatePurchasePayload,
  ReceiveGoodsPayload,
  RecordPaymentPayload,
} from '../../../services/inventory.service';
import {
  IPurchase,
  ISupplier,
  IIngredient,
  PurchaseStatus,
} from '../../../types';

export const AdminPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Create Purchase Order Modal
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [poSupplierId, setPoSupplierId] = useState<string>('');
  const [poInvoiceNumber, setPoInvoiceNumber] = useState<string>('');
  const [poDeliveryDate, setPoDeliveryDate] = useState<string>('');
  const [poNotes, setPoNotes] = useState<string>('');
  const [poItems, setPoItems] = useState<
    Array<{ ingredientId: string; quantity: number; unitCost: number }>
  >([{ ingredientId: '', quantity: 1, unitCost: 0 }]);

  // Receive Goods Modal
  const { isOpen: isReceiveOpen, onOpen: onReceiveOpen, onClose: onReceiveClose } = useDisclosure();
  const [selectedPoForReceive, setSelectedPoForReceive] = useState<IPurchase | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState<string>('');

  // Record Payment Modal
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const [selectedPoForPayment, setSelectedPoForPayment] = useState<IPurchase | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Cancel PO Modal
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [selectedPoForCancel, setSelectedPoForCancel] = useState<IPurchase | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // View PO Details Modal
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [selectedPoDetails, setSelectedPoDetails] = useState<IPurchase | null>(null);

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalReceiveItemBg = useColorModeValue('gray.50', 'gray.700');
  const modalPaymentSummaryBg = useColorModeValue('purple.50', 'purple.900');

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const [purchasesRes, suppliersRes, ingredientsRes] = await Promise.all([
        inventoryService.getAllPurchases({
          status: statusFilter !== 'all' ? (statusFilter as PurchaseStatus) : undefined,
          supplierId: supplierFilter || undefined,
        }),
        inventoryService.getAllSuppliers(),
        inventoryService.getAllIngredients(),
      ]);

      setPurchases(purchasesRes.purchases);
      setSuppliers(suppliersRes);
      setIngredients(ingredientsRes);
    } catch (err: any) {
      toast({
        title: 'Error loading purchase orders',
        description: err.message || 'Could not fetch purchase records',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [statusFilter, supplierFilter]);

  // Create PO Line Items Helpers
  const handleAddItem = () => {
    setPoItems([...poItems, { ingredientId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    if (field === 'ingredientId') {
      const selectedIng = ingredients.find((i) => i._id === value);
      updated[index] = {
        ...updated[index],
        ingredientId: value,
        unitCost: selectedIng ? selectedIng.costPerUnit : 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPoItems(updated);
  };

  const totalPoAmount = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      toast({ title: 'Please select a supplier', status: 'warning' });
      return;
    }
    const validItems = poItems.filter((item) => item.ingredientId && item.quantity > 0);
    if (validItems.length === 0) {
      toast({ title: 'Please add at least one valid item', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreatePurchasePayload = {
        supplierId: poSupplierId,
        items: validItems,
        invoiceNumber: poInvoiceNumber.trim() || undefined,
        expectedDeliveryDate: poDeliveryDate ? new Date(poDeliveryDate).toISOString() : undefined,
        notes: poNotes.trim() || undefined,
      };
      await inventoryService.createPurchase(payload);
      toast({ title: 'Purchase order created successfully', status: 'success' });
      onCreateClose();
      // Reset
      setPoSupplierId('');
      setPoInvoiceNumber('');
      setPoDeliveryDate('');
      setPoNotes('');
      setPoItems([{ ingredientId: '', quantity: 1, unitCost: 0 }]);
      fetchPurchases();
    } catch (err: any) {
      toast({
        title: 'Failed to create purchase order',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Receive Goods Handlers
  const handleOpenReceive = (po: IPurchase) => {
    setSelectedPoForReceive(po);
    const initialQtyMap: Record<string, number> = {};
    po.items.forEach((item) => {
      const ingId = typeof item.ingredientId === 'object' ? item.ingredientId._id : item.ingredientId;
      const remaining = Math.max(0, item.quantity - (item.receivedQuantity || 0));
      initialQtyMap[ingId] = remaining;
    });
    setReceiveQuantities(initialQtyMap);
    setReceiveNotes('');
    onReceiveOpen();
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForReceive) return;

    const itemsToReceive = Object.entries(receiveQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ingredientId, quantity]) => ({ ingredientId, quantity }));

    if (itemsToReceive.length === 0) {
      toast({ title: 'No received quantities entered', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ReceiveGoodsPayload = {
        items: itemsToReceive,
        notes: receiveNotes.trim() || undefined,
      };
      await inventoryService.receiveGoods(selectedPoForReceive._id, payload);
      toast({ title: 'Goods received and inventory stocks updated!', status: 'success' });
      onReceiveClose();
      fetchPurchases();
    } catch (err: any) {
      toast({
        title: 'Receive failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment Handlers
  const handleOpenPayment = (po: IPurchase) => {
    setSelectedPoForPayment(po);
    const remainingToPay = Math.max(0, po.totalAmount - (po.paidAmount || 0));
    setPaymentAmount(remainingToPay.toFixed(2));
    setPaymentMethod('upi');
    setPaymentReference('');
    setPaymentNotes('');
    onPaymentOpen();
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForPayment) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Payment amount must be greater than 0', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: RecordPaymentPayload = {
        amount,
        paymentMethod,
        reference: paymentReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      };
      await inventoryService.recordSupplierPayment(selectedPoForPayment._id, payload);
      toast({ title: 'Payment recorded successfully', status: 'success' });
      onPaymentClose();
      fetchPurchases();
    } catch (err: any) {
      toast({
        title: 'Payment record failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Handlers
  const handleOpenCancel = (po: IPurchase) => {
    setSelectedPoForCancel(po);
    setCancelReason('');
    onCancelOpen();
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForCancel || !cancelReason.trim()) {
      toast({ title: 'Cancellation reason is required', status: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryService.cancelPurchase(selectedPoForCancel._id, cancelReason.trim());
      toast({ title: 'Purchase order cancelled', status: 'info' });
      onCancelClose();
      fetchPurchases();
    } catch (err: any) {
      toast({
        title: 'Cancel failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'received':
        return <Badge colorScheme="green">Received</Badge>;
      case 'partially_received':
        return <Badge colorScheme="purple">Partially Received</Badge>;
      case 'ordered':
        return <Badge colorScheme="blue">Ordered</Badge>;
      case 'draft':
        return <Badge colorScheme="gray">Draft</Badge>;
      case 'cancelled':
        return <Badge colorScheme="red">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout pageTitle="Purchase Orders & Receiving">
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
              Purchase Orders & Receiving
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Issue purchase orders to suppliers, record delivery receipts to auto-replenish stock, and manage vendor payments.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchPurchases}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              size="sm"
              onClick={onCreateOpen}
            >
              Create Purchase Order
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
            <FormControl maxW={{ base: 'full', sm: '200px' }}>
              <Select
                size="sm"
                borderRadius="lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="ordered">Ordered</option>
                <option value="partially_received">Partially Received</option>
                <option value="received">Received</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', sm: '250px' }}>
              <Select
                size="sm"
                borderRadius="lg"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
        </Box>

        {/* PO Table */}
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
          ) : purchases.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiShoppingBag size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No purchase orders found
              </Text>
              <Text fontSize="sm" color={subtleText}>
                Create purchase orders to restock ingredients from your registered suppliers.
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>PO Number</Th>
                    <Th>Supplier</Th>
                    <Th>Order Date</Th>
                    <Th isNumeric>Total Amount</Th>
                    <Th>Payment Status</Th>
                    <Th>Order Status</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {purchases.map((po) => {
                    const supplierName =
                      typeof po.supplierId === 'object' && po.supplierId !== null
                        ? po.supplierId.name
                        : 'Supplier';

                    const canReceive = po.status === 'ordered' || po.status === 'partially_received';
                    const canPay = po.status !== 'cancelled' && (po.paidAmount || 0) < po.totalAmount;
                    const canCancel = po.status === 'ordered' || po.status === 'draft';

                    return (
                      <Tr key={po._id} _hover={{ bg: rowHoverBg }}>
                        <Td fontWeight="600">
                          <Text>{po.purchaseOrderNumber}</Text>
                          {po.invoiceNumber && (
                            <Text fontSize="2xs" color={subtleText}>
                              Inv: {po.invoiceNumber}
                            </Text>
                          )}
                        </Td>
                        <Td>{supplierName}</Td>
                        <Td fontSize="xs" color={subtleText} whiteSpace="nowrap">
                          {new Date(po.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="green.600">
                          ₹{po.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              po.paymentStatus === 'paid'
                                ? 'green'
                                : po.paymentStatus === 'partially_paid'
                                ? 'orange'
                                : 'yellow'
                            }
                            fontSize="2xs"
                          >
                            {po.paymentStatus.replace('_', ' ')}
                          </Badge>
                          <Text fontSize="2xs" color={subtleText} mt={0.5}>
                            Paid: ₹{(po.paidAmount || 0).toLocaleString('en-IN')}
                          </Text>
                        </Td>
                        <Td>{getStatusBadge(po.status)}</Td>
                        <Td textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="View PO Details" hasArrow>
                              <IconButton
                                aria-label="Details"
                                icon={<FiEye />}
                                size="xs"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPoDetails(po);
                                  onDetailsOpen();
                                }}
                              />
                            </Tooltip>
                            {canReceive && (
                              <Tooltip label="Receive Goods" hasArrow>
                                <IconButton
                                  aria-label="Receive"
                                  icon={<FiCheckCircle />}
                                  size="xs"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => handleOpenReceive(po)}
                                />
                              </Tooltip>
                            )}
                            {canPay && (
                              <Tooltip label="Record Payment" hasArrow>
                                <IconButton
                                  aria-label="Pay"
                                  icon={<FiDollarSign />}
                                  size="xs"
                                  colorScheme="purple"
                                  variant="ghost"
                                  onClick={() => handleOpenPayment(po)}
                                />
                              </Tooltip>
                            )}
                            {canCancel && (
                              <Tooltip label="Cancel Order" hasArrow>
                                <IconButton
                                  aria-label="Cancel"
                                  icon={<FiXCircle />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleOpenCancel(po)}
                                />
                              </Tooltip>
                            )}
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

        {/* Create PO Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} isCentered size="2xl">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCreateSubmit}>
            <ModalHeader>Create New Purchase Order</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Flex w="full" gap={4}>
                  <FormControl isRequired flex="1">
                    <FormLabel fontSize="sm">Supplier</FormLabel>
                    <Select
                      placeholder="Select supplier..."
                      value={poSupplierId}
                      onChange={(e) => setPoSupplierId(e.target.value)}
                    >
                      {suppliers.map((sup) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl flex="1">
                    <FormLabel fontSize="sm">Invoice Number</FormLabel>
                    <Input
                      placeholder="e.g. INV-2026-081"
                      value={poInvoiceNumber}
                      onChange={(e) => setPoInvoiceNumber(e.target.value)}
                    />
                  </FormControl>
                </Flex>

                <Flex w="full" gap={4}>
                  <FormControl flex="1">
                    <FormLabel fontSize="sm">Expected Delivery Date</FormLabel>
                    <Input
                      type="date"
                      value={poDeliveryDate}
                      onChange={(e) => setPoDeliveryDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl flex="1">
                    <FormLabel fontSize="sm">Notes</FormLabel>
                    <Input
                      placeholder="Special delivery instructions"
                      value={poNotes}
                      onChange={(e) => setPoNotes(e.target.value)}
                    />
                  </FormControl>
                </Flex>

                <Divider />

                {/* Line Items */}
                <Box w="full">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="xs" textTransform="uppercase" color={subtleText}>
                      Order Line Items
                    </Heading>
                    <Button
                      size="xs"
                      leftIcon={<FiPlus />}
                      colorScheme="brand"
                      variant="ghost"
                      onClick={handleAddItem}
                    >
                      Add Item
                    </Button>
                  </Flex>

                  <VStack spacing={2} align="stretch">
                    {poItems.map((item, idx) => (
                      <Flex key={idx} gap={2} align="center">
                        <Select
                          size="sm"
                          flex="2"
                          placeholder="Select ingredient..."
                          value={item.ingredientId}
                          onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                        >
                          {ingredients.map((ing) => (
                            <option key={ing._id} value={ing._id}>
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </Select>

                        <Input
                          size="sm"
                          type="number"
                          step="0.01"
                          placeholder="Qty"
                          w="90px"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                          }
                        />

                        <Input
                          size="sm"
                          type="number"
                          step="0.01"
                          placeholder="Unit ₹"
                          w="100px"
                          value={item.unitCost}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitCost', parseFloat(e.target.value) || 0)
                          }
                        />

                        <Text fontSize="sm" fontWeight="600" w="90px" textAlign="right">
                          ₹{(item.quantity * item.unitCost).toFixed(2)}
                        </Text>

                        {poItems.length > 1 && (
                          <IconButton
                            aria-label="Remove item"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveItem(idx)}
                          />
                        )}
                      </Flex>
                    ))}
                  </VStack>

                  <Flex justify="flex-end" mt={4} pt={2} borderTopWidth="1px">
                    <Text fontWeight="bold" fontSize="md">
                      Total Estimated Amount:{' '}
                      <Text as="span" color="green.600">
                        ₹{totalPoAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </Text>
                  </Flex>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                Submit Purchase Order
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Receive Goods Modal */}
        <Modal isOpen={isReceiveOpen} onClose={onReceiveClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleReceiveSubmit}>
            <ModalHeader>
              Receive Delivery: {selectedPoForReceive?.purchaseOrderNumber}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color={subtleText}>
                  Confirm incoming quantities received. Validated items will automatically increment live warehouse inventory stock!
                </Text>

                {selectedPoForReceive?.items.map((item) => {
                  const ing = typeof item.ingredientId === 'object' ? item.ingredientId : null;
                  const ingId = ing ? ing._id : (item.ingredientId as string);
                  const name = ing ? ing.name : 'Ingredient';
                  const unit = ing ? ing.unit : '';

                  return (
                    <Flex key={ingId} justify="space-between" align="center" p={2} bg={modalReceiveItemBg} borderRadius="md">
                      <Box>
                        <Text fontWeight="600" fontSize="sm">{name}</Text>
                        <Text fontSize="2xs" color={subtleText}>
                          Ordered: {item.quantity} {unit} | Already Received: {item.receivedQuantity || 0} {unit}
                        </Text>
                      </Box>
                      <HStack>
                        <Input
                          type="number"
                          step="0.01"
                          size="sm"
                          w="100px"
                          value={receiveQuantities[ingId] ?? 0}
                          onChange={(e) =>
                            setReceiveQuantities({
                              ...receiveQuantities,
                              [ingId]: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Text fontSize="xs" color={subtleText}>{unit}</Text>
                      </HStack>
                    </Flex>
                  );
                })}

                <FormControl>
                  <FormLabel fontSize="sm">Receiving Notes / Quality Inspection</FormLabel>
                  <Input
                    placeholder="e.g. All packaging intact, batch expiry verified"
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onReceiveClose}>
                Cancel
              </Button>
              <Button colorScheme="green" type="submit" isLoading={isSubmitting}>
                Confirm Goods Received
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Record Payment Modal */}
        <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handlePaymentSubmit}>
            <ModalHeader>
              Record Payment: {selectedPoForPayment?.purchaseOrderNumber}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box w="full" p={3} bg={modalPaymentSummaryBg} borderRadius="md">
                  <Text fontSize="sm">
                    Total Order: <strong>₹{selectedPoForPayment?.totalAmount.toFixed(2)}</strong>
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    Paid so far: <strong>₹{(selectedPoForPayment?.paidAmount || 0).toFixed(2)}</strong>
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Payment Amount (₹)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Payment Method</FormLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="upi">UPI / Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Corporate Card</option>
                    <option value="cheque">Cheque</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Transaction Reference / UTR</FormLabel>
                  <Input
                    placeholder="e.g. UPI Ref: 123456789"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Notes</FormLabel>
                  <Input
                    placeholder="Optional memo"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPaymentClose}>
                Cancel
              </Button>
              <Button colorScheme="purple" type="submit" isLoading={isSubmitting}>
                Record Payment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Cancel PO Modal */}
        <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCancelSubmit}>
            <ModalHeader>Cancel Purchase Order</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize="sm" mb={4}>
                Are you sure you want to cancel PO <strong>{selectedPoForCancel?.purchaseOrderNumber}</strong>?
              </Text>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Cancellation Reason</FormLabel>
                <Input
                  placeholder="e.g. Supplier out of stock, Duplicate order"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCancelClose}>
                Back
              </Button>
              <Button colorScheme="red" type="submit" isLoading={isSubmitting}>
                Confirm Cancellation
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Details Modal */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Purchase Order: {selectedPoDetails?.purchaseOrderNumber}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedPoDetails && (
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" fontSize="sm">
                    <Box>
                      <Text color={subtleText}>Supplier</Text>
                      <Text fontWeight="600">
                        {typeof selectedPoDetails.supplierId === 'object'
                          ? selectedPoDetails.supplierId.name
                          : 'Supplier'}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text color={subtleText}>Order Status</Text>
                      {getStatusBadge(selectedPoDetails.status)}
                    </Box>
                  </Flex>

                  <Divider />

                  <Heading size="xs" textTransform="uppercase" color={subtleText}>
                    Order Line Items
                  </Heading>
                  <Table size="sm" variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Ingredient</Th>
                        <Th isNumeric>Ordered</Th>
                        <Th isNumeric>Received</Th>
                        <Th isNumeric>Unit Cost</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedPoDetails.items.map((item, idx) => {
                        const ing = typeof item.ingredientId === 'object' ? item.ingredientId : null;
                        const name = ing ? ing.name : 'Ingredient';
                        const unit = ing ? ing.unit : '';

                        return (
                          <Tr key={idx}>
                            <Td fontWeight="500">{name}</Td>
                            <Td isNumeric>{item.quantity} {unit}</Td>
                            <Td isNumeric>{item.receivedQuantity || 0} {unit}</Td>
                            <Td isNumeric>₹{item.unitCost}</Td>
                            <Td isNumeric fontWeight="600">₹{item.totalCost.toFixed(2)}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>

                  <Flex justify="flex-end" pt={2}>
                    <Text fontWeight="bold">
                      Grand Total: ₹{selectedPoDetails.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button size="sm" onClick={onDetailsClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

