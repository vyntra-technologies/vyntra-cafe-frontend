import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  HStack,
  VStack,
  SimpleGrid,
  Button,
  Badge,
  Select,
  Checkbox,
  Flex,
  useColorModeValue,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch, FiX, FiFilter, FiSliders } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { FoodCard } from '../components/common/FoodCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { menuService } from '../services/menu.service';
import { categoryService } from '../services/category.service';
import { IMenuItem, ICategory } from '../types';

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  const { isOpen: isFilterOpen, onToggle: onToggleFilter } = useDisclosure();

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  // Load categories and menu items
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      categoryService.getAll().catch(() => []),
      menuService.getAll({ limit: 100 }).catch(() => ({ items: [] })),
    ])
      .then(([cats, itemsRes]) => {
        setCategories(cats);
        setMenuItems(itemsRes.items || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 30]);
    setIsVegetarian(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setAvailableOnly(false);
    setSortBy('default');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  // Filtered and Sorted Menu Items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Category
        if (selectedCategory !== 'all') {
          const catId = typeof item.category === 'object' ? item.category._id : item.category;
          if (catId !== selectedCategory) return false;
        }

        // Price
        if (item.basePrice < priceRange[0] || item.basePrice > priceRange[1]) {
          return false;
        }

        // Dietary
        if (isVegetarian && !item.isVegetarian) return false;
        if (isVegan && !item.isVegan) return false;
        if (isGlutenFree && !item.isGlutenFree) return false;

        // Availability
        if (availableOnly && !item.isAvailable) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [
    menuItems,
    searchQuery,
    selectedCategory,
    priceRange,
    isVegetarian,
    isVegan,
    isGlutenFree,
    availableOnly,
    sortBy,
  ]);

  return (
    <PageContainer>
      {/* Header */}
      <VStack spacing={3} textAlign="center" mb={8}>
        <Badge
          bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
          color={accentColor}
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="700"
          letterSpacing="1px"
        >
          ARTISAN CRAFTED DAILY
        </Badge>
        <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          Vyntra Menu & Roastery
        </Heading>
        <Text fontSize="md" color={textColor} maxW="xl">
          Discover our rich palette of single origin coffees, organic teas, Parisian baked goods, and savory handcrafted paninis.
        </Text>
      </VStack>

      {/* Search Bar & Filter Controls */}
      <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mb={8} boxShadow="sm">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
          {/* Search Input */}
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" color={textColor}>
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Search coffee, pastries, paninis, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="xl"
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

          {/* Sort By Dropdown */}
          <Select
            w={{ base: '100%', md: '200px' }}
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            borderRadius="xl"
          >
            <option value="default">Featured / Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </Select>

          {/* Toggle Advanced Filters Button */}
          <Button
            leftIcon={<FiSliders />}
            variant={isFilterOpen ? 'solid' : 'outline'}
            bg={isFilterOpen ? accentColor : 'transparent'}
            color={isFilterOpen ? btnTextColor : headingColor}
            borderColor={borderColor}
            _hover={{ bg: isFilterOpen ? accentColor : useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
            onClick={onToggleFilter}
            borderRadius="xl"
            px={5}
            w={{ base: '100%', md: 'auto' }}
          >
            Filters
          </Button>
        </Flex>

        {/* Collapsible Advanced Filters */}
        <Collapse in={isFilterOpen} animateOpacity>
          <Box pt={6} mt={4} borderTopWidth="1px" borderColor={borderColor}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* Dietary Checkboxes */}
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={3} color={headingColor} textTransform="uppercase" letterSpacing="1px">
                  Dietary Preferences
                </Text>
                <VStack align="flex-start" spacing={2}>
                  <Checkbox isChecked={isVegetarian} onChange={(e) => setIsVegetarian(e.target.checked)} colorScheme="orange">
                    Vegetarian
                  </Checkbox>
                  <Checkbox isChecked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} colorScheme="orange">
                    Vegan
                  </Checkbox>
                  <Checkbox isChecked={isGlutenFree} onChange={(e) => setIsGlutenFree(e.target.checked)} colorScheme="orange">
                    Gluten-Free
                  </Checkbox>
                  <Checkbox isChecked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} colorScheme="orange">
                    In Stock Only
                  </Checkbox>
                </VStack>
              </Box>

              {/* Price Range Slider */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="700" fontSize="xs" color={headingColor} textTransform="uppercase" letterSpacing="1px">
                    Price Range
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color={accentColor}>
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Text>
                </Flex>
                <RangeSlider
                  aria-label={['min', 'max']}
                  defaultValue={[0, 2000]}
                  min={0}
                  max={2000}
                  step={25}
                  value={priceRange}
                  onChange={(val: [number, number]) => setPriceRange(val)}
                  colorScheme="orange"
                  mt={4}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </Box>

              {/* Clear Action */}
              <Flex align="flex-end" justify={{ base: 'flex-start', md: 'flex-end' }}>
                <Button variant="ghost" size="sm" onClick={handleResetFilters} colorScheme="red">
                  Reset All Filters
                </Button>
              </Flex>
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      {/* Category Filter Pills */}
      <Flex overflowX="auto" pb={4} mb={6} gap={2} sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
        <Button
          size="md"
          borderRadius="full"
          px={5}
          bg={selectedCategory === 'all' ? accentColor : 'transparent'}
          color={selectedCategory === 'all' ? btnTextColor : headingColor}
          borderWidth="1px"
          borderColor={selectedCategory === 'all' ? accentColor : borderColor}
          _hover={{ opacity: 0.9 }}
          onClick={() => handleCategorySelect('all')}
          fontWeight="700"
          fontSize="sm"
        >
          All Items ({menuItems.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat._id}
            size="md"
            borderRadius="full"
            px={5}
            bg={selectedCategory === cat._id ? accentColor : 'transparent'}
            color={selectedCategory === cat._id ? btnTextColor : headingColor}
            borderWidth="1px"
            borderColor={selectedCategory === cat._id ? accentColor : borderColor}
            _hover={{ opacity: 0.9 }}
            onClick={() => handleCategorySelect(cat._id)}
            fontWeight="700"
            fontSize="sm"
            whiteSpace="nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </Flex>

      {/* Food Items Grid */}
      {isLoading ? (
        <LoadingState type="cards" count={8} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Dishes Found"
          description="We couldn't find any menu items matching your selected criteria. Try resetting or adjusting your search filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
          {filteredItems.map((item) => (
            <FoodCard key={item._id} item={item} />
          ))}
        </SimpleGrid>
      )}
    </PageContainer>
  );
};
