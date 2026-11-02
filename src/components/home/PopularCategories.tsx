import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Flex,
  Button,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { categoryService } from '../../services/category.service';
import { ICategory } from '../../types';

const defaultCategoryImages: Record<string, string> = {
  'specialty-coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'artisan-teas': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'bakery-pastries': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'gourmet-sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  'desserts-sweets': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
};

export const PopularCategories: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('#FFFFFF', '#181A1D');
  const borderColor = useColorModeValue('#E8DED1', '#2B2E33');
  const textColor = useColorModeValue('#716B65', '#B5B7BC');
  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  useEffect(() => {
    categoryService
      .getAll()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => {
        // Fallback default categories
        setCategories([
          { _id: '1', name: 'Specialty Coffee', slug: 'specialty-coffee', description: 'Single origin roasts and espresso', displayOrder: 1, isActive: true },
          { _id: '2', name: 'Artisan Teas', slug: 'artisan-teas', description: 'Organic herbal and loose-leaf teas', displayOrder: 2, isActive: true },
          { _id: '3', name: 'Bakery & Pastries', slug: 'bakery-pastries', description: 'Freshly baked croissants, scones and muffins', displayOrder: 3, isActive: true },
          { _id: '4', name: 'Gourmet Sandwiches', slug: 'gourmet-sandwiches', description: 'Handcrafted toasted paninis and baguettes', displayOrder: 4, isActive: true },
          { _id: '5', name: 'Desserts & Sweets', slug: 'desserts-sweets', description: 'Rich cheesecakes and gelato', displayOrder: 5, isActive: true },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Box py={{ base: 12, md: 20 }}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'flex-end' }}
          mb={10}
          gap={4}
        >
          <Box>
            <Text fontSize="xs" fontWeight="700" color={accentColor} letterSpacing="2px" textTransform="uppercase">
              EXPLORE OUR SELECTION
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor} mt={1}>
              Popular Categories
            </Heading>
          </Box>
          <Button
            as={RouterLink}
            to="/categories"
            variant="ghost"
            color={accentColor}
            rightIcon={<FiArrowRight />}
            fontWeight="700"
            _hover={{ bg: 'transparent', transform: 'translateX(4px)' }}
          >
            View All Categories
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={5}>
          {categories.slice(0, 5).map((cat) => {
            const catImage =
              cat.image ||
              defaultCategoryImages[cat.slug] ||
              'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80';

            return (
              <Box
                key={cat._id}
                as={RouterLink}
                to={`/menu?category=${cat._id}`}
                bg={cardBg}
                borderRadius="2xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={borderColor}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                  borderColor: accentColor,
                  textDecoration: 'none',
                }}
                display="flex"
                flexDirection="column"
              >
                <Box h="140px" overflow="hidden" position="relative">
                  <Image
                    src={catImage}
                    alt={cat.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.5s ease"
                    _hover={{ transform: 'scale(1.08)' }}
                  />
                  <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.700, transparent)" />
                </Box>
                <VStack p={4} align="flex-start" spacing={1} flex={1}>
                  <Heading size="xs" fontWeight="700" color={headingColor} noOfLines={1}>
                    {cat.name}
                  </Heading>
                  <Text fontSize="11px" color={textColor} noOfLines={2}>
                    {cat.description || 'Artisan handcrafted recipes'}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

