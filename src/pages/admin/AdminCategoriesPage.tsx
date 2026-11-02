import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Input,
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
  Textarea,
  Switch,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiLayers,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { categoryService } from '../../services/category.service';
import { ICategory } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelDeleteRef = React.useRef<any>(null);

  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
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
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      toast({
        title: 'Failed to load categories',
        description: err?.response?.data?.message || 'Error communicating with backend',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    onFormOpen();
  };

  const handleOpenEdit = (cat: ICategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive,
    });
    onFormOpen();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'Category name is required', status: 'warning', duration: 2500 });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formData);
        toast({ title: 'Category updated', status: 'success', duration: 2500 });
      } else {
        await categoryService.create(formData);
        toast({ title: 'Category created', status: 'success', duration: 2500 });
      }
      onFormClose();
      fetchCategories();
    } catch (err: any) {
      toast({
        title: 'Operation Failed',
        description: err?.response?.data?.message || 'Error saving category',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      await categoryService.delete(categoryToDelete._id);
      toast({ title: 'Category deleted', status: 'info', duration: 2500 });
      onDeleteClose();
      fetchCategories();
    } catch (err: any) {
      toast({
        title: 'Delete Prevented',
        description: err?.response?.data?.message || 'Cannot delete category with associated food items',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Categories Management">
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
              Menu Categories
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Group and structure menu offerings for the customer ordering interface.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchCategories}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync
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
              Add Category
            </Button>
          </HStack>
        </Flex>

        {/* Categories Table */}
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
                <Th color={mutedColor} borderColor={borderColor} w="80px">Order</Th>
                <Th color={mutedColor} borderColor={borderColor}>Category Name</Th>
                <Th color={mutedColor} borderColor={borderColor}>Slug</Th>
                <Th color={mutedColor} borderColor={borderColor}>Description</Th>
                <Th color={mutedColor} borderColor={borderColor}>Status</Th>
                <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12}>
                    <Spinner color={goldAccent} />
                    <Text mt={2} fontSize="sm" color={mutedColor}>Loading categories...</Text>
                  </Td>
                </Tr>
              ) : categories.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color={mutedColor}>
                    No categories found. Create your first category above.
                  </Td>
                </Tr>
              ) : (
                categories.map((cat) => (
                  <Tr key={cat._id} _hover={{ bg: innerCardBg }}>
                    <Td borderColor={borderColor} fontWeight="700" color={goldAccent}>
                      #{cat.displayOrder || 1}
                    </Td>
                    <Td borderColor={borderColor} fontWeight="600" color={textColor}>
                      {cat.name}
                    </Td>
                    <Td borderColor={borderColor} fontSize="12px" color={mutedColor}>
                      {cat.slug}
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" color={mutedColor} maxW="300px">
                      {cat.description || '-'}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={cat.isActive ? 'green' : 'gray'}
                        variant="subtle"
                        fontSize="10px"
                      >
                        {cat.isActive ? 'ACTIVE' : 'HIDDEN'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor} textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <IconButton
                          aria-label="Edit"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          color={textColor}
                          _hover={{ color: goldAccent, bg: innerCardBg }}
                          onClick={() => handleOpenEdit(cat)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          color="red.400"
                          _hover={{ bg: 'rgba(229, 62, 62, 0.1)' }}
                          onClick={() => {
                            setCategoryToDelete(cat);
                            onDeleteOpen();
                          }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Add / Edit Category Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
          <ModalContent as="form" onSubmit={handleSaveCategory} bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
            <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
              {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
            </ModalHeader>
            <ModalCloseButton color={mutedColor} />
            <ModalBody py={5}>
              <FormControl isRequired mb={4}>
                <FormLabel fontSize="xs" color={mutedColor}>Category Name</FormLabel>
                <Input
                  placeholder="e.g. Artisanal Espresso & Brews"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  bg={innerCardBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel fontSize="xs" color={mutedColor}>Description</FormLabel>
                <Textarea
                  placeholder="Summary for customer menu display..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  bg={innerCardBg}
                  borderColor={borderColor}
                  rows={3}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel fontSize="xs" color={mutedColor}>Cover Image URL</FormLabel>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  bg={innerCardBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <Flex justify="space-between" align="center" mt={2}>
                <FormControl maxW="120px">
                  <FormLabel fontSize="xs" color={mutedColor}>Display Order</FormLabel>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center" justifyContent="flex-end" maxW="150px">
                  <FormLabel htmlFor="active-toggle" mb="0" fontSize="xs" color={mutedColor} mr={3}>
                    Is Active
                  </FormLabel>
                  <Switch
                    id="active-toggle"
                    colorScheme="yellow"
                    isChecked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </FormControl>
              </Flex>
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
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Alert */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(5px)">
            <AlertDialogContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Category
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete <Text as="span" fontWeight="bold" color={goldAccent}>"{categoryToDelete?.name}"</Text>? If there are menu items tied to this category, deletion will be blocked by backend integrity rules.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onDeleteClose} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteCategory} ml={3} size="sm" isLoading={isSubmitting}>
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

