import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Flex,
  Image,
  useColorModeValue,
  Skeleton,
  Badge,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiRefreshCw, FiArrowRight, FiCheck } from 'react-icons/fi';
import { categoryService } from '../../services/category.service';
import { ICategory } from '../../types';

// High quality culinary photography fallbacks by slug/keyword when backend image is null/empty
const categoryFallbacks: Record<string, string> = {
  'specialty-coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  'artisan-teas': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  'bakery-pastries': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'gourmet-sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'desserts-sweets': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
  'all': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
};

const defaultFallbackImage = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';

interface CategorySectionProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isDark = useColorModeValue(false, true);
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const sectionBg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await categoryService.getAll();
      // Filter active categories and sort by displayOrder
      const activeCats = (data || [])
        .filter((cat) => cat.isActive !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setCategories(activeCats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCardClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const getCategoryImage = (cat: ICategory): string => {
    if (cat.image && (cat.image.startsWith('http') || cat.image.startsWith('data:'))) {
      return cat.image;
    }
    if (cat.slug && categoryFallbacks[cat.slug]) {
      return categoryFallbacks[cat.slug];
    }
    const slugKey = Object.keys(categoryFallbacks).find((key) =>
      cat.name?.toLowerCase().includes(key.replace('-', ' '))
    );
    if (slugKey) {
      return categoryFallbacks[slugKey];
    }
    return defaultFallbackImage;
  };

  return (
    <Box ref={sectionRef} py={{ base: 14, md: 22 }} bg={sectionBg} position="relative">
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 10 }}>
        {/* Section Header */}
        <VStack spacing={3} textAlign="center" mb={12}>
          <Badge
            px={4}
            py={1.5}
            borderRadius="full"
            bg={isDark ? 'rgba(212, 168, 83, 0.12)' : 'rgba(182, 138, 58, 0.12)'}
            border="1px solid"
            borderColor={borderColor}
            color={goldAccent}
            fontSize="xs"
            letterSpacing="0.25em"
            textTransform="uppercase"
            fontWeight="700"
          >
            CULINARY COLLECTIONS
          </Badge>
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            fontSize={{ base: '32px', sm: '44px', md: '52px' }}
            fontWeight="800"
            color={headingColor}
          >
            Explore Our Categories
          </Heading>
          <Text fontSize="sm" color={textColor} maxW="xl">
            Discover delicious dishes from our specially curated menu.
          </Text>
        </VStack>

        {/* Loading Skeletons — Same 1 to 4 Column Grid as Menu Cards */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box
                key={i}
                p={5}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={isDark ? '#151515' : '#FFFFFF'}
              >
                <Skeleton height="210px" borderRadius="xl" mb={4} />
                <Skeleton height="22px" width="65%" mb={2} />
                <Skeleton height="14px" width="85%" mb={4} />
                <Flex justify="space-between" align="center">
                  <Skeleton height="18px" width="30%" />
                  <Skeleton height="34px" width="40%" borderRadius="full" />
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        ) : isError ? (
          /* Error State */
          <VStack spacing={4} py={12} textAlign="center">
            <Text color="red.400" fontSize="md" fontWeight="bold">
              Unable to load menu categories
            </Text>
            <Text fontSize="xs" color={textColor} maxW="md">
              Please check your connection or reload to connect with the restaurant service.
            </Text>
            <Button
              leftIcon={<FiRefreshCw />}
              bg={goldAccent}
              color="#0B0B0B"
              borderRadius="full"
              size="sm"
              fontWeight="bold"
              px={6}
              onClick={fetchCategories}
              _hover={{ opacity: 0.9 }}
            >
              Retry Connection
            </Button>
          </VStack>
        ) : categories.length === 0 ? (
          /* Empty State */
          <VStack spacing={3} py={12} textAlign="center">
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              No Categories Available
            </Text>
            <Text fontSize="xs" color={textColor}>
              Menu categories will be updated soon by our culinary team.
            </Text>
          </VStack>
        ) : (
          /* Categories Grid matching Menu Product Cards sizing (columns: 1, sm: 2, lg: 3, xl: 4, spacing: 6) */
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
            {/* Card 1: All Categories Card */}
            {(() => {
              const isSelected = !selectedCategoryId || selectedCategoryId === 'all';
              return (
                <Box
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={isSelected ? goldAccent : borderColor}
                  borderRadius="2xl"
                  overflow="hidden"
                  cursor="pointer"
                  role="group"
                  transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                  boxShadow={isSelected ? '0 0 25px rgba(212, 168, 83, 0.25)' : 'sm'}
                  _hover={{
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                    borderColor: goldAccent,
                  }}
                  onClick={() => handleCardClick('all')}
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  {/* Top Badge Overlay */}
                  <Flex
                    position="absolute"
                    top={3}
                    left={3}
                    right={3}
                    justifyContent="space-between"
                    alignItems="center"
                    zIndex={2}
                    pointerEvents="none"
                  >
                    <Badge
                      bg={isSelected ? goldAccent : 'rgba(11, 11, 11, 0.75)'}
                      color={isSelected ? '#0B0B0B' : '#FFF3D6'}
                      border="1px solid"
                      borderColor={goldAccent}
                      fontSize="10px"
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="700"
                    >
                      {isSelected ? 'ACTIVE VIEW' : 'COMPLETE CATALOG'}
                    </Badge>
                    {isSelected && (
                      <Badge colorScheme="green" variant="solid" fontSize="10px" px={2} borderRadius="full">
                        ALL ITEMS
                      </Badge>
                    )}
                  </Flex>

                  {/* Dish-sized Thumbnail (210px) */}
                  <Box h="210px" overflow="hidden" position="relative" bg="#0B0B0B">
                    <Image
                      src={categoryFallbacks['all']}
                      alt="All Categories"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                      _groupHover={{ transform: 'scale(1.08)' }}
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      h="60px"
                      bgGradient="linear(to-t, #151515 0%, transparent 100%)"
                    />
                  </Box>

                  {/* Content (p={5}) matching Menu Card */}
                  <VStack p={5} align="stretch" spacing={3} flex={1} justify="space-between">
                    <Box>
                      <Flex justify="space-between" align="baseline">
                        <Text
                          fontFamily="'Playfair Display', serif"
                          fontSize="md"
                          fontWeight="700"
                          color={headingColor}
                          noOfLines={1}
                          _groupHover={{ color: goldAccent }}
                          transition="color 0.2s"
                        >
                          All Categories
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color={textColor} noOfLines={2} mt={1} lineHeight="1.6">
                        Explore our complete artisanal dining collection across all specialty cafe kitchens.
                      </Text>
                    </Box>

                    {/* Bottom Action Section matching FoodCard footer */}
                    <Box pt={2} borderTop="1px solid" borderColor="rgba(212, 168, 83, 0.15)">
                      <HStack justify="space-between" align="center">
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize="9px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                            COLLECTION
                          </Text>
                          <Text
                            fontFamily="'Playfair Display', serif"
                            fontSize="sm"
                            fontWeight="700"
                            color={goldAccent}
                          >
                            {isSelected ? 'Selected' : 'All Dishes'}
                          </Text>
                        </VStack>

                        <Button
                          size="sm"
                          h="34px"
                          bg={isSelected ? goldAccent : 'transparent'}
                          color={isSelected ? '#0B0B0B' : headingColor}
                          variant={isSelected ? 'solid' : 'outline'}
                          borderColor={goldAccent}
                          borderRadius="full"
                          rightIcon={isSelected ? <FiCheck /> : <FiArrowRight />}
                          fontSize="xs"
                          fontWeight="700"
                          px={4}
                          _hover={{
                            bg: goldAccent,
                            color: '#0B0B0B',
                            transform: 'scale(1.04)',
                          }}
                          transition="all 0.2s ease"
                        >
                          {isSelected ? 'Active' : 'View All'}
                        </Button>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              );
            })()}

            {/* Real Backend Category Cards */}
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              const imageUrl = getCategoryImage(cat);

              return (
                <Box
                  key={cat._id}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={isSelected ? goldAccent : borderColor}
                  borderRadius="2xl"
                  overflow="hidden"
                  cursor="pointer"
                  role="group"
                  transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                  boxShadow={isSelected ? '0 0 25px rgba(212, 168, 83, 0.25)' : 'sm'}
                  _hover={{
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                    borderColor: goldAccent,
                  }}
                  onClick={() => handleCardClick(cat._id)}
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  {/* Top Badge Overlay */}
                  <Flex
                    position="absolute"
                    top={3}
                    left={3}
                    right={3}
                    justifyContent="space-between"
                    alignItems="center"
                    zIndex={2}
                    pointerEvents="none"
                  >
                    <Badge
                      bg={isSelected ? goldAccent : 'rgba(11, 11, 11, 0.75)'}
                      color={isSelected ? '#0B0B0B' : '#FFF3D6'}
                      border="1px solid"
                      borderColor={goldAccent}
                      fontSize="10px"
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="700"
                    >
                      {isSelected ? 'FILTER ACTIVE' : 'COLLECTION'}
                    </Badge>
                    {isSelected && (
                      <Badge colorScheme="green" variant="solid" fontSize="10px" px={2} borderRadius="full">
                        SELECTED
                      </Badge>
                    )}
                  </Flex>

                  {/* Dish-sized Thumbnail (210px) */}
                  <Box h="210px" overflow="hidden" position="relative" bg="#0B0B0B">
                    <Image
                      src={imageUrl}
                      alt={cat.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                      _groupHover={{ transform: 'scale(1.08)' }}
                      loading="lazy"
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      h="60px"
                      bgGradient="linear(to-t, #151515 0%, transparent 100%)"
                    />
                  </Box>

                  {/* Content (p={5}) matching Menu Card */}
                  <VStack p={5} align="stretch" spacing={3} flex={1} justify="space-between">
                    <Box>
                      <Flex justify="space-between" align="baseline">
                        <Text
                          fontFamily="'Playfair Display', serif"
                          fontSize="md"
                          fontWeight="700"
                          color={headingColor}
                          noOfLines={1}
                          title={cat.name}
                          _groupHover={{ color: goldAccent }}
                          transition="color 0.2s"
                        >
                          {cat.name}
                        </Text>
                      </Flex>

                      <Text fontSize="xs" color={textColor} noOfLines={2} mt={1} lineHeight="1.6">
                        {cat.description || 'Specially crafted artisan culinary preparations and specialty roasts.'}
                      </Text>
                    </Box>

                    {/* Bottom Action Section matching FoodCard footer */}
                    <Box pt={2} borderTop="1px solid" borderColor="rgba(212, 168, 83, 0.15)">
                      <HStack justify="space-between" align="center">
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize="9px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                            CUISINE
                          </Text>
                          <Text
                            fontFamily="'Playfair Display', serif"
                            fontSize="sm"
                            fontWeight="700"
                            color={goldAccent}
                          >
                            {isSelected ? 'Viewing' : 'Explore'}
                          </Text>
                        </VStack>

                        <Button
                          size="sm"
                          h="34px"
                          bg={isSelected ? goldAccent : 'transparent'}
                          color={isSelected ? '#0B0B0B' : headingColor}
                          variant={isSelected ? 'solid' : 'outline'}
                          borderColor={goldAccent}
                          borderRadius="full"
                          rightIcon={isSelected ? <FiCheck /> : <FiArrowRight />}
                          fontSize="xs"
                          fontWeight="700"
                          px={4}
                          _hover={{
                            bg: goldAccent,
                            color: '#0B0B0B',
                            transform: 'scale(1.04)',
                          }}
                          transition="all 0.2s ease"
                        >
                          {isSelected ? 'Selected' : 'View Dishes'}
                        </Button>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};
