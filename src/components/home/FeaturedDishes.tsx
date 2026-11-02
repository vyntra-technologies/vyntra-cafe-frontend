import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Flex,
  Badge,
  useColorModeValue,
  Skeleton,
  Tag,
} from '@chakra-ui/react';
import { FiSearch, FiX, FiRefreshCw, FiGrid, FiSliders } from 'react-icons/fi';
import { menuService } from '../../services/menu.service';
import { categoryService } from '../../services/category.service';
import { IMenuItem, ICategory } from '../../types';
import { FoodCard } from '../common/FoodCard';
import { EmptyState } from '../common/EmptyState';

interface FeaturedDishesProps {
  selectedCategoryId?: string;
  onClearCategory?: () => void;
}

export const FeaturedDishes: React.FC<FeaturedDishesProps> = ({
  selectedCategoryId,
  onClearCategory,
}) => {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'horizontal'>('grid');

  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollStripRef = useRef<HTMLDivElement>(null);

  const isDark = useColorModeValue(false, true);
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF37');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');

  // Synchronize category selection if prop changes from parent (e.g. CategorySection)
  useEffect(() => {
    if (selectedCategoryId) {
      setActiveCategory(selectedCategoryId);
    } else {
      setActiveCategory('all');
    }
  }, [selectedCategoryId]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const [menuRes, catsRes] = await Promise.all([
        menuService.getAll({ limit: 100 }),
        categoryService.getAll().catch(() => []),
      ]);

      setCategories(catsRes);
      // Strictly use real items returned from backend API
      setItems(menuRes.items || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter items by category & search query without hiding valid products
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category Filter
      if (activeCategory && activeCategory !== 'all') {
        const itemCatId =
          typeof item.category === 'object' && item.category !== null
            ? item.category._id
            : item.category;

        const itemCatSlug =
          typeof item.category === 'object' && item.category !== null
            ? item.category.slug
            : undefined;

        const itemCatName =
          typeof item.category === 'object' && item.category !== null
            ? item.category.name
            : undefined;

        const matchesId = itemCatId === activeCategory;
        const matchesSlug = itemCatSlug === activeCategory;
        const matchesName = itemCatName?.toLowerCase() === activeCategory.toLowerCase();

        if (!matchesId && !matchesSlug && !matchesName) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [items, activeCategory, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all' && onClearCategory) {
      onClearCategory();
    }
  };

  return (
    <Box id="menu" ref={sectionRef} py={{ base: 14, md: 22 }} bg={bg} position="relative">
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 10 }}>
        {/* Header Strip */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'flex-end' }}
          mb={8}
          gap={6}
        >
          <Box>
            <Badge
              px={3.5}
              py={1}
              borderRadius="full"
              bg={isDark ? 'rgba(212, 168, 83, 0.12)' : 'rgba(182, 138, 58, 0.12)'}
              border="1px solid"
              borderColor={borderColor}
              color={goldAccent}
              fontSize="xs"
              letterSpacing="0.2em"
              textTransform="uppercase"
              fontWeight="700"
              mb={2}
            >
              CULINARY SELECTIONS
            </Badge>
            <Heading
              as="h2"
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: '32px', sm: '42px', md: '50px' }}
              fontWeight="800"
              color={headingColor}
            >
              Our Menu
            </Heading>
            <Text fontSize="sm" color={textColor} maxW="lg" mt={1}>
              Handcrafted culinary selections prepared daily with artisanal craft and the finest seasonal ingredients.
            </Text>
          </Box>

          {/* Search Bar & View Mode Switcher */}
          <HStack spacing={3} w={{ base: '100%', md: 'auto' }} wrap="wrap">
            {/* View Mode Toggle */}
            <HStack
              bg={isDark ? '#151515' : '#FFFFFF'}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
              p={1}
            >
              <IconButton
                aria-label="Grid view"
                icon={<FiGrid size={15} />}
                size="sm"
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                bg={viewMode === 'grid' ? goldAccent : 'transparent'}
                color={viewMode === 'grid' ? '#0B0B0B' : textColor}
                borderRadius="full"
                onClick={() => setViewMode('grid')}
              />
              <IconButton
                aria-label="Horizontal scroll view"
                icon={<FiSliders size={15} />}
                size="sm"
                variant={viewMode === 'horizontal' ? 'solid' : 'ghost'}
                bg={viewMode === 'horizontal' ? goldAccent : 'transparent'}
                color={viewMode === 'horizontal' ? '#0B0B0B' : textColor}
                borderRadius="full"
                onClick={() => setViewMode('horizontal')}
              />
            </HStack>

            {/* Search Input */}
            <InputGroup maxW={{ base: '100%', md: '280px' }}>
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="full"
                size="md"
                bg={isDark ? '#151515' : '#FFFFFF'}
                border="1px solid"
                borderColor={borderColor}
                color={headingColor}
                fontSize="xs"
                _focus={{ borderColor: goldAccent }}
              />
              {searchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </HStack>
        </Flex>

        {/* Category Filter Tabs */}
        <Box mb={8} overflowX="auto" pb={2}>
          <HStack spacing={2} minW="max-content">
            <Button
              size="sm"
              borderRadius="full"
              px={5}
              h="38px"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.05em"
              variant={activeCategory === 'all' ? 'solid' : 'outline'}
              bg={activeCategory === 'all' ? goldAccent : 'transparent'}
              color={activeCategory === 'all' ? '#0B0B0B' : headingColor}
              borderColor={activeCategory === 'all' ? goldAccent : borderColor}
              _hover={{
                bg: activeCategory === 'all' ? goldAccent : 'rgba(212, 168, 83, 0.12)',
                borderColor: goldAccent,
              }}
              onClick={() => handleSelectCategory('all')}
            >
              All Items ({items.length})
            </Button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat._id || activeCategory === cat.slug;
              // Count how many items in this category
              const catItemCount = items.filter((i) => {
                const cId = typeof i.category === 'object' && i.category ? i.category._id : i.category;
                const cSlug = typeof i.category === 'object' && i.category ? i.category.slug : undefined;
                return cId === cat._id || cSlug === cat.slug;
              }).length;

              return (
                <Button
                  key={cat._id}
                  size="sm"
                  borderRadius="full"
                  px={5}
                  h="38px"
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  variant={isSelected ? 'solid' : 'outline'}
                  bg={isSelected ? goldAccent : 'transparent'}
                  color={isSelected ? '#0B0B0B' : headingColor}
                  borderColor={isSelected ? goldAccent : borderColor}
                  _hover={{
                    bg: isSelected ? goldAccent : 'rgba(212, 168, 83, 0.12)',
                    borderColor: goldAccent,
                  }}
                  onClick={() => handleSelectCategory(cat._id)}
                >
                  {cat.name} {catItemCount > 0 && `(${catItemCount})`}
                </Button>
              );
            })}
          </HStack>
        </Box>

        {/* Content States: Loading, Error, Empty, or Product Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                p={4}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={isDark ? '#151515' : '#FFFFFF'}
              >
                <Skeleton height="200px" borderRadius="xl" mb={4} />
                <Skeleton height="20px" width="70%" mb={2} />
                <Skeleton height="14px" width="90%" mb={2} />
                <Skeleton height="14px" width="50%" mb={4} />
                <Flex justify="space-between" align="center">
                  <Skeleton height="24px" width="30%" />
                  <Skeleton height="32px" width="35%" borderRadius="full" />
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        ) : isError ? (
          <VStack spacing={4} py={16} textAlign="center">
            <Text color="red.400" fontSize="lg" fontWeight="700">
              Unable to load menu selections
            </Text>
            <Text fontSize="sm" color={textColor} maxW="md">
              The restaurant catalog service could not be reached. Please check connection and try again.
            </Text>
            <Button
              leftIcon={<FiRefreshCw />}
              bg={goldAccent}
              color="#0B0B0B"
              borderRadius="full"
              fontWeight="bold"
              px={6}
              onClick={fetchData}
              _hover={{ opacity: 0.9 }}
            >
              Retry Connection
            </Button>
          </VStack>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No Menu Items Found"
            description={
              searchQuery
                ? `No products matched "${searchQuery}". Try clearing search or selecting a different category.`
                : 'No active products are available in this collection.'
            }
            actionText="View All Items"
            onAction={() => {
              setSearchQuery('');
              handleSelectCategory('all');
            }}
          />
        ) : viewMode === 'horizontal' ? (
          /* Horizontal Carousel View */
          <Box
            ref={scrollStripRef}
            display="flex"
            gap={6}
            overflowX="auto"
            pb={6}
            pt={2}
            sx={{
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: goldAccent,
                borderRadius: 'full',
              },
            }}
          >
            {filteredItems.map((item) => (
              <Box
                key={item._id}
                minW={{ base: '280px', sm: '320px', md: '340px' }}
                flexShrink={0}
                style={{ opacity: 1, visibility: 'visible' }}
              >
                <FoodCard item={item} />
              </Box>
            ))}
          </Box>
        ) : (
          /* Responsive Product Grid — Guaranteed High Visibility (opacity: 1) */
          <SimpleGrid
            ref={gridRef}
            columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing={6}
          >
            {filteredItems.map((item) => (
              <Box
                key={item._id}
                style={{ opacity: 1, visibility: 'visible' }}
                transition="transform 0.25s ease"
              >
                <FoodCard item={item} />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};
