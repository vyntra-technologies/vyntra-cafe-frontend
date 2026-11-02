import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Input,
  IconButton,
  Flex,
  Badge,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiMapPin, FiHome, FiBriefcase } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/common/EmptyState';

export interface SavedAddress {
  id: string;
  label: string; // 'Home', 'Work', 'Other'
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

const STORAGE_KEY = 'vyntra_customer_addresses';

export const AddressManagementPage: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: 'addr-1',
              label: 'Home',
              street: '450 Lexington Avenue, Apt 4B',
              city: 'New York',
              state: 'NY',
              postalCode: '10017',
              isDefault: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  const handleAddAddress = () => {
    if (!street || !city || !state || !postalCode) {
      toast({
        title: 'Missing Details',
        description: 'Please fill in all address fields.',
        status: 'warning',
      });
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label,
      street,
      city,
      state,
      postalCode,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    onClose();
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');

    toast({
      title: 'Address Saved',
      description: 'Your location has been saved to your account.',
      status: 'success',
      duration: 2500,
    });
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast({
      title: 'Address Removed',
      status: 'info',
      duration: 1500,
    });
  };

  return (
    <PageContainer>
      <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb={8} gap={4}>
        <Box>
          <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
            Saved Addresses
          </Heading>
          <Text fontSize="sm" color={textColor} mt={1}>
            Manage your billing locations and pickup contact addresses.
          </Text>
        </Box>
        <Button
          bg={accentColor}
          color={btnTextColor}
          _hover={{ opacity: 0.9 }}
          borderRadius="xl"
          leftIcon={<FiPlus />}
          onClick={onOpen}
        >
          Add New Address
        </Button>
      </Flex>

      {addresses.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No Addresses Saved"
          description="Save your home or office address for fast, convenient checkout receipts."
          actionText="Add Address"
          onAction={onOpen}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {addresses.map((addr) => (
            <Box
              key={addr.id}
              bg={cardBg}
              p={6}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box mb={4}>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Box color={accentColor}>
                      {addr.label === 'Home' ? <FiHome /> : <FiBriefcase />}
                    </Box>
                    <Text fontWeight="800" fontSize="md" color={headingColor}>
                      {addr.label}
                    </Text>
                  </HStack>
                  {addr.isDefault && (
                    <Badge
                      bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
                      color={accentColor}
                      fontSize="10px"
                      borderRadius="md"
                      px={2}
                    >
                      Default
                    </Badge>
                  )}
                </Flex>

                <Text fontSize="sm" color={textColor} mt={2}>
                  {addr.street}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {addr.city}, {addr.state} {addr.postalCode}
                </Text>
              </Box>

              <Flex justify="flex-end" pt={2}>
                <IconButton
                  aria-label="Delete address"
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDelete(addr.id)}
                />
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Add Address Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor}>Add New Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="100%">
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Address Label
                </Text>
                <HStack spacing={2}>
                  {['Home', 'Work', 'Other'].map((l) => (
                    <Button
                      key={l}
                      size="sm"
                      bg={label === l ? accentColor : 'transparent'}
                      color={label === l ? btnTextColor : headingColor}
                      borderWidth="1px"
                      borderColor={label === l ? accentColor : borderColor}
                      borderRadius="xl"
                      onClick={() => setLabel(l)}
                    >
                      {l}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <Box w="100%">
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Street Address
                </Text>
                <Input
                  placeholder="e.g. 124 Gourmet Boulevard"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  borderRadius="xl"
                />
              </Box>

              <SimpleGrid columns={2} spacing={3} w="100%">
                <Box>
                  <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                    City
                  </Text>
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    borderRadius="xl"
                  />
                </Box>
                <Box>
                  <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                    State
                  </Text>
                  <Input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    borderRadius="xl"
                  />
                </Box>
              </SimpleGrid>

              <Box w="100%">
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Postal Code
                </Text>
                <Input
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  borderRadius="xl"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Cancel
            </Button>
            <Button bg={accentColor} color={btnTextColor} _hover={{ opacity: 0.9 }} onClick={handleAddAddress} borderRadius="xl">
              Save Address
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
