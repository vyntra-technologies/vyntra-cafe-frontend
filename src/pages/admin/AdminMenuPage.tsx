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
  Image,
  Switch,
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
  Checkbox,
  SimpleGrid,
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
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { menuService } from '../../services/menu.service';
import { categoryService } from '../../services/category.service';
import { uploadService } from '../../services/upload.service';
import { ImageUpload } from '../../components/upload/ImageUpload';
import { IMenuItem, ICategory, IMenuVariant, IMenuAddOn } from '../../types';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals & Dialogs
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelDeleteRef = React.useRef<any>(null);

  // Active Item for Add/Edit/Delete
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<IMenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: 0,
    preparationTimeMinutes: 15,
    imageUrl: '',
    imagePublicId: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isFeatured: false,
    isBestseller: false,
    isAvailable: true,
  });

  const [variants, setVariants] = useState<IMenuVariant[]>([]);
  const [addOns, setAddOns] = useState<IMenuAddOn[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const toast = useToast();

  // Palette tokens
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const innerCardBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.15)', 'rgba(212, 175, 55, 0.15)');
  const tableHeaderBg = useColorModeValue('#FAF9F6', '#111114');

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menuService.getAll({
          page,
          limit: 10,
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
        }),
        categoryService.getAll(),
      ]);

      setItems(menuRes.items);
      setCategories(catRes);
      if (menuRes.pagination) {
        setTotalPages(menuRes.pagination.totalPages || 1);
      }
    } catch (err: any) {
      toast({
        title: 'Error loading menu',
        description: err?.response?.data?.message || 'Could not fetch menu items',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [page, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: categories[0]?._id || '',
      description: '',
      basePrice: 199,
      preparationTimeMinutes: 15,
      imageUrl: '',
      imagePublicId: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isFeatured: false,
      isBestseller: false,
      isAvailable: true,
    });
    setVariants([]);
    setAddOns([]);
    onFormOpen();
  };

  const handleOpenEdit = (item: IMenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: typeof item.category === 'string' ? item.category : item.category?._id || '',
      description: item.description || '',
      basePrice: item.basePrice,
      preparationTimeMinutes: item.preparationTimeMinutes || 15,
      imageUrl: item.images?.[0] || '',
      imagePublicId: (item as any).imagePublicIds?.[0] || '',
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      isGlutenFree: item.isGlutenFree || false,
      isFeatured: item.isFeatured || false,
      isBestseller: item.isBestseller || false,
      isAvailable: item.isAvailable,
    });
    setVariants(item.variants || []);
    setAddOns(item.addOns || []);
    onFormOpen();
  };

  const handleToggleAvailability = async (item: IMenuItem) => {
    try {
      const nextStatus = !item.isAvailable;
      await menuService.setAvailability(item._id, nextStatus);
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: nextStatus } : i))
      );
      toast({
        title: `${item.name} is now ${nextStatus ? 'Available' : 'Unavailable'}`,
        status: 'info',
        duration: 2000,
      });
    } catch {
      toast({ title: 'Failed to update availability', status: 'error', duration: 2000 });
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.basePrice <= 0) {
      toast({ title: 'Please fill all required fields correctly', status: 'warning', duration: 3000 });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        preparationTimeMinutes: Number(formData.preparationTimeMinutes),
        images: formData.imageUrl ? [formData.imageUrl] : [],
        imagePublicIds: formData.imagePublicId ? [formData.imagePublicId] : [],
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        isAvailable: formData.isAvailable,
        variants,
        addOns,
      };

      if (editingItem) {
        await menuService.update(editingItem._id, payload);
        toast({ title: 'Menu item updated', status: 'success', duration: 2500 });
      } else {
        await menuService.create(payload);
        toast({ title: 'New menu item created', status: 'success', duration: 2500 });
      }

      onFormClose();
      fetchMenu();
    } catch (err: any) {
      toast({
        title: 'Operation Failed',
        description: err?.response?.data?.message || 'Error saving menu item',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      await menuService.delete(itemToDelete._id);
      toast({ title: 'Menu item removed', status: 'info', duration: 2500 });
      onDeleteClose();
      fetchMenu();
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err?.response?.data?.message || 'Could not delete item',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Menu Administration">
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
              Menu Catalog
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Manage dishes, pricing, portions, dietary flags, and stock availability.
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="sm"
              onClick={fetchMenu}
              _hover={{ borderColor: goldAccent, color: goldAccent }}
            >
              Sync Catalog
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
              Add Food Item
            </Button>
          </HStack>
        </Flex>

        {/* Filter Bar */}
        <Box
          p={4}
          mb={6}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align={{ base: 'stretch', md: 'center' }}
          >
            <Box flex={1}>
              <Input
                placeholder="Search dishes by name or ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMenu()}
                size="sm"
                bg={innerCardBg}
                borderColor={borderColor}
                color={textColor}
              />
            </Box>

            <Select
              placeholder="All Food Categories"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              size="sm"
              maxW={{ base: '100%', md: '220px' }}
              bg={innerCardBg}
              borderColor={borderColor}
              color={textColor}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Button
              size="sm"
              bg={goldAccent}
              color="black"
              leftIcon={<FiSearch />}
              fontWeight="600"
              onClick={fetchMenu}
            >
              Search
            </Button>
          </Flex>
        </Box>

        {/* Menu Data Table */}
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
                <Th color={mutedColor} borderColor={borderColor} w="70px">Dish</Th>
                <Th color={mutedColor} borderColor={borderColor}>Name & Details</Th>
                <Th color={mutedColor} borderColor={borderColor}>Category</Th>
                <Th color={mutedColor} borderColor={borderColor}>Base Price</Th>
                <Th color={mutedColor} borderColor={borderColor}>Dietary</Th>
                <Th color={mutedColor} borderColor={borderColor}>Available</Th>
                <Th color={mutedColor} borderColor={borderColor} textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={12}>
                    <Spinner color={goldAccent} />
                    <Text mt={2} fontSize="sm" color={mutedColor}>Loading menu items...</Text>
                  </Td>
                </Tr>
              ) : items.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={12} color={mutedColor}>
                    No dishes found in catalog.
                  </Td>
                </Tr>
              ) : (
                items.map((item) => (
                  <Tr key={item._id} _hover={{ bg: innerCardBg }}>
                    <Td borderColor={borderColor}>
                      <Image
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}
                        alt={item.name}
                        w="50px"
                        h="50px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/50"
                      />
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontWeight="600" color={textColor} fontSize="14px">
                        {item.name}
                      </Text>
                      <Text fontSize="11px" color={mutedColor} noOfLines={1} maxW="280px">
                        {item.description || 'Artisan handcrafted recipe'}
                      </Text>
                      <HStack spacing={1} mt={1}>
                        {item.isFeatured && (
                          <Badge colorScheme="purple" fontSize="9px">Featured</Badge>
                        )}
                        {item.isBestseller && (
                          <Badge colorScheme="yellow" fontSize="9px">Bestseller</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor} fontSize="13px" color={mutedColor}>
                      {typeof item.category === 'object' ? item.category?.name : (categories.find((c) => c._id === item.category)?.name || 'General')}
                    </Td>
                    <Td borderColor={borderColor} fontWeight="700" color={goldAccent}>
                      ₹{item.basePrice.toFixed(2)}
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing={1}>
                        {item.isVegetarian && <Badge colorScheme="green" fontSize="10px">VEG</Badge>}
                        {item.isVegan && <Badge colorScheme="teal" fontSize="10px">VEGAN</Badge>}
                        {item.isGlutenFree && <Badge colorScheme="blue" fontSize="10px">GF</Badge>}
                        {!item.isVegetarian && !item.isVegan && (
                          <Badge colorScheme="red" fontSize="10px">NON-VEG</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Switch
                        colorScheme="yellow"
                        isChecked={item.isAvailable}
                        onChange={() => handleToggleAvailability(item)}
                      />
                    </Td>
                    <Td borderColor={borderColor} textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <IconButton
                          aria-label="Edit Item"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          color={textColor}
                          _hover={{ color: goldAccent, bg: innerCardBg }}
                          onClick={() => handleOpenEdit(item)}
                        />
                        <IconButton
                          aria-label="Delete Item"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          color="red.400"
                          _hover={{ bg: 'rgba(229, 62, 62, 0.1)' }}
                          onClick={() => {
                            setItemToDelete(item);
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

          {/* Pagination Controls */}
          <Flex
            justify="space-between"
            align="center"
            p={4}
            borderTop="1px solid"
            borderColor={borderColor}
            fontSize="sm"
            color={mutedColor}
          >
            <Text>
              Page {page} of {totalPages}
            </Text>
            <HStack spacing={2}>
              <IconButton
                aria-label="Previous Page"
                icon={<FiChevronLeft />}
                size="sm"
                variant="outline"
                borderColor={borderColor}
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <IconButton
                aria-label="Next Page"
                icon={<FiChevronRight />}
                size="sm"
                variant="outline"
                borderColor={borderColor}
                isDisabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </HStack>
          </Flex>
        </Box>

        {/* Add / Edit Dish Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} size="2xl" isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
          <ModalContent as="form" onSubmit={handleSaveForm} bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
            <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
              {editingItem ? `Edit Dish: ${editingItem.name}` : 'Add New Menu Item'}
            </ModalHeader>
            <ModalCloseButton color={mutedColor} />
            <ModalBody py={5} maxH="75vh" overflowY="auto">
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" color={mutedColor}>Dish Name</FormLabel>
                    <Input
                      placeholder="e.g. Truffle Infused Risotto"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      bg={innerCardBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" color={mutedColor}>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      bg={innerCardBg}
                      borderColor={borderColor}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Description & Ingredients</FormLabel>
                  <Textarea
                    placeholder="Describe flavour profile, culinary notes and ingredients..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    bg={innerCardBg}
                    borderColor={borderColor}
                    rows={2}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" color={mutedColor}>Base Price (₹)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      bg={innerCardBg}
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color={mutedColor}>Prep Time (Minutes)</FormLabel>
                    <Input
                      type="number"
                      value={formData.preparationTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: parseInt(e.target.value) || 15 })}
                      bg={innerCardBg}
                      borderColor={borderColor}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Cloudinary Image Upload */}
                <FormControl>
                  <FormLabel fontSize="xs" color={mutedColor}>Dish Image (Cloudinary)</FormLabel>
                  <ImageUpload
                    value={formData.imageUrl}
                    publicId={formData.imagePublicId}
                    onChange={(url, publicId) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: url,
                        imagePublicId: publicId || '',
                      }))
                    }
                    folder="menu"
                    label="Upload Dish Image"
                  />
                </FormControl>

                {/* Dietary & Highlight Flags */}
                <Box p={3.5} borderRadius="lg" bg={innerCardBg}>
                  <Text fontSize="xs" fontWeight="700" color={textColor} mb={3}>
                    Dietary & Presentation Attributes
                  </Text>
                  <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    >
                      Vegetarian
                    </Checkbox>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isVegan}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                    >
                      Vegan
                    </Checkbox>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isGlutenFree}
                      onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                    >
                      Gluten-Free
                    </Checkbox>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    >
                      Featured Hero
                    </Checkbox>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isBestseller}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    >
                      Bestseller
                    </Checkbox>
                    <Checkbox
                      colorScheme="yellow"
                      isChecked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    >
                      In Stock
                    </Checkbox>
                  </SimpleGrid>
                </Box>
              </VStack>
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
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Alert */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(5px)">
            <AlertDialogContent bg={cardBg} borderColor={borderColor} border="1px solid" color={textColor}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Menu Item
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete <Text as="span" fontWeight="bold" color={goldAccent}>"{itemToDelete?.name}"</Text>? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onDeleteClose} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteItem} ml={3} size="sm" isLoading={isSubmitting}>
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
export default AdminMenuPage;
