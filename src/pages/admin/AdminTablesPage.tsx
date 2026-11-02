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
  SimpleGrid,
  Badge,
  IconButton,
  Icon,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUsers,
  FiMoreVertical,
  FiCheckCircle,
  FiSlash,
  FiClock,
} from 'react-icons/fi';
import { MdTableRestaurant } from 'react-icons/md';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { tableService } from '../../services/table.service';
import { ITable, TableStatus } from '../../types';

const STATUS_CONFIG: Record<TableStatus, { color: string; label: string }> = {
  available: { color: 'green', label: 'AVAILABLE' },
  occupied: { color: 'red', label: 'OCCUPIED' },
  reserved: { color: 'yellow', label: 'RESERVED' },
  cleaning: { color: 'purple', label: 'CLEANING' },
};

export const AdminTablesPage: React.FC = () => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelDeleteRef = React.useRef<any>(null);

  const [editingTable, setEditingTable] = useState<ITable | null>(null);
  const [tableToDelete, setTableToDelete] = useState<ITable | null>(null);

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    section: 'Main Dining',
    status: 'available' as TableStatus,
    isActive: true,
  });

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const data = await tableService.getAll();
      setTables(data);
    } catch (err: any) {
      toast({
        title: 'Error loading tables',
        description: err?.response?.data?.message || 'Could not communicate with server',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const sections = ['All', ...Array.from(new Set(tables.map((t) => t.section || 'Main Dining')))];

  const filteredTables = tables.filter((t) => {
    const matchesSection = selectedSection === 'All' || t.section === selectedSection;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesSection && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: `T-${tables.length + 1}`,
      capacity: 4,
      section: 'Main Dining',
      status: 'available',
      isActive: true,
    });
    onFormOpen();
  };

  const handleOpenEdit = (table: ITable) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      section: table.section || 'Main Dining',
      status: table.status,
      isActive: table.isActive,
    });
    onFormOpen();
  };

  const handleUpdateStatus = async (tableId: string, status: TableStatus) => {
    try {
      await tableService.updateStatus(tableId, status);
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status } : t))
      );
      toast({ title: `Table status changed to ${status.toUpperCase()}`, status: 'info', duration: 2000 });
    } catch {
      toast({ title: 'Failed to update table status', status: 'error', duration: 2500 });
    }
  };

  const handleReleaseTable = async (tableId: string) => {
    try {
      await tableService.releaseTable(tableId);
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status: 'available', activeOrderId: null } : t))
      );
      toast({ title: 'Table released and marked Available', status: 'success', duration: 2500 });
    } catch {
      toast({ title: 'Failed to release table', status: 'error', duration: 2500 });
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableNumber || formData.capacity <= 0) {
      toast({ title: 'Please provide valid table details', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTable) {
        await tableService.update(editingTable._id, formData);
        toast({ title: 'Table updated successfully', status: 'success', duration: 2500 });
      } else {
        await tableService.create(formData);
        toast({ title: 'New table added to dining floor', status: 'success', duration: 2500 });
      }
      onFormClose();
      fetchTables();
    } catch (err: any) {
      toast({
        title: 'Operation Failed',
        description: err?.response?.data?.message || 'Error saving table',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      setIsSubmitting(true);
      await tableService.delete(tableToDelete._id);
      toast({ title: 'Table removed from floor plan', status: 'info', duration: 2500 });
      onDeleteClose();
      fetchTables();
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.response?.data?.message || 'Could not delete table',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Table Floor Management">
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
              Floor Plan & Table Map
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Live seating availability, capacity assignments, and dining room sections.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchTables}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync Floor
            </Button>
            <Button
              leftIcon={<FiPlus />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              _hover={{ opacity: 0.9 }}
              onClick={handleOpenCreate}
            >
              Add Table
            </Button>
          </HStack>
        </Flex>

        {/* Section Filter Tabs & Status Pills */}
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Tabs
            variant="soft-rounded"
            colorScheme="yellow"
            size="sm"
            onChange={(idx) => setSelectedSection(sections[idx])}
          >
            <TabList overflowX="auto" py={1}>
              {sections.map((sec) => (
                <Tab key={sec} fontSize="12px" fontWeight="600" color={mutedColor}>
                  {sec}
                </Tab>
              ))}
            </TabList>
          </Tabs>

          <HStack spacing={2} overflowX="auto" py={1}>
            {['All', 'available', 'occupied', 'reserved', 'cleaning'].map((st) => (
              <Button
                key={st}
                size="xs"
                variant={selectedStatus === st ? 'solid' : 'outline'}
                bg={selectedStatus === st ? goldAccent : 'transparent'}
                color={selectedStatus === st ? 'black' : textColor}
                borderColor={borderColor}
                textTransform="uppercase"
                fontWeight="600"
                onClick={() => setSelectedStatus(st)}
              >
                {st}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* Floor Cards Grid */}
        {isLoading ? (
          <Flex justify="center" align="center" py={16}>
            <Spinner size="xl" color={goldAccent} />
          </Flex>
        ) : filteredTables.length === 0 ? (
          <Box
            p={12}
            textAlign="center"
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            color={mutedColor}
          >
            <Icon as={MdTableRestaurant} boxSize={12} color={goldAccent} mb={3} />
            <Text fontSize="md" fontWeight="600" color={textColor}>
              No tables found matching your filters.
            </Text>
            <Text fontSize="xs" mt={1}>
              Add tables or adjust section filters to view layout.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
            {filteredTables.map((table) => {
              const statusCfg = STATUS_CONFIG[table.status] || { color: 'gray', label: table.status };
              return (
                <Box
                  key={table._id}
                  p={5}
                  borderRadius="xl"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  position="relative"
                  transition="all 0.2s ease"
                  _hover={{ transform: 'translateY(-2px)', borderColor: goldAccent }}
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box>
                      <HStack spacing={2} align="center">
                        <Icon as={MdTableRestaurant} color={goldAccent} boxSize={5} />
                        <Heading fontSize="xl" color={textColor} fontWeight="700">
                          {table.tableNumber}
                        </Heading>
                      </HStack>
                      <Text fontSize="11px" color={mutedColor} mt={0.5}>
                        Section: {table.section || 'Main Dining'}
                      </Text>
                    </Box>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Table Actions"
                        icon={<FiMoreVertical />}
                        size="xs"
                        variant="ghost"
                        color={mutedColor}
                      />
                      <MenuList bg={cardBg} borderColor={borderColor} minW="150px">
                        <MenuItem
                          icon={<FiEdit2 />}
                          fontSize="12px"
                          bg="transparent"
                          _hover={{ bg: innerCardBg, color: goldAccent }}
                          onClick={() => handleOpenEdit(table)}
                        >
                          Edit Details
                        </MenuItem>
                        {table.status !== 'available' && (
                          <MenuItem
                            icon={<FiCheckCircle />}
                            fontSize="12px"
                            bg="transparent"
                            _hover={{ bg: innerCardBg, color: 'green.400' }}
                            onClick={() => handleReleaseTable(table._id)}
                          >
                            Release Table
                          </MenuItem>
                        )}
                        <MenuItem
                          icon={<FiTrash2 />}
                          fontSize="12px"
                          bg="transparent"
                          color="red.400"
                          _hover={{ bg: innerCardBg }}
                          onClick={() => {
                            setTableToDelete(table);
                            onDeleteOpen();
                          }}
                        >
                          Delete Table
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <HStack spacing={2} mb={4} fontSize="xs" color={mutedColor}>
                    <HStack spacing={1}>
                      <FiUsers />
                      <Text fontWeight="600" color={textColor}>{table.capacity} Seats</Text>
                    </HStack>
                    <Text>&bull;</Text>
                    <Badge
                      colorScheme={statusCfg.color}
                      variant="subtle"
                      fontSize="10px"
                      borderRadius="sm"
                    >
                      {statusCfg.label}
                    </Badge>
                  </HStack>

                  {/* Quick Status Selection Buttons */}
                  <Box pt={3} borderTop="1px solid" borderColor={borderColor}>
                    <Text fontSize="10px" color={mutedColor} mb={2} textTransform="uppercase" fontWeight="700">
                      Quick Status Shift:
                    </Text>
                    <HStack spacing={1}>
                      {(['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]).map((st) => (
                        <Button
                          key={st}
                          size="xs"
                          flex={1}
                          variant={table.status === st ? 'solid' : 'ghost'}
                          colorScheme={STATUS_CONFIG[st].color}
                          fontSize="9px"
                          h="22px"
                          p={0}
                          onClick={() => handleUpdateStatus(table._id, st)}
                        >
                          {st.slice(0, 3).toUpperCase()}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}

        {/* Add / Edit Table Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
          <ModalContent as="form" onSubmit={handleSaveTable} bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
            <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
              {editingTable ? `Edit Table: ${editingTable.tableNumber}` : 'Add New Table'}
            </ModalHeader>
            <ModalCloseButton color={mutedColor} />
            <ModalBody py={5}>
              <FormControl isRequired mb={4}>
                <FormLabel fontSize="xs" color={mutedColor}>Table Number / Code</FormLabel>
                <Input
                  placeholder="e.g. Table 01, VIP-02, Terrace-A"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  bg={innerCardBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Guest Capacity</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Dining Section</FormLabel>
                  <Select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  >
                    <option value="Main Dining">Main Dining</option>
                    <option value="Patio">Patio</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Private Lounge">Private Lounge</option>
                    <option value="Bar Counter">Bar Counter</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs" color={mutedColor}>Initial Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })}
                  bg={innerCardBg}
                  borderColor={borderColor}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={borderColor}>
              <Button variant="ghost" size="sm" mr={3} onClick={onFormClose}>
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
                {editingTable ? 'Save Table' : 'Add to Floor'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Alert */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(5px)">
            <AlertDialogContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Table
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to remove <Text as="span" fontWeight="bold" color={goldAccent}>"{tableToDelete?.tableNumber}"</Text> from the floor layout?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onDeleteClose} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteTable} ml={3} size="sm" isLoading={isSubmitting}>
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

