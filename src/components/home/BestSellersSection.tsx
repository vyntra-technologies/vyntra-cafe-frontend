import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { menuService } from '../../services/menu.service';
import { IMenuItem } from '../../types';
import { FoodCard } from '../common/FoodCard';
import { LoadingState } from '../common/LoadingState';

export const BestSellersSection: React.FC = () => {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  useEffect(() => {
    menuService
      .getAll({ isBestseller: true, limit: 4 })
      .then((res) => {
        if (res.items.length > 0) {
          setItems(res.items);
        } else {
          return menuService.getAll({ limit: 4 }).then((fallbackRes) => {
            setItems(fallbackRes.items);
          });
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && items.length === 0) return null;

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
              GUEST FAVORITES
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor} mt={1}>
              Best-Selling Creations
            </Heading>
          </Box>
          <Button
            as={RouterLink}
            to="/menu"
            variant="ghost"
            color={accentColor}
            rightIcon={<FiArrowRight />}
            fontWeight="700"
            _hover={{ bg: 'transparent', transform: 'translateX(4px)' }}
          >
            See What's Trending
          </Button>
        </Flex>

        {isLoading ? (
          <LoadingState type="cards" count={4} />
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
            {items.map((item) => (
              <FoodCard key={item._id} item={item} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

