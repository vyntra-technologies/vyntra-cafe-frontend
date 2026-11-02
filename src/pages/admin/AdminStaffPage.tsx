import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
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
  useDisclosure,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Textarea,
} from '@chakra-ui/react';
import {
  FiUserCheck,
  FiPlus,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiSlash,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { staffService, CreateStaffPayload } from '../../services/staff.service';
import { IStaff, UserRole, StaffAccountStatus } from '../../types';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<IStaff[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<IStaff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Modals
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isRoleOpen, onOpen: onRoleOpen, onClose: onRoleClose } = useDisclosure();

  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [targetRole, setTargetRole] = useState<UserRole>('WAITER');

  // New Staff Form State
  const [formData, setFormData] = useState<CreateStaffPayload>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'WAITER',
    position: 'Floor Waiter',
    department: 'Service',
    salaryType: 'monthly',
    monthlySalary: 25000,
  });

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchStaffData = async () => {
    try {
      setIsLoading(true);
      const [allStaff, pending] = await Promise.all([
        staffService.getAll(),
        staffService.getPendingApprovals(),
      ]);
      setStaffList(allStaff);
      setPendingApprovals(pending);
    } catch (err: any) {
      toast({
        title: 'Error loading staff records',
        description: err?.response?.data?.message || 'Could not fetch staff directory',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleApprove = async (staffId: string) => {
    try {
      await staffService.approve(staffId);
      toast({ title: 'Staff approved and activated', status: 'success', duration: 2500 });
      fetchStaffData();
    } catch {
      toast({ title: 'Approval failed', status: 'error', duration: 2500 });
    }
  };

  const handleReject = async () => {
    if (!selectedStaff) return;
    try {
      setIsSubmitting(true);
      await staffService.reject(selectedStaff._id, rejectionReason || 'Candidate qualifications did not match requirements');
      toast({ title: 'Staff application rejected', status: 'info', duration: 2500 });
      onRejectClose();
      fetchStaffData();
    } catch (err: any) {
      toast({
        title: 'Rejection Failed',
        description: err?.response?.data?.message || 'Could not reject staff application',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (staffId: string, action: 'activate' | 'suspend' | 'revoke') => {
    try {
      if (action === 'activate') await staffService.activate(staffId);
      if (action === 'suspend') await staffService.suspend(staffId);
      if (action === 'revoke') await staffService.revoke(staffId);

      toast({ title: `Staff status updated to ${action.toUpperCase()}`, status: 'info', duration: 2500 });
      fetchStaffData();
    } catch {
      toast({ title: 'Status update failed', status: 'error', duration: 2500 });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedStaff) return;
    try {
      setIsSubmitting(true);
      await staffService.updateRole(selectedStaff._id, targetRole);
      toast({ title: `Role updated to ${targetRole}`, status: 'success', duration: 2500 });
      onRoleClose();
      fetchStaffData();
    } catch (err: any) {
      toast({
        title: 'Role Update Failed',
        description: err?.response?.data?.message || 'Could not update role',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: 'Please provide all required fields', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      await staffService.create(formData);
      toast({ title: 'Staff account created successfully', status: 'success', duration: 2500 });
      onAddClose();
      fetchStaffData();
    } catch (err: any) {
      toast({
        title: 'Staff Creation Failed',
        description: err?.response?.data?.message || 'Error creating staff record',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: StaffAccountStatus) => {
    switch (status) {
      case 'active':
        return <Badge colorScheme="green" variant="solid">ACTIVE</Badge>;
      case 'pending_approval':
        return <Badge colorScheme="yellow" variant="solid">PENDING</Badge>;
      case 'suspended':
        return <Badge colorScheme="orange" variant="subtle">SUSPENDED</Badge>;
      case 'revoked':
      case 'rejected':
        return <Badge colorScheme="red" variant="subtle">{status.toUpperCase()}</Badge>;
      default:
        return <Badge colorScheme="gray">{status}</Badge>;
    }
  };

  const getUserDetails = (staff: IStaff) => {
    if (typeof staff.userId === 'object' && staff.userId !== null) {
      return staff.userId;
    }
    return { name: staff.employeeId || 'Staff Member', email: '', phone: '', role: 'WAITER' as UserRole };
  };

  return (
    <AdminLayout pageTitle="Staff Operations">
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
              Staff Directory & Approvals
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Manage restaurant personnel, role authorizations, and pending staff onboarding.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchStaffData}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync Roster
            </Button>
            <Button
              leftIcon={<FiPlus />}
              bg={goldAccent}
              color="black"
              size="sm"
              fontWeight="600"
              _hover={{ opacity: 0.9 }}
              onClick={onAddOpen}
            >
              Add Staff Member
            </Button>
          </HStack>
        </Flex>

        {/* Tab Controls */}
        <Tabs
          variant="line"
          colorScheme="yellow"
          onChange={(index) => setActiveTab(index)}
          mb={6}
        >
          <TabList borderColor={borderColor}>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              Active Roster ({staffList.length})
            </Tab>
            <Tab
              fontWeight="600"
              fontSize="sm"
              color={textColor}
              _selected={{ color: goldAccent, borderColor: goldAccent }}
            >
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge ml={2} bg="orange.500" color="white" borderRadius="full">
                  {pendingApprovals.length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* Active Roster */}
            <TabPanel p={0} pt={4}>
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
                      <Th color={mutedColor} borderColor={borderColor}>Employee</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Emp ID</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Role & Dept</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Compensation</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Status</Th>
                      <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={12}>
                          <Spinner color={goldAccent} />
                          <Text mt={2} fontSize="sm" color={mutedColor}>Loading staff directory...</Text>
                        </Td>
                      </Tr>
                    ) : staffList.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={12} color={mutedColor}>
                          No staff accounts found.
                        </Td>
                      </Tr>
                    ) : (
                      staffList.map((staff) => {
                        const user = getUserDetails(staff);
                        return (
                          <Tr key={staff._id} _hover={{ bg: innerCardBg }}>
                            <Td borderColor={borderColor}>
                              <Text fontWeight="600" color={textColor} fontSize="14px">
                                {user.name}
                              </Text>
                              <Text fontSize="11px" color={mutedColor}>
                                {user.email} &bull; {user.phone || 'No phone'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} fontWeight="700" color={goldAccent}>
                              {staff.employeeId}
                            </Td>
                            <Td borderColor={borderColor}>
                              <Badge colorScheme="yellow" variant="subtle" fontSize="10px">
                                {user.role || staff.position}
                              </Badge>
                              <Text fontSize="11px" color={mutedColor}>
                                {staff.department || 'Floor Operations'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} fontSize="13px" color={textColor}>
                              {staff.salaryType === 'monthly' ? `₹${(staff.monthlySalary || 0).toLocaleString()}/mo` : `₹${staff.hourlyRate || 0}/hr`}
                            </Td>
                            <Td borderColor={borderColor}>
                              {getStatusBadge(staff.status)}
                            </Td>
                            <Td borderColor={borderColor} textAlign="right">
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Staff Options"
                                  icon={<FiMoreVertical />}
                                  size="xs"
                                  variant="ghost"
                                  color={mutedColor}
                                />
                                <MenuList bg={cardBg} borderColor={borderColor} minW="160px">
                                  <MenuItem
                                    icon={<FiShield />}
                                    fontSize="12px"
                                    bg="transparent"
                                    _hover={{ bg: innerCardBg, color: goldAccent }}
                                    onClick={() => {
                                      setSelectedStaff(staff);
                                      setTargetRole(user.role || 'WAITER');
                                      onRoleOpen();
                                    }}
                                  >
                                    Assign Role
                                  </MenuItem>
                                  {staff.status === 'suspended' ? (
                                    <MenuItem
                                      icon={<FiCheckCircle />}
                                      fontSize="12px"
                                      bg="transparent"
                                      _hover={{ bg: innerCardBg, color: 'green.400' }}
                                      onClick={() => handleUpdateStatus(staff._id, 'activate')}
                                    >
                                      Activate Account
                                    </MenuItem>
                                  ) : (
                                    <MenuItem
                                      icon={<FiSlash />}
                                      fontSize="12px"
                                      bg="transparent"
                                      color="orange.400"
                                      _hover={{ bg: innerCardBg }}
                                      onClick={() => handleUpdateStatus(staff._id, 'suspend')}
                                    >
                                      Suspend Account
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Pending Approvals */}
            <TabPanel p={0} pt={4}>
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
                      <Th color={mutedColor} borderColor={borderColor}>Candidate</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Target Position</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Contact</Th>
                      <Th color={mutedColor} borderColor={borderColor}>Requested Role</Th>
                      <Th color={mutedColor} borderColor={borderColor} textAlign="right">Decision</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingApprovals.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={12} color={mutedColor}>
                          No pending staff applications awaiting review.
                        </Td>
                      </Tr>
                    ) : (
                      pendingApprovals.map((staff) => {
                        const user = getUserDetails(staff);
                        return (
                          <Tr key={staff._id} _hover={{ bg: innerCardBg }}>
                            <Td borderColor={borderColor}>
                              <Text fontWeight="600" color={textColor} fontSize="14px">
                                {user.name}
                              </Text>
                              <Text fontSize="11px" color={goldAccent}>
                                Emp ID: {staff.employeeId}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} fontSize="13px" color={textColor}>
                              {staff.position} ({staff.department || 'Floor'})
                            </Td>
                            <Td borderColor={borderColor} fontSize="12px" color={mutedColor}>
                              {user.email} &bull; {user.phone}
                            </Td>
                            <Td borderColor={borderColor}>
                              <Badge colorScheme="yellow">{user.role}</Badge>
                            </Td>
                            <Td borderColor={borderColor} textAlign="right">
                              <HStack spacing={2} justify="flex-end">
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  leftIcon={<FiCheckCircle />}
                                  onClick={() => handleApprove(staff._id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<FiXCircle />}
                                  onClick={() => {
                                    setSelectedStaff(staff);
                                    setRejectionReason('');
                                    onRejectOpen();
                                  }}
                                >
                                  Decline
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Add Staff Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl" isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
          <ModalContent as="form" onSubmit={handleCreateStaff} bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
            <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
              Onboard Staff Member
            </ModalHeader>
            <ModalCloseButton color={mutedColor} />
            <ModalBody py={5}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Full Name</FormLabel>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Official Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="rahul@vyntracafe.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Temporary Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Contact Phone</FormLabel>
                  <Input
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  >
                    <option value="WAITER">WAITER</option>
                    <option value="CHEF">CHEF</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="MANAGER">MANAGER</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color={mutedColor}>Position Title</FormLabel>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Department</FormLabel>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Compensation Type</FormLabel>
                  <Select
                    value={formData.salaryType}
                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  >
                    <option value="monthly">Monthly Fixed</option>
                    <option value="hourly">Hourly Rate</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Monthly Salary (₹)</FormLabel>
                  <Input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={borderColor}>
              <Button variant="ghost" size="sm" mr={3} onClick={onAddClose}>
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
                Onboard Personnel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Role Modal */}
        {selectedStaff && (
          <Modal isOpen={isRoleOpen} onClose={onRoleClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Update Staff Role &bull; {selectedStaff.employeeId}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Authorized Access Role</FormLabel>
                  <Select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as UserRole)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  >
                    <option value="WAITER">WAITER (Service Staff)</option>
                    <option value="CHEF">CHEF (Kitchen Display)</option>
                    <option value="CASHIER">CASHIER (POS Terminal)</option>
                    <option value="MANAGER">MANAGER (Operations Administration)</option>
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onRoleClose}>
                  Cancel
                </Button>
                <Button
                  bg={goldAccent}
                  color="black"
                  size="sm"
                  fontWeight="600"
                  isLoading={isSubmitting}
                  onClick={handleUpdateRole}
                >
                  Save Role
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Reject Candidate Modal */}
        {selectedStaff && (
          <Modal isOpen={isRejectOpen} onClose={onRejectClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                Reject Application &bull; {selectedStaff.employeeId}
              </ModalHeader>
              <ModalCloseButton color={mutedColor} />
              <ModalBody py={5}>
                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Rejection Rationale</FormLabel>
                  <Textarea
                    placeholder="Provide justification for rejecting staff candidate..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    rows={3}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                <Button variant="ghost" size="sm" mr={3} onClick={onRejectClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleReject}
                >
                  Confirm Rejection
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </AdminLayout>
  );
};

