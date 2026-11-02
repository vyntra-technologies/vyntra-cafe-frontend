import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Image,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { categoryService } from '../services/category.service';
import { ICategory } from '../types';
import { LoadingState } from '../components/common/LoadingState';

const categoryImages: Record<string, string> = {
  'specialty-coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  'artisan-teas': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  'bakery-pastries': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'gourmet-sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'desserts-sweets': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
};

export const CategoryListingPage: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  useEffect(() => {
    categoryService
      .getAll()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => {
        setCategories([
          { _id: '1', name: 'Specialty Coffee', slug: 'specialty-coffee', description: 'Single origin roasts, flat whites, cold brews and signature macchiatos crafted by master baristas.', displayOrder: 1, isActive: true },
          { _id: '2', name: 'Artisan Teas', slug: 'artisan-teas', description: 'Organic herbal infusions, high-mountain green teas, ceremonial matcha, and spiced masala chais.', displayOrder: 2, isActive: true },
          { _id: '3', name: 'Bakery & Pastries', slug: 'bakery-pastries', description: 'Freshly baked every morning with Normandy butter: croissants, pain au chocolat, scones and artisanal muffins.', displayOrder: 3, isActive: true },
          { _id: '4', name: 'Gourmet Sandwiches', slug: 'gourmet-sandwiches', description: 'Toasted artisan sourdough paninis, French baguettes, and fresh garden salads with premium farm fillings.', displayOrder: 4, isActive: true },
          { _id: '5', name: 'Desserts & Sweets', slug: 'desserts-sweets', description: 'Rich Belgian chocolate cheesecakes, tiramisu, and handcrafted Italian artisan gelatos.', displayOrder: 5, isActive: true },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageContainer>
      <VStack spacing={3} textAlign="center" mb={12}>
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
          CATEGORIES & COLLECTIONS
        </Badge>
        <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          Explore Our Menu By Category
        </Heading>
        <Text fontSize="md" color={textColor} maxW="xl">
          Dive into our carefully curated categories, from single-origin espressos to oven-warm gourmet paninis.
        </Text>
      </VStack>

      {isLoading ? (
        <LoadingState type="cards" count={5} />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {categories.map((cat) => {
            const img = cat.image || categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';

            return (
              <Box
                key={cat._id}
                as={RouterLink}
                to={`/menu?category=${cat._id}`}
                bg={cardBg}
                borderRadius="3xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={borderColor}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-6px)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.12)',
                  borderColor: accentColor,
                  textDecoration: 'none',
                }}
                display="flex"
                flexDirection="column"
              >
                <Box h="220px" overflow="hidden" position="relative">
                  <Image
                    src={img}
                    alt={cat.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.6s ease"
                    _hover={{ transform: 'scale(1.08)' }}
                  />
                  <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.700, transparent)" />
                  <Badge
                    position="absolute"
                    bottom={4}
                    left={4}
                    bg={useColorModeValue('rgba(164, 122, 60, 0.85)', 'rgba(212, 175, 114, 0.85)')}
                    color="#0B0B0B"
                    fontWeight="700"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                  >
                    Explore Category
                  </Badge>
                </Box>

                <VStack p={6} align="flex-start" spacing={3} flex={1} justify="space-between">
                  <Box>
                    <Heading size="md" fontWeight="800" color={headingColor} mb={2}>
                      {cat.name}
                    </Heading>
                    <Text fontSize="sm" color={textColor} lineHeight="tall">
                      {cat.description || 'Artisan handcrafted recipes crafted with passion.'}
                    </Text>
                  </Box>

                  <HStack color={accentColor} fontWeight="700" fontSize="sm" pt={2}>
                    <Text>Browse Items</Text>
                    <FiArrowRight />
                  </HStack>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </PageContainer>
  );
};
